FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN cp .envprod .env
RUN npm run build
EXPOSE 3001
CMD npm run prod
