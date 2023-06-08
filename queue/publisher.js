const amqplib = require('amqplib');

const queueHost = process.env.QUEUE_HOST;
const queueName = process.env.QUEUE_NAME;
const blockStartNumber = process.env.BLOCK_START_NUMBER;
const blockEndNumber = process.env.BLOCK_END_NUMBER;

(async () => {
    try {
        const connection = await amqplib.connect(queueHost);
        const channel = await connection.createChannel();
        
        await channel.assertQueue(queueName);
        console.log('Starting publisher...')
        for (let currentBlockNumber = blockStartNumber; currentBlockNumber <= blockEndNumber; currentBlockNumber++) {
            const message = currentBlockNumber.toString();
            channel.sendToQueue(queueName, Buffer.from(message));
            console.log(" [x] Sent %s", message);
        }

        setTimeout(function () {
            connection.close();
            process.exit(0);
        }, 500);
    } catch (queueError) {
        console.error('Error connecting to the message broker:', queueError);
    }
})();