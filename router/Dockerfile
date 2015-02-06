FROM nginx

# install confd
ADD confd-0.7.1-linux-amd64 /usr/local/bin/confd
RUN chmod +x /usr/local/bin/confd

# copy the configuration and certificate files
ADD app.toml /etc/confd/conf.d/
ADD app.conf.tmpl /etc/confd/templates/
ADD sample.local.cert /etc/nginx/
ADD sample.local.key /etc/nginx/

# make sure nginx runs in the foreground
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

# copy and prepare the start bash script
ADD start-nginx.sh /usr/local/bin/start-nginx
RUN chmod +x /usr/local/bin/start-nginx

CMD ["/usr/local/bin/start-nginx"]