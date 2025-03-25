#!/bin/bash

npm run build:prod && \

pm2 start ecosystem.config.cjs --watch & \

apachectl -D FOREGROUND