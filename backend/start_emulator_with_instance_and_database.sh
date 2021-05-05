#!/bin/bash
#
# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -e
# turn on bash's job control
set -m

# Start the emulator.
printf "\nStarting Emulator..."
./gateway_main --hostname 0.0.0.0 &
sleep 5

# Preconfigured settings
ENDPOINT=http://localhost:9020
PROJECT_ID=test-project
INSTANCE_ID=omegatrade-instance
DATABASE_ID=omegatrade-database

# Create a Cloud Spanner Instance.
printf "\n\nCreating an instance..."
curl --request POST \
   -L "$ENDPOINT/v1/projects/$PROJECT_ID/instances" \
    --header 'Accept: application/json' \
    --header 'Content-Type: application/json' \
    --data "{\"instance\":{\"config\":\"emulator-test-config\",\"nodeCount\":1,\"displayName\":\"Test Instance\"},\"instanceId\":\"$INSTANCE_ID\"}"

# Create a Cloud Spanner Database
printf "\n\nCreating a database..."
curl --request POST \
  -L "$ENDPOINT/v1/projects/$PROJECT_ID/instances/$INSTANCE_ID/databases" \
  --header 'Accept: application/json' \
  --header 'Content-Type: application/json' \
  --data "{\"createStatement\":\"CREATE DATABASE \`$DATABASE_ID\`\",\"extraStatements\":[\"CREATE TABLE mytable (a INT64, b INT64) PRIMARY KEY(a)\"]}"

printf "\n\nCompleted Initialization.. \n"

# Docker will exit unless a foreground process is running.
# https://docs.docker.com/config/containers/multi-service_container/
fg %1
