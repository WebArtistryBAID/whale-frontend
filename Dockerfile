FROM node:20 as builder
WORKDIR .
CMD ["mkdir", "whale-frontend"]
COPY . ./whale-frontend/
WORKDIR whale-frontend
RUN npm install --force
RUN npm run build
FROM nginx:stable-alpine as runtime
COPY --from=builder /whale-frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
