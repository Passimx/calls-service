import { version } from '../package.json';
import { AppModule } from './modules/app.module';
import { logger } from './common/logger/logger';
import { useSwagger } from './common/config/swagger/use-swagger';
import { useKafka } from './common/config/kafka/use-kafka';
import { Envs } from './common/envs/env';
import { NestFactory } from '@nestjs/core';


async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });

    if (Envs.swagger.isWriteConfig) useSwagger(app);
    if (Envs.kafka.kafkaIsConnect) await useKafka(app);

    app.enableCors({
        origin: true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    await app.listen(Envs.main.appPort, Envs.main.host);

    const url = await app.getUrl();

    logger.info(
        `Server is running on url: ${url.slice(0, -4)}${Envs.main.appPort} at ${Date()}. Version: '${version}'.`,
    );
    logger.info(`Swagger is running on url: ${url}/${Envs.swagger.path} at ${Date()}. Version: '${version}'.`);
}

bootstrap();
