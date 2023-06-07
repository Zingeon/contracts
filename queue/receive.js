const amqplib = require('amqplib');
const Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider || "https://babel-api.mainnet.iotex.io");
const { MongoClient } = require('mongodb');
const url = 'mongodb://0.0.0.0:27017';
const mongoClient = new MongoClient(url);
const dbName = 'iotex';


let isConsuming = true;

(async () => {
    const connection = await amqplib.connect('amqp://guest:guest@rabbitmq:15672');
    const channel = await connection.createChannel();
    const queue = 'block_number';
    await channel.assertQueue(queue);
    while (isConsuming) {
        if (!isConsuming) {
            break;
        }
        const message = await channel.get(queue);

        if (message === false) {
            break;
        }

        await web3.eth.getBlock(message.content.toString(), true).then(async (response) => {
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
                        }, function(err, res) {
                            if (err) throw err;
                            console.log("1 document inserted");
                            db.close();
                          });
                    });
                }

                channel.ack(message);
              } catch (error) {
                console.error('Error creating the database:', error);
              }
        }
        );
    }
})();