FROM node:latest as build

WORKDIR /web
COPY package*.json ./
RUN npm ci
RUN npm install -g @angular/cli
COPY . .
RUN npm run build --configuration=production

FROM nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /web/dist/noul/browser /usr/share/nginx/html

EXPOSE 80