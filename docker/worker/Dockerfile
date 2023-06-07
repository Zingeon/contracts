FROM node:19

WORKDIR /app

RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x /bin/wait-for-it.sh

COPY ./queue/package*.json ./

RUN npm install

COPY ./queue .

CMD ["npm", "run", "start-worker"]