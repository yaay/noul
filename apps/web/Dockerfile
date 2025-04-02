FROM node:latest as build

WORKDIR /view
COPY package*.json ./
RUN npm ci
RUN npm install -g @angular/cli
COPY . .
RUN npm run build --configuration=production

FROM nginx:latest

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /view/dist/noul/browser /user/share/ngix/html

EXPOSE 80