FROM node:16-alpine

RUN apk add python3 make gcc g++
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile
COPY . .

ARG PORT=3000
EXPOSE ${PORT}
CMD [ "yarn" "start" ]
