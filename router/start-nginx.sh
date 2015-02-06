#!/bin/bash

echo "[nginx] confd is updating conf files based on environment variables..."
confd -onetime -backend env

# Start the Nginx service using the generated config
echo "[nginx] starting nginx service..."
/usr/sbin/nginx -c /etc/nginx/nginx.conf