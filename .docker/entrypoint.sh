#!/bin/bash

npm install

dockerize -wait tcp://medical-db:5432 -timeout 40s

npm run start:dev