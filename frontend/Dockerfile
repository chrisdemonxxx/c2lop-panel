# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/out ./out
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "out", "-l", "3000"]
