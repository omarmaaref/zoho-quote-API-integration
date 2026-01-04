#!/bin/bash

# delay for the service to restart
sleep 1

# call the service and store the response
curl http://localhost:3005/api/v1/pdf/generator/debug -o debug.pdf

