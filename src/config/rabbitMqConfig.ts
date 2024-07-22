import config from './index';

interface RabbitMqConfig {
    rabbitMQ: {
        url: string;
        queues: {
            userQueue: string;
            recruiterQueue: string;
            postQueue: string;
            messageQueue:string;
        };
    };
}

const rabbitMqConfig: RabbitMqConfig = {
    rabbitMQ: {
        url: config.rabbitMq_url,
        queues: {
            userQueue: 'user_queue',
            recruiterQueue: 'recruiter_queue',
            postQueue:'post_queue',
            messageQueue:'message_queue'
        },
    },
};

export default rabbitMqConfig;
