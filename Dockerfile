FROM node:18-alpine

RUN apk add --no-cache git

WORKDIR /usr/src/app

COPY . .

RUN yarn install --frozen-lockfile

EXPOSE 8000

ENTRYPOINT ["node", "index.js"]
