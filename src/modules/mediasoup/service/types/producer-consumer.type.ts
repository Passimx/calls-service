import type { RtpCapabilities, RtpParameters } from 'mediasoup/node/lib/rtpParametersTypes';

export type ProduceParams = {
    roomId: string;
    peerId: string;
    kind: 'audio' | 'video';
    rtpParameters: RtpParameters;
    transportId: string;
};

export type ConsumeParams = {
    roomId: string;
    peerId: string;
    producerId: string;
    rtpCapabilities: RtpCapabilities;
    transportId: string;
};
