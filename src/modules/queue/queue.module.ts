import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Envs } from '../../common/envs/env';


@Module({

    imports: [
        ClientsModule.register([
            {
                name: 'media-service',
                transport: Transport.KAFKA,
                options: {
                    client: {
                        brokers: [`${Envs.kafka.host}:${Envs.kafka.port}`],
                        sasl: { username: Envs.kafka.user, password: Envs.kafka.password, mechanism: 'plain' },
                    },
                    producerOnlyMode: true,
                },
            },
        ]),
    ],

})
export class QueueModule {}
