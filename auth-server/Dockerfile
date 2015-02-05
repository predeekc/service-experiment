FROM dockerfile/nodejs

RUN mkdir /var/www/
ADD package.json /var/www/package.json
RUN cd /var/www; npm install --production
ADD *.js /var/www/
ADD db/* /var/www/db/
ADD views/* /var/www/views/

ENV PORT 80
EXPOSE 80

WORKDIR /var/www
CMD ["node", "/var/www/index.js"] 