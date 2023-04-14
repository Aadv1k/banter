FROM node:latest

ENV NODE_ENV=production

ENV PORT=3000

WORKDIR ./app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
