FROM node:20.10.0-alpine AS base

FROM base AS build
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    linux-headers \
    && rm -rf /var/cache/apk/*

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false --loglevel=error
COPY . .
RUN npm run build

FROM base
WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/api ./api

EXPOSE 6040
CMD ["node","dist/src/main"]