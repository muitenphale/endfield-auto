FROM oven/bun:1-slim

WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
RUN bun install --frozen-lockfile

COPY . .

ENV NODE_ENV=production

CMD ["bun", "run", "index.ts"]
