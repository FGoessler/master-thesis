#!/usr/bin/env bash

# Loading .env file variables ($DOCKER_REGISTRY_URL)
set -a
  [ -f .env ] && . .env
set +a

# Param info:
# $1 tag name (e.g. fgoessler/payment-server)
# $2 docker file name/location
# $3 docker build context path

# Build docker image
docker build -t $1 -f $2 $3
# Tag it
docker tag $1:latest $DOCKER_REGISTRY_URL/$1:latest
# Push it to AWS ECS Docker Registry
docker push $DOCKER_REGISTRY_URL/$1:latest
