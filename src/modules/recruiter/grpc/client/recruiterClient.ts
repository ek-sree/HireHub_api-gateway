import * as grpc from '@grpc/grpc-js';
import* as protoLoader from '@grpc/proto-loader';
import path from 'path';
import config from '../../../../config';

const PROTO_PATH =  path.resolve(__dirname, '../proto/recruiter.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase:true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const protoDescription = grpc.loadPackageDefinition(packageDefinition) as any;
const recruiterProto = protoDescription.recruiter;

const RecruiterClient = new recruiterProto.RecruiterService(
    `localhost:${config.recruiter_port}`,
    grpc.credentials.createInsecure()
);

export { RecruiterClient }