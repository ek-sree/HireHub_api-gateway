import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.PORT || 5000,
    user_port: process.env.USER_SERVICE_URL,
    jwt_key: process.env.JWT_SECRET_KEY || 'default_jwt_secret_key',
};

console.log(config.user_port);


export default config;