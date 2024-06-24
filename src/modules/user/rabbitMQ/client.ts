// grpcClient.ts (Assuming this is the client part)
import { Channel, connect, Connection } from 'amqplib';
import rabbitmqConfig from '../../../config/rabbitMqConfig';
import Producer from './producer';
import Consumer from './consumer';
import { EventEmitter } from 'events';

class RabbitMQClient {
    private static instance: RabbitMQClient;
    private connection: Connection | undefined;
    private producerChannel: Channel | undefined;
    private consumerChannel: Channel | undefined;
    private producer: Producer | undefined;
    private consumer: Consumer | undefined;
    private eventEmitter: EventEmitter = new EventEmitter();
    private isInitialized = false;

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RabbitMQClient();
        }
        return this.instance;
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            this.connection = await connect(rabbitmqConfig.rabbitMQ.url);
            [this.producerChannel, this.consumerChannel] = await Promise.all([
                this.connection.createChannel(),
                this.connection.createChannel(),
            ]);

            const { queue: replyQueueName } = await this.consumerChannel.assertQueue('', { exclusive: true });

            this.producer = new Producer(this.producerChannel, replyQueueName, this.eventEmitter);
            this.consumer = new Consumer(this.consumerChannel, replyQueueName, this.eventEmitter);
            await this.consumer.consumeMessages();

            this.isInitialized = true;
        } catch (error) {
            console.error('RabbitMQ error:', error);
        }
    }

    async produce(data: any={}, operation: string) {
        console.log("Is it getting producer?");
        
        if (!this.isInitialized) {
            await this.initialize();
        }
        console.log("ready to send this");
        
        return this.producer?.produceMessage(data, operation);
    }
}

export default RabbitMQClient.getInstance();
