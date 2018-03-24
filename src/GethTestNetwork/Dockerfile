FROM ethereum/client-go:v1.6.5

RUN apk update &&\
    apk add git nodejs bash perl

RUN cd /root &&\
    git clone https://github.com/cubedro/eth-net-intelligence-api &&\
    cd eth-net-intelligence-api &&\
    npm install &&\
    npm install -g pm2

ADD geth-node/start.sh /root/start.sh
ADD geth-node/app.json /root/eth-net-intelligence-api/app.json
# To speed up the launch of the ethereum node you can supply initial "DAG files".
# These files however are too large to add to git, so they are not included in this repo.
ADD geth-node/full-R23-290decd9548b62a8 /root/.ethash/full-R23-290decd9548b62a8
ADD geth-node/full-R23-0000000000000000 /root/.ethash/full-R23-0000000000000000
ADD password /root/data/password
ADD genesis.json /root/data/genesis.json
ADD keystore /root/.ethereum/devchain/keystore

RUN chmod +x /root/start.sh

ENTRYPOINT /root/start.sh
