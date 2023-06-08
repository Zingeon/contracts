const amqplib = require('amqplib');
const Web3 = require('web3');
const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient(process.env.DB_HOST);
const dbName = process.env.DB_NAME;
const queueHost = process.env.QUEUE_HOST;
const queueName = process.env.QUEUE_NAME;

const web3ApiProviders = [
    "https://babel-api.mainnet.iotex.io",
    "https://babel-api.mainnet.iotex.one",
    "https://iotexrpc.com",
    "https://rpc.ankr.com/iotex",
    "https://iotex-rpc.gateway.pokt.network"
];
let providerIndex = 0;
const web3 = new Web3(web3ApiProviders[providerIndex]);

function getNextProvider() {
    providerIndex = (providerIndex + 1) % web3ApiProviders.length;
    const provider = web3ApiProviders[providerIndex];
    return web3.setProvider(provider);
}

let changeProvider = false;

(async () => {
    try {
        const connection = await amqplib.connect(queueHost);
        const channel = await connection.createChannel();
        channel.prefetch(1);
        console.log('Starting worker...')
        await channel.assertQueue(queueName);

        try {
            await mongoClient.connect();
        } catch (databaseError) {
            console.error('Error connecting to the database:', databaseError);
        }

        const db = mongoClient.db(dbName);
        console.log('Connected to the MongoDB server');
        const collection = db.collection('transactions');

        channel.consume(
            queueName,
            async (message) => {
                try {
                    if (changeProvider) {
                        getNextProvider();
                        console.log('Provider changed...')
                    }
                    const response = await web3.eth.getBlock(message.content.toString(), true);
                    console.log('Recieved block number:', message.content.toString());

                    if (response.transactions.length > 0) {
                        response.transactions.forEach(async transaction => {

                            const document = await collection.findOne({
                                'transactionHash': transaction.hash
                            });

                            if (document !== null) {
                                console.log('Transaction already exists in the database!')
                                return;
                            }

                            await collection.insertOne({
                                'transactionHash': transaction.hash,
                                'transactionFrom': transaction.from,
                                'transactionTo': transaction.to
                            });
                        });
                    }
                    channel.ack(message);
                    changeProvider = false;
                } catch (web3ApiError) {
                    console.log('Failed to reach endpoint.');
                    channel.nack(message, false, true);
                    changeProvider = true;
                }
            })
    } catch (queueError) {
        console.error('Error connecting to the message broker:', queueError);
    }
})();