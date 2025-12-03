import * as os from 'os';
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as mediasoup from 'mediasoup';
import { WorkerData } from './types/worker.interface';

@Injectable()
export class MediasoupService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MediasoupService.name);
    private nextWorkerIndex = 0;
    private workers: WorkerData[] = [];

    constructor() {}

    public async onModuleInit() {
        const numWorkers = parseInt(process.env.MEDIASOUP_NUM_WORKERS || String(os.cpus().length), 10);
        this.logger.log(`Initializing ${numWorkers} MediaSoup workers...`);

        for (let i = 0; i < numWorkers; ++i) {
            await this.createWorker();
        }

        this.logger.log('All MediaSoup workers initialized');
    }

    async onModuleDestroy() {
        this.logger.log('Closing all MediaSoup workers...');
        await Promise.all(this.workers.map((w) => w.worker.close()));
        this.logger.log('All MediaSoup workers closed');
    }

    private async createWorker() {
        const worker = await mediasoup.createWorker({
            rtcMinPort: parseInt(process.env.MEDIASOUP_RTC_MIN_PORT || '10000', 10),
            rtcMaxPort: parseInt(process.env.MEDIASOUP_RTC_MAX_PORT || '10100', 10),
            logLevel: 'warn',
        });

        worker.on('died', () => {
            this.logger.error('mediasoup worker has died');
            setTimeout(() => process.exit(1), 2000);
        });

        this.workers.push({ worker, routers: new Map() });
        this.logger.log(`Worker ${worker.pid} created`);
        return worker;
    }

    public getWorker() {
        if (this.workers.length === 0) {
            throw new Error('No workers available');
        }
        const worker = this.workers[this.nextWorkerIndex].worker;
        this.nextWorkerIndex = (this.nextWorkerIndex + 1) % this.workers.length;
        return worker;
    }
}
