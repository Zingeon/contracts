FROM node:16

WORKDIR /app

COPY ./queue/package*.json ./

RUN npm install

COPY ./queue .

RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x /bin/wait-for-it.sh

CMD ["npm", "run", "start-worker"]