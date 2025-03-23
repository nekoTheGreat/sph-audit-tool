#!/bin/bash

pm2-runtime start ecosystem.config.cjs & \

apachectl -D FOREGROUND