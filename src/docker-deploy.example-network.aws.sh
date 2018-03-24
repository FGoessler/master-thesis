#!/usr/bin/env bash

# define some colors to use for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# catch unexpected failures, do cleanup and output an error message
trap 'cleanup ; printf "${RED}Deploy Failed For Unexpected Reasons${NC}\n"'\
  HUP INT QUIT PIPE TERM

printf "Starting...\n"
eval `aws ecr get-login --no-include-email --region eu-west-1`
printf "${GREEN}Login to AWS successful.${NC}\n"

printf "Building and uploading docker images in parallel...\n"
./docker-build-and-push.sh fgps/payment-server ./PaymentServer/Dockerfile ./PaymentServer/ &
./docker-build-and-push.sh fgps/geth-node ./GethTestNetwork/Dockerfile ./GethTestNetwork/ &
./docker-build-and-push.sh fgps/persistence-service ./ClientSide/Dockerfiles/Dockerfile-PersistenceService ./ClientSide/ &
./docker-build-and-push.sh fgps/public-service ./ClientSide/Dockerfiles/Dockerfile-PublicService ./ClientSide/ &
./docker-build-and-push.sh fgps/random-nr-service ./ClientSide/Dockerfiles/Dockerfile-RandomNrService ./ClientSide/
wait    # wait for completion of all scripts
printf "${GREEN}Docker images built and uploaded.${NC}\n"

printf "Spinning up cluster via ecs-cli compose...\n"
ecs-cli compose --file docker-compose.eth-node.aws.yml --region=eu-west-1 --cluster eth-node up
ecs-cli compose --file docker-compose.example-network.aws.yml --region=eu-west-1 --cluster fgps-services up
printf "${GREEN}Cluster up.${NC}\n"
