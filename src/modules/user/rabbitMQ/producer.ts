import { Channel } from 'amqplib';
import rabbitmqConfig from '../../../config/rabbitMqConfig';
import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';

export default class Producer {
    constructor(private channel: Channel, private replyQueueName: string, private eventEmitter: EventEmitter) {}

    async produceMessage(data: any={}, operation: string) {
        const uuid = randomUUID();
        this.channel.sendToQueue(rabbitmqConfig.rabbitMQ.queues.userQueue, Buffer.from(JSON.stringify(data)), {
            replyTo: this.replyQueueName,
            correlationId: uuid,
            headers: { function: operation },
        });

        return new Promise((resolve, reject) => {
            this.eventEmitter.once(uuid, async(message) => {
                try {
                    const reply = JSON.parse(message.content.toString());
                    resolve(reply);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}
