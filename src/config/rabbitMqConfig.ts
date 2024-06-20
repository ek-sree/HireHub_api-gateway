import config from "./index";

export default {
    rabbitMQ:{
        url: config.rabbitMq_url,
        queues: {
            adminQueue: "admin_queue"
        }
    }
}