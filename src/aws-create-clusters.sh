#!/usr/bin/env bash

ecs-cli up --keypair FGPS --capability-iam --size 1 --instance-type t2.large --cluster fgps-services --region=eu-west-1
ecs-cli up --keypair FGPS --capability-iam --size 1 --instance-type m3.large --cluster eth-node --region=eu-west-1
