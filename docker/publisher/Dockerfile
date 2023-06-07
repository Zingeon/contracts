FROM node:19

WORKDIR /app

COPY ./queue/package*.json ./

RUN npm install

COPY ./queue .

CMD ["node", "send.js"]
CMD ["node", "receive.js"]
