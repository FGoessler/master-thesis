[![Build Status](https://travis-ci.com/FGoessler/master-thesis.svg?token=a3VYRpoZGByDCjGfvVBy&branch=master)](https://travis-ci.com/FGoessler/master-thesis)

# Masterthesis of Florian Gößler

This thesis aims to prototype a framework on top of blockchain technologies to enable microservices to charge each other on a pay-per-request basis.
 
The thesis PDF can be found [here](/docs/CompiledDocuments/Thesis.pdf)

The [src](/src) folder contains the source of the developed prototype. 

For more details about the individual components see the individual Readme files.

### Checkout Notes:

This repository contains all source files of the prototype. Dependencies (e.g. like Docker base images, node modules etc.) are not included. 
Also to run a full Geth Ethereum node DAG files (https://github.com/ethereum/wiki/wiki/Ethash-DAG) are required for the blockchain setup. These are a pretty big files (about 1GB) and therefore not committed here. You can create your own files an place it in /src/GethTestNetwork/geth-node or download the files the author used from dropbox: 
- https://www.dropbox.com/s/tl8m1qxppfs2a67/full-R23-0000000000000000?dl=0
- https://www.dropbox.com/s/8unwpy64t8egdv3/full-R23-290decd9548b62a8?dl=0

Note that you also need to uncomment the lines in the docker-file (/src/GethTestNetwork/Dockerfile) that adds it to the docker container.
If you don't hand in a preexisting file the startup of the Geth Node will be very very slow (several minutes)! This can lead other depended services to run in timeouts.

### Some pointers

- [Payment Prototype](/src) 
- [Payment Server](/src/PaymentServer) 
- [Payment Client Lib](/src/ClientSide/PaymentClientLib)
- [Visualizer](/src/Visualizer)
- [Mediator Contract](/src/PaymentServer/src/MediatorContract/Mediator.sol)
