const amqplib = require('amqplib');
const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider || "https://babel-api.mainnet.iotex.io");
const { MongoClient } = require('mongodb');
const url = 'mongodb://mongodb:27017';
const mongoClient = new MongoClient(url);
const dbName = 'iotex';

(async () => {
    try {
        const connection = await amqplib.connect('amqp://rabbitmq');
        const channel = await connection.createChannel();
        channel.prefetch(1);
        const queue = 'block_numbers';
        console.log('Starting worker...')
        await channel.assertQueue(queue);

        channel.consume(
            queue,
            async (message) => {
                console.log(`Received message: ${message.content.toString()}`);
                const response = await web3.eth.getBlock(message.content.toString(), true);
                console.log('Recieved block number:', message.content.toString());
                try {
                    await mongoClient.connect();
                    const db = mongoClient.db(dbName);
                    console.log('Connected to the MongoDB server');
                    const collection = db.collection('transactions');
                    if(response.transactions.length > 0) {
                        response.transactions.forEach(transaction => {
                            collection.insertOne({
                                'transactionFrom': transaction.from, 
                                'transactionTo': transaction.to
                            }, function(insertionError, res) {
                                if (insertionError) {
                                    throw insertionError;
                                }
                                console.log("1 document inserted");
                                db.close();
                              });
                        });
                    }
                    channel.ack(message);
                } catch (databaseError) {
                    console.error('Error connecting to the database:', databaseError);
                }
            })
    } catch (queueError) {
        console.error('Error connecting to the message broker:', queueError);
    }
})();