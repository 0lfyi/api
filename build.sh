#!/bin/bash

COMMIT_HASH=$(git log --pretty=oneline | head -1 | cut -d ' ' -f 1)

docker build -f ./Dockerfile -t "0l.fyi/api:${COMMIT_HASH:0:8}" .

