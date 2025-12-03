import * as mediasoup from 'mediasoup';

export const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
    {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
    },
    {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
            'x-google-start-bitrate': 300,
        },
    },
    {
        kind: 'video',
        mimeType: 'video/VP9',
        clockRate: 90000,
    },
    {
        kind: 'video',
        mimeType: 'video/H264',
        clockRate: 90000,
        parameters: {
            'packetization-mode': 1,
            'profile-level-id': '42e01f',
            'level-asymmetry-allowed': 1,
        },
    },
];

export const webRtcTransport_options: mediasoup.types.WebRtcTransportOptions = {
    listenInfos: [
        {
            protocol: 'udp',
            ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
            announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
        },
        {
            protocol: 'tcp',
            ip: process.env.MEDIASOUP_LISTEN_IP || '0.0.0.0',
            announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
        },
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
};

