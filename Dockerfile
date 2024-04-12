FROM node:18-buster-slim

ENV NODE_ENV="production"

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

RUN npm prune --production

CMD ["npm", "run", "prodbot"]
