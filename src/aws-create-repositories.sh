#!/usr/bin/env bash

aws ecr create-repository --repository-name fgps/payment-server --region=eu-west-1
aws ecr create-repository --repository-name fgps/geth-node --region=eu-west-1
aws ecr create-repository --repository-name fgps/persistence-service --region=eu-west-1
aws ecr create-repository --repository-name fgps/public-service --region=eu-west-1
aws ecr create-repository --repository-name fgps/random-nr-service --region=eu-west-1
