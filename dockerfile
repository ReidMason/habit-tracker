FROM node:18-alpine AS web-depdendency-builder

WORKDIR /app

COPY habit-tracker/package.json habit-tracker/pnpm-lock.yaml ./

RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM web-depdendency-builder AS web-builder

COPY ./habit-tracker/ .

RUN corepack enable pnpm && pnpm run build

FROM golang:latest AS api-builder

WORKDIR /app

COPY ./api/ .

RUN go build -o ./habit-tracker

FROM golang:latest

WORKDIR /app

COPY --from=api-builder /app/habit-tracker ./habit-tracker
COPY --from=web-builder /app/dist ./static

ENTRYPOINT ["./habit-tracker"]
