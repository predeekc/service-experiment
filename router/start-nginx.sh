#!/bin/bash

echo "[nginx] confd is updating conf files based on environment variables..."
confd -onetime -backend env

# Start the Nginx service using the generated config
echo "[nginx] starting nginx service..."
service nginx start

# Follow the logs to allow the script to continue running
tail -f /var/log/nginx/*.log