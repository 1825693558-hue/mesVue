FROM node:18-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /build/dist /usr/share/nginx/html/mes
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
