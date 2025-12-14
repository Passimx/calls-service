# Contributing

We welcome contributions!

Every contribution — big or small — helps make **Passimx Media Calls Service** better for everyone.

Thank you for your time and effort.

## How to Contribute

1. **Fork** this repository to your own GitHub account.

2. Create a new branch for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes and commit them with clear messages:

   ```bash
   git add .
   git commit -m "feature: mediasoup room management"
   git push 
   ```

4. Push your branch and open a Pull Request to the `main` branch.

## Getting Started

### Run locally with Node.js

```bash
# Clone the repository
git clone https://github.com/passimx/passim-media-calls.git

# Enter the directory
cd passim-media-calls

# Install dependencies
npm ci

# Create an environment file
cp .env.example .env

# In the .env file, specify your server settings

# Start in development mode
npm run start:dev

```

## Project Structure

```
passim-media-calls/
│
├── api/                        # Swagger configuration
│   └── swagger.json
│
├── src/
│   │
│   ├── common/                 # Common utilities and configurations
│   │   ├── config/             # Configurations (Kafka, Swagger)
│   │   ├── decorators/         # Custom decorators
│   │   ├── envs/               # Environment variables management
│   │   ├── logger/             # Logging
│   │   ├── swagger/            # Swagger decorators
│   │   └── utils/              # Utilities
│   │
│   ├── modules/                # Application modules
│   │   │
│   │   ├── mediasoup/          # Mediasoup module
│   │   │   │
│   │   │   ├── controller/     # REST API controllers
│   │   │   │   └── media.controller.ts
│   │   │   │
│   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── requests/   # Request DTOs
│   │   │   │   └── responses/  # Response DTOs
│   │   │   │
│   │   │   ├── service/        # Business logic
│   │   │   │   ├── mediasoup.service.ts      # Worker management
│   │   │   │   ├── room.service.ts           # Room management
│   │   │   │   ├── transport.service.ts     # Transport management
│   │   │   │   ├── producer-consumer.service.ts  # Stream management
│   │   │   │   └── types/                   # TypeScript types
│   │   │   │
│   │   │   ├── media.config.ts              # Codec and transport configuration
│   │   │   └── mediasoup.module.ts           # NestJS module
│   │   │
│   │   └── queue/              # Queue module (Kafka)
│   │       ├── dto/            # Message DTOs
│   │       ├── type/           # Types and enums
│   │       ├── queue.service.ts
│   │       └── queue.module.ts
│   │
│   ├── app.module.ts           # Root application module
│   └── main.ts                 # Application entry point
│
├── dist/                       # Compiled code
├── Dockerfile                  # Docker configuration
├── nest-cli.json               # NestJS CLI configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Mediasoup Resource Architecture

The service manages the following Mediasoup resources:

### Resource Structure

```
MediasoupService
├── Worker[] (workers)
    ├── Router[] (routers)
        ├── Room[] (rooms)
            ├── Peer[] (peers)
                ├── Transport[] (transports)
                ├── Producer[] (producers)
                └── Consumer[] (consumers)
```

### Resource Description

**Worker** — A core component of Mediasoup that handles media processing. It is a low-level process where WebRTC connections and inter-process communication happen. Workers are created based on the number of CPU cores for scaling (by default, it uses the number of system CPU cores).

**Router** — Acts as an SFU (Selective Forwarding Unit) that routes RTP packets from Producers to Consumers. In this service, each Router corresponds to one media room. The Router manages Transports, Producers, and Consumers that belong to it.

**Transport** — An abstraction of the network connection between the client and server. It handles WebRTC connections, DTLS, and ICE negotiations. There are two types:
- **SendTransport** — Used to create Producers (sending media from client to server)
- **RecvTransport** — Used to create Consumers (receiving media from server to client)

**Producer** — Creates media streams (audio/video) from client to server. Each stream type (audio, video) is managed by a separate Producer. The Producer sends the client's media stream to the Mediasoup server through SendTransport.

**Consumer** — Receives media streams from server to client. It subscribes to other participants' Producers to get their media. The Consumer gets media from a Producer through the server's Router and delivers it to the client through RecvTransport.

## Environment Variables

The project uses a `.env` file for configuration.

| Variable | Description | Default Value |
|-----------|----------|----------------------|
| `FILES_SERVICE_APP_PORT` | Application port | `6040`               |
| `KAFKA_HOST` | Kafka server host | `kafka`              |
| `KAFKA_EXTERNAL_PORT` | Kafka port | `9094`               |
| `KAFKA_CLIENT_USERS` | Kafka user | `user`               |
| `KAFKA_USER_PASSWORD` | Kafka password | `bitnami`            |
| `KAFKA_IS_CONNECT` | Connect to Kafka (true/false) | `true`               |
| `SWAGGER_PATH` | Swagger documentation path | `docs`               |
| `SWAGGER_IS_WRITE_CONFIG` | Generate Swagger config (true/false) | `true`               |
| `MEDIASOUP_NUM_WORKERS` | Number of Mediasoup workers | Number of CPU cores  |
| `MEDIASOUP_RTC_MIN_PORT` | Minimum RTC port | `10000`              |
| `MEDIASOUP_RTC_MAX_PORT` | Maximum RTC port | `10100`              |
| `MEDIASOUP_LISTEN_IP` | IP address to listen on | `0.0.0.0`            |
| `MEDIASOUP_ANNOUNCED_IP` | Public IP (for NAT) | `127.0.0.1`                |

## Technologies and Versions

| Technology | Version |
|------------|--------|
| Node.js | ≥ 18.0 |
| NestJS | ^10.0.0 |
| Mediasoup | ^3.15.8 |
| KafkaJS | ^2.2.4 |
| TypeScript | ^5.3.3 |

## Branch Structure

| Branch | Description | Stability |
|:------|:---------|:-------------|
| **`main`** | Development branch. Contains experimental and in-progress features — code here may be unstable. | ⚠️ Unstable |
| **`release`** | Production branch. Contains only tested and approved code. | ✅ Stable |

### Branch Workflow

1. **All new features and fixes** are developed in separate feature branches (e.g., `feature/room-management`, `bugfix/transport-connection`)

2. When ready, they are merged into **`main`** for integration

3. After verification, `main` is merged into **`release`** for production deployment

> 🔒 The `main` and `release` branches are protected — direct pushes are not allowed.  
> All changes must go through a **Pull Request (PR)**.

## Additional Resources

- [Mediasoup Homepage](https://mediasoup.org/)
- [Mediasoup Forum](https://mediasoup.discourse.group/)
- [NestJS Documentation](https://docs.nestjs.com/)
