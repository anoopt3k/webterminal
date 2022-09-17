FROM node

WORKDIR /usr/src

ADD package.json .
RUN yarn install

COPY . /usr/src/

RUN yarn build

EXPOSE 8080

CMD yarn start