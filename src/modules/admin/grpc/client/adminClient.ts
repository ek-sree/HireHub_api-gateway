import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '../../../../config';

const PROTO_PATH = path.resolve(__dirname, '../proto/admin.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase:true,
    longs: String,
    enums:String,
    defaults:true,
    oneofs:true,
});

const protoDescription = grpc.loadPackageDefinition(packageDefinition) as any;
const adminProto = protoDescription.admin;

const Adminclient = new adminProto.AdminService(
    `localhost:${config.admin_port}`,
    grpc.credentials.createInsecure()
);

export { Adminclient }

