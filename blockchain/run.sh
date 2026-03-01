#! /bin/bash


WORK_DIR=$(pwd)
CONTAINER_NAME=truffler-container


docker run -it --rm   \
    -v $WORK_DIR:/app \
    --add-host=host.docker.internal:host-gateway \
    $CONTAINER_NAME \
    bash
