FROM node:20 as builder
WORKDIR .
CMD ["mkdir", "whale-frontend"]
COPY . ./whale-frontend/
WORKDIR whale-frontend
RUN npm install --force --registry=http://registry.npmmirror.com/
RUN npm run build
FROM nginx:stable-alpine as runtime
COPY --from=builder /whale-frontend/dist /usr/share/nginx/html
COPY --from=builder /whale-frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
