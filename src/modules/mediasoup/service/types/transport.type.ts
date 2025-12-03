import type { DtlsParameters, IceCandidate, IceParameters } from 'mediasoup/node/lib/WebRtcTransportTypes';

export type TransportOptions = {
    id: string;
    iceParameters: IceParameters;
    iceCandidates: IceCandidate[];
    dtlsParameters: DtlsParameters;
};
