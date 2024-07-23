#!/usr/bin/env sh
set -eu

export DOLLAR='$'
envsubst '${TOP_LEVEL_DOMAIN} ${TOP_LEVEL_PORT} ${APPS_SUFFIX}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
