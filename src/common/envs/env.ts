import * as process from 'process';
import { config } from 'dotenv';
import { NumbersUtils } from '../utils/numbers.utils';
import { BooleanUtils } from './boolean.utils';

config();

export const Envs = {
    main: {
        host: '0.0.0.0',
        appPort: NumbersUtils.toNumberOrDefault(process.env.FILES_SERVICE_APP_PORT, 6040),
    },

    kafka: {
        host: process.env.KAFKA_HOST || 'kafka',
        port: NumbersUtils.toNumberOrDefault(process.env.KAFKA_EXTERNAL_PORT, 9094),
        user: process.env.KAFKA_CLIENT_USERS || 'user',
        password: process.env.KAFKA_USER_PASSWORD || 'bitnami',
        groupId: process.env.CHATS_SERVICE_KAFKA_GROUP_ID || 'calls-service',
        kafkaIsConnect: BooleanUtils.strToBoolWithDefault(process.env.KAFKA_IS_CONNECT, true),
    },

    swagger: {
        path: process.env.SWAGGER_PATH || 'docs',
        isWriteConfig: BooleanUtils.strToBoolWithDefault(process.env.SWAGGER_IS_WRITE_CONFIG, true),
        url: `http://localhost:${process.env.APP_PORT ?? 3000}`,
        description: 'development',
    },
};
