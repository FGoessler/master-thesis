FROM node:8.1.1

RUN git clone https://github.com/cubedro/eth-netstats
WORKDIR /eth-netstats
RUN yarn install
RUN yarn install -g grunt-cli
RUN grunt

EXPOSE 3000

CMD ["yarn", "start"]
