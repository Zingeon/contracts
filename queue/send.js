const amqplib = require('amqplib');

const blockStartNumber = 23224028;
const blockEndNumber = 23226158;

(async () => {
    const connection = await amqplib.connect('amqp://guest:guest@rabbitmq:15672');
    const channel = await connection.createChannel();
    const queue = 'block_number';
    await channel.assertQueue(queue);

    for (let currentBlockNumber = blockStartNumber; currentBlockNumber <= blockEndNumber; currentBlockNumber++) {
        const message = currentBlockNumber.toString();
        channel.sendToQueue(queue, Buffer.from(message));
        console.log(" [x] Sent %s", message);
    }

    setTimeout(function () {
        connection.close();
        process.exit(0);
    }, 500);

})();