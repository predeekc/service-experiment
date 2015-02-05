FROM nginx

ADD confd-0.6.3-linux-amd64 /usr/local/bin/confd
RUN chmod +x /usr/local/bin/confd

#RUN echo "daemon off;" >> /etc/nginx/nginx.conf

ADD app.toml /etc/confd/conf.d/
ADD app.conf.tmpl /etc/confd/templates/

# Copy configuration files
ADD sample.local.cert /etc/nginx/
ADD sample.local.key /etc/nginx/
ADD start-nginx.sh /usr/local/bin/start-nginx
RUN chmod +x /usr/local/bin/start-nginx

RUN echo "daemon off;" >> /etc/nginx/nginx.conf

CMD ["/usr/local/bin/start-nginx"]