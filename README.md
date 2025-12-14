![License](https://img.shields.io/badge/license-MIT-blue)

![Status](https://img.shields.io/badge/status-active-success)

![Contributions](https://img.shields.io/badge/contributions-welcome-brightgreen)

![Docker Automated build](https://img.shields.io/docker/automated/passimx/passim-media-calls?label=docker)

![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/passimx/passim-media-calls/main.yml)



# Passimx Media Calls Service



> A modern open-source backend service for WebRTC media communication — built with Mediasoup SFU architecture.



> Designed for privacy-first video and audio calls that anyone can self-host.



## Security



- 🔒 **End-to-end encryption** — SRTP for media traffic, DTLS for signaling

- 🛡️ **Protection from interception** — even TURN servers see only encrypted data

- 🔐 **Security by default** — built into WebRTC, no additional setup required



## Overview



Passimx Media Calls Service provides a scalable WebRTC media server using the **Mediasoup SFU (Selective Forwarding Unit)** architecture.

Unlike traditional P2P solutions where each participant must establish direct connections with all other participants, SFU uses a centralized server to route media streams. Each participant sends their audio/video stream only to the server, which then forwards it to other participants. This provides:

- **Scalability**: With N participants in P2P, each sends N-1 streams; in SFU — only 1 stream to the server

- **Efficiency**: Reduced load on client devices and network resources

- **Reliability**: Better performance through NAT and firewalls thanks to centralized ICE exchange

- **Flexibility**: Ability to adaptively manage quality for each receiver independently

The service uses **WebRTC** protocols (UDP/TCP), supports **Opus** (audio), **VP8/VP9/H.264** (video) codecs, and provides encryption through **DTLS** for secure media data transmission.


## License



Passimx Media Calls Service is released under the terms of the MIT license.  

See [https://opensource.org/license/MIT](https://opensource.org/license/MIT) for more information.





## Features



- 🎥 **WebRTC SFU** — Efficient media routing through Mediasoup

- 🔄 **Room management** — Create and manage media rooms for multiple participants

- 📡 **Transport management** — Create and connect WebRTC transports

- 🎤 **Producer/Consumer** — Create and receive audio and video streams

- 📨 **Kafka integration** — Optional messaging system

- 📚 **Swagger documentation** — Auto-generated API documentation

- 🐳 **Docker ready** — Containerization support

- ⚙️ **Scalable architecture** — Multi-worker support for high performance





## Technologies



| Area           | Technologies Used                        |

|----------------|------------------------------------------|

| Framework      | NestJS                                   |

| WebRTC         | Mediasoup                                |

| Messaging      | Kafka (optional)                         |

| API Documentation | Swagger                                |

| Runtime        | Node.js                                  |

| Containerization | Docker                                 |



## API Endpoints



The service provides RESTful API for managing media rooms, transports, and streams:



- `POST /media/room` — Create or get a media room

- `POST /media/transport/:roomId` — Create WebRTC transport

- `POST /media/transport/:transportId/connect` — Connect transport

- `POST /media/producer` — Create media producer

- `POST /media/consumer` — Create media consumer

- `GET /media/room/:roomId/producers` — Get list of producers in a room

- `POST /media/room/:roomId/leave` — Leave room



Full API documentation is available through Swagger after starting the service.
