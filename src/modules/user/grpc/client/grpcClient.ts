import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '../../../../config';

const USER_PROTO_PATH = path.resolve(__dirname, '../proto/user.proto');
const ADMIN_PROTO_PATH = path.resolve(__dirname, '../proto/admin.proto');

const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH,{
    keepCase:true,
    longs: String,
    enums:String,
    defaults:true,
    oneofs:true,
});

const adminPackageDefinition = protoLoader.loadSync(ADMIN_PROTO_PATH,{
    keepCase:true,
    longs: String,
    enums:String,
    defaults:true,
    oneofs:true,
});

const userProtoDescription = grpc.loadPackageDefinition(userPackageDefinition) as any;
const adminProtoDescription = grpc.loadPackageDefinition(adminPackageDefinition) as any;

const userProto = userProtoDescription.user;
const adminProto = adminProtoDescription.admin;

const Userclient = new userProto.UserService(
    `localhost:${config.user_port}`,
    grpc.credentials.createInsecure()
);

const Adminclient = new adminProto.AdminService(
    `localhost:${config.user_port}`,
    grpc.credentials.createInsecure()
);

export { Userclient, Adminclient }

