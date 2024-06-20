import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    user_port: process.env.USER_SERVICE_URL,
    recruiter_port: process.env.RECRUITER_SERVICE_URL,
    admin_port: process.env.ADMIN_SERVICE_URL,
    jwt_key: process.env.JWT_SECRET_KEY || 'default_jwt_secret_key',
    rabbitMq_url: process.env.RABBITmq_url
};




export default config;