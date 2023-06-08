const amqplib = require('amqplib');
const Web3 = require('web3');
const { MongoClient } = require('mongodb');
const url = 'mongodb://mongodb';
const mongoClient = new MongoClient(url);
const dbName = 'iotex';
const web3ApiEndpoints = [
    "https://sbabel-api.mainnet.iotex.io",
    "https://babel-api.mainnet.iotex.one",
    "https://iotexrpc.com",
    "https://rpc.ankr.com/iotex",
    "https://iotex-rpc.gateway.pokt.network"
];

let urlIndex = 0;

function getNextProvider() {
    const url = web3ApiEndpoints[urlIndex];
    urlIndex = (urlIndex + 1) % web3ApiEndpoints.length;

    return new Web3(url);
}

let web3 = getNextProvider();
let changeProvider = false;

(async () => {
    try {
        const connection = await amqplib.connect('amqp://rabbitmq');

        const channel = await connection.createChannel();
        channel.prefetch(1);
        const queue = 'block_numbers';
        console.log('Starting worker...')
        await channel.assertQueue(queue);

        try {
            await mongoClient.connect();
        } catch (databaseError) {
            console.error('Error connecting to the database:', databaseError);
        }

        const db = mongoClient.db(dbName);
        console.log('Connected to the MongoDB server');
        const collection = db.collection('transactions');

        channel.consume(
            queue,
            async (message) => {
                try {
                    if (changeProvider) {
                        console.log('Provider changed...')
                        web3 = getNextProvider();
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