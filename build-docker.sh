#!/bin/bash
docker pull node:8.12.0-alpine
if [[ $(arch) == "arm64" ]]; then
    docker buildx build --platform linux/amd64 --tag=ctf-challenge .
    docker run --platform linux/amd64 -p 1337:1337 --rm --name=ctf-challenge -it ctf-challenge
else
    docker build --tag=ctf-challenge .
    docker run -p 1337:1337 --rm --name=ctf-challenge -it ctf-challenge
fi
