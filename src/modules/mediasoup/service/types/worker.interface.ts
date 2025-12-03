import type { Worker } from 'mediasoup/node/lib/WorkerTypes';
import type { Router } from 'mediasoup/node/lib/RouterTypes';

export interface WorkerData {
    worker: Worker;
    routers: Map<string, Router>;
}
