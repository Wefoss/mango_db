FROM node:16.13.1-alpine3.14

RUN mkdir /server

WORKDIR /server

COPY . .

RUN npm i

EXPOSE 3000

CMD npm start 