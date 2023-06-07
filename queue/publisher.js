const amqplib = require('amqplib');

const blockStartNumber = 23224028;
const blockEndNumber = 23226158;

(async () => {
    const connection = await amqplib.connect('amqp://rabbitmq');
    const channel = await connection.createChannel();
    const queue = 'block_number';
    await channel.assertQueue(queue);
    console.log('Starting publisher...')
    for (let currentBlockNumber = blockStartNumber; currentBlockNumber <= blockEndNumber; currentBlockNumber++) {
        const message = currentBlockNumber.toString();
        channel.sendToQueue(queue, Buffer.from(message));
        // console.log(" [x] Sent %s", message);
    }

    setTimeout(function () {
        connection.close();
        process.exit(0);
    }, 500);

})();