// import amqp,{ Connection, Channel } from "amqplib";
// import rabbitMqConfig from "../../../config/rabbitMqConfig";


// class RabbitMQClient {
//     private static instance: RabbitMQClient;
//     private isInitialized = false;
//     private connection!: Connection;
//     private producerChannel!: Channel;
//     private consumerChannel!: Channel;
//     private producer!: Producer;
//     private consumer!: Consumer:

//     private constructor(){}

//     public static getInstance() {
//         if(!this.instance) {
//             this.instance = new RabbitMQClient();
//         }
//         return this.instance;
//     }

//     async initialize() {
//         if(this.isInitialized){
//             return;
//         }
//         try {
//             this.connection = await amqp.connect(rabbitMqConfig.rabbitMQ.url);
//             this.producerChannel = await this.connection.createChannel();
//             this.consumer = await this.connection.createChannel();

//             this.consumerChannel.assertQueue(rabbitMqConfig.rabbitMQ.queues.adminQueue, {exclusive: true});

//             this.producer = new this.producer(this.producerChannel);
//             this.consumer = new this.consumer(this.consumerChannel, rabbitMqConfig.rabbitMQ.queues.adminQueue);
//             this.consumer.consumeMessage();

//             this.isInitialized = true;
//             console.log("RabbitMQ initilized");
//         } catch (error) {
//             console.error("RabbitMQ initialization error", error);
//         }
//     }

//     async producer(data: any, correlationId: string, replyToQueue: string) {
//         if(!this.isInitialized) {
//            await this.initialize();
//         }
//         return await this.producer.producerMessage(data, correlationId, replyToQueue);
//     }
// }

// export default RabbitMQClient.getInstance()