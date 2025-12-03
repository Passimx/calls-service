import type { Router } from 'mediasoup/node/lib/RouterTypes';
import type { WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransportTypes';
import type { Producer } from 'mediasoup/node/lib/ProducerTypes';
import type { Consumer } from 'mediasoup/node/lib/ConsumerTypes';

export interface Peer {
    id: string;
    transports: Map<string, WebRtcTransport>;
    producers: Map<string, Producer>;
    consumers: Map<string, Consumer>;
}

export interface Room {
    id: string;
    router: Router;
    peers: Map<string, Peer>;
}
