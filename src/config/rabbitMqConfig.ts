import config from './index';

interface RabbitMqConfig {
    rabbitMQ: {
        url: string;
        queues: {
            userQueue: string;
            recruiterQueue: string;
        };
    };
}

const rabbitMqConfig: RabbitMqConfig = {
    rabbitMQ: {
        url: config.rabbitMq_url,
        queues: {
            userQueue: 'user_queue',
            recruiterQueue: 'recruiter_queue',
        },
    },
};

export default rabbitMqConfig;
