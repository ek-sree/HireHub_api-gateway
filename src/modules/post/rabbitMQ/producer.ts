import { Channel } from "amqplib";
import rabbitMqConfig from "../../../config/rabbitMqConfig";
import { randomUUID } from "crypto";
import EventEmitter from "events";

export default class Producer {
    constructor(private channel: Channel, private replyQueueName: string, private eventEmitter: EventEmitter) {}

    async produceMessage(data: any={}, operation: string) {
        
        const correlationId = randomUUID();
        console.log("data gonna sent",data);
        this.channel.sendToQueue(rabbitMqConfig.rabbitMQ.queues.postQueue, Buffer.from(JSON.stringify(data)), {
            replyTo: this.replyQueueName,
            correlationId,
            headers: { function: operation },
        });

        return new Promise((resolve, reject)=>{
            this.eventEmitter.once(correlationId, (message)=>{
                try {
                    const reply = JSON.parse(message.content.toString());
                    console.log("replt",reply);
                    
                    resolve(reply);
                } catch (error) {
                    reject(error);
                }
            })
        })
    }
}