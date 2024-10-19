FROM golang:latest AS api-builder

WORKDIR /app

COPY ./api/ .

RUN go build -o ./habit-tracker

FROM node:18-alpine AS web-builder

WORKDIR /app

COPY ./habit-tracker/ .

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM golang:latest

WORKDIR /app

COPY --from=api-builder /app/habit-tracker ./habit-tracker
COPY --from=web-builder /app/dist ./static

ENTRYPOINT ["./habit-tracker"]
