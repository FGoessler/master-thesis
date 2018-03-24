# Payment Prototype 

This folder contains the sources of the prototype implementation.

You can either run the individual parts via npm run scripts (or shell scripts) or use docker-compose for some scenarios. 




# Components

### PaymentServer

The server component that interacts with the ethereum node via RPC calls through web3.js on the one side and offers an HTTP REST like API for microservices on the other side.

### ClientSide

#### PaymentClientLib

The Javascript library that microservices should use to interact with the PaymentServer.

#### ExampleNetwork

A super simple example network consisting of 3 services: PublicService, RandomNrService and PersistenceService. The first one can be called publicly via http and uses the other 2 and pays for the invocations per request.

### Visualizer

A small static webpage which can connect to an Ethereum node to provide insights into the payment relevant content on the blockchain.

See the Readme file in the Visualizer folder for instructions on how to connect the visualizer to an ethereum node. 

### IntegrationTests

A small set of (incomplete) integration tests that test the interaction of payment server, client lib and ethereum node.
They work but by far do not cover the whole functionality.

### GethTestNetwork

Configuration to run a private test ethereum network with a Geth node.

### TestRPCTestNetwork

Configuration to run a private test ethereum network with a TestRPC node.




# Available Scenarios

To spin up certain settings and scenarios a set of docker-compose files and scripts are available. Please see below on how to configure and run them.

To use all of this please make sure that recent versions of docker and docker-compose are installed on your machine. 
Tests were performed with Docker 17.06.2-ce-mac27 on macOS 10.12.6.


## Local

**IMPORTANT: See the checkout notes in the main Readme file regarding the Geth DAG files before trying to run these docker commands!**

### Payment Server with Geth Node

To start a simple payment server with a Geth Ethereum node that runs a private network execute this:

```
docker-compose -f docker-compose.yml up --build
```

- The payment server is then reachable under `http://localhost:3000`.
- Open `http://localhost:3000/status` to see if it works.

### Example Network without Payment

To launch the example network without a payment server and the corresponding overhead execute:

```
docker-compose -f docker-compose.no-payment.yml up --build
```

- The public service is then reachable under `http://localhost:8003`.
- Open `http://localhost:8003/action` to trigger a request that interacts with the other services.

### Example Network with Payment

To launch the example network with a payment server and the Geth Ethereum node execute:

```
docker-compose -f docker-compose.example-network.yml up --build
```

- The payment servers are then reachable under `http://localhost:3001` and `http://localhost:3002`.
- The public service is then reachable under `http://localhost:8003`.
- Open `http://localhost:3001/status` to see if the payment server works.
- Open `http://localhost:8003/init` to initialize the payment channels. This might take a moment!
- Open `http://localhost:8003/action` to trigger a request that interacts with the other services.
- Open `http://localhost:8001/redeem` or `http://localhost:8002/redeem` to redeem the token for the Persistence/RandomNr service. This might take a moment!

### Integration Tests

To run the integration tests execute:

```
./integration-test.sh
```

If you want more output/control you can also use a plain docker-compose command: 

```
docker-compose -f docker-compose.integration-test.yml up --build
```


## Cloud (AWS)

To run the following scenarios in the cloud on AWS you need to setup some things first:
- Create an AWS account.
- Setup an EC2 Key Pair. Name it "FGPS" if you don't want to touch the scripts.
- Setup the aws and [ecs cli](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ECS_CLI_installation.html) on your machine and configure the EC2 KeyPair on your machine.
- Create ECS repositories for the docker images via `./aws-create-repositories.sh`.
- Spinup the 'clusters' via: `./aws-create-clusters.sh`. This creates two 'clusters' with one EC2 instance each. One cluster for the Ethereum node and one for the other services.
- Adjust the security groups of both EC2 instances to allow incoming HTTP requests on ports 3000-9000 from anywhere (e.g. via the AWS web interface).
- Adjust the `.env` file in this directory to match your settings:
    - `DOCKER_REGISTRY_URL`: The domain of your ECS docker registry (e.g. 246894882776.dkr.ecr.eu-west-1.amazonaws.com).
    - `ETH_NODE_1_URL`: The IP address and port of the Ethereum node for the PaymentServer of the Persistence and RandomNr services (e.g. http://34.253.102.156:8545).
    - `ETH_NODE_2_URL`: The IP address and port of the Ethereum node for the PaymentServer of the Public service (e.g. http://34.253.102.156:8545).
- Note that for this simplified setup only one Ethereum node is launched and used by both both payment servers. Use the same IP for ETH_NODE_1_URL and ETH_NODE_2_URL for this.

`<services-instance-ip>` in the docs below refers to the IP address of the services EC2 instance (if setup via the above the scripts the T2.large instance).

### Example Network without Payment

To launch the example network without a payment server in the cloud execute:

```
./docker-deploy.no-payment.aws.sh
```

This will build and upload the docker images and deploy the services on the cluster.

- The public service is then reachable under `http://<services-instance-ip>:8003`.
- Open `http://<services-instance-ip>:8003/action` to trigger a request that interacts with the other services.

To access logs of the instances have a look at AWS Cloud Watch and look for the log group 'fgps'.

### Example Network with Payment

To launch the example network with two payment servers - one for the Persistence and RandomNr services and one for the Public service - and the Geth Ethereum node in the cloud execute:

```
./docker-deploy.example-network.aws.sh
```

This will build and upload the docker images and deploy the services and the ethereum on the clusters.

- The payment servers are then reachable under `http://<services-instance-ip>:3001` and `http://<services-instance-ip>:3002`.
- The public service is then reachable under `http://<services-instance-ip>:8003`.
- Open `http://<services-instance-ip>:3001/status` and/or `http://<services-instance-ip>:3001/status` to see if the payment servers work.
- Open `http://<services-instance-ip>:8003/init` to initialize the payment channels. This might take a moment!
- Open `http://<services-instance-ip>:8003/action` to trigger a request that interacts with the other services.
- Open `http://<services-instance-ip>:8001/redeem` or `http://<services-instance-ip>:8002/redeem` to redeem the token for the Persistence/RandomNr service. This might take a moment!

To access logs of the instances have a look at AWS Cloud Watch and look for the log group 'fgps'.
