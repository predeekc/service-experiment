# Router

The router container is implemented using nginx to provide an HTTPS endpoint ad well as perform basic routing.  Any requests with a host name of www.sample.local are routed to a set of web container instances and requests with auth.sample.local are routed to a set of OAuth2 server containers. The basic nginx config below handles both of these needs.

```
upstream auth_servers {
    server 172.17.0.3:80;
}

upstream web_servers {
    server 172.17.0.7:80;
    server 172.17.0.6:80;
}

server {
    listen          443 ssl;
    server_name     www.sample.local;

    ssl_certificate             /etc/nginx/sample.local.cert;
    ssl_certificate_key         /etc/nginx/sample.local.key;
    ssl_session_cache           shared:SSL:1m;
    ssl_session_timeout         5m;
    ssl_ciphers                 HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers   on;

    location / {
        proxy_pass http://web_servers;
    }
}

server {
    listen          443 ssl;
    server_name     auth.sample.local;

    ssl_certificate             /etc/nginx/sample.local.cert;
    ssl_certificate_key         /etc/nginx/sample.local.key;
    ssl_session_cache           shared:SSL:1m;
    ssl_session_timeout         5m;
    ssl_ciphers                 HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers   on;

    location / {
        proxy_pass http://auth_servers;
    }
}
```

This config file works fine as long as the IP addresses of the auth and web servers never change.  Unfortunately Docker assigns a new IP to the containers every time they are recreated, so the nginx configuration needs to be updated when the router starts.  Dynamic addition of service instances is not currently handles in this sample, so pulling the server addresses from environment variables is acceptable.  In a more dynamic system, the server registration would be stored in an external location and as servers are added, the nginx configuration would be updated.

## Dynamic .conf file management with confd

In this sample system [confd](https://github.com/kelseyhightower/confd) was used to handle dynamic creation of the nginx .conf files.  This tool reads from multiple data sources including environment variables and exposes a hierarchical set of values to a templating engine.  When the tool is invoked, the values are merged with the template to create new .conf files.

The links between the router and web containers lead to a set of environment variables being passed to the router container.  A subset of those values are shown below and they define the IP address and port of each instance of the web and auth containers.

```
WEB_4_PORT_80_TCP_PORT=80
WEB_4_PORT_80_TCP_ADDR=172.17.0.7
WEB_5_PORT_80_TCP_PORT=80
WEB_5_PORT_80_TCP_ADDR=172.17.0.6
AUTH_1_PORT_80_TCP_PORT=80
AUTH_1_PORT_80_TCP_ADDR=172.17.0.3
```

Confd uses a .toml file to define the transformation needed.  This file defines the template, destination location, and a list of keys to retrieve from the source (in our case the Environment variables)

```
[template]
src = "app.conf.tmpl"
dest = "/etc/nginx/conf.d/app.conf"
keys = [
    "/web",
    "/auth",
]
```

In our example, the fact that the /web and /auth are listed as keys causes confd to parse any environment variables begining with WEB_ or AUTH_ into a tree representation that can be used by the template.  Once the data source is parsed, the template is applied and the .conf file is created.

```
upstream auth_servers {
{{range lsdir "/auth"}}
    {{ $addr := printf "/auth/%s/port/80/tcp/addr" . }}
    {{ $port := printf "/auth/%s/port/80/tcp/port" . }}
    {{ if exists $addr }}
        server {{getv $addr}}:{{getv $port}};
    {{end}}
{{end}}
}

upstream web_servers {
{{range lsdir "/web"}}  
    {{ $addr := printf "/web/%s/port/80/tcp/addr" . }}
    {{ $port := printf "/web/%s/port/80/tcp/port" . }}
    {{ if exists $addr }}
        server {{getv $addr}}:{{getv $port}};
    {{end}}
{{end}}
}

... remainder excluded for clarity ...
```

The example above uses the *lsdir* command to get a list of child keys and then *range* to execute the embedded template once per key.  The next two lines use the *printf* command to create the $addr and $port variables containing the search path based on the current child key in the list.  Finally as long as the $addr key exists, render the **server** line to the output file using the values held in the $addr and $port keys.  For more information on the templating engine, see the [confd documentation](https://github.com/kelseyhightower/confd/blob/master/docs/templates.md).

**I'd like to simplify this template.  I didn't see a good way to do this without generating the key variables, but it seems there should be a way to do it.  I also had to use the check for the key's existance since there are some environment variables that start with WEB_ that don't follow the pattern expected above.  If this were moved to a shared store like [etcd](https://github.com/coreos/etcd) the key structure would be more tightly controlled and this wouldn't be a problem.**

## Router Dockerfile

Due to the use of confd to generate the nginx .conf file, the setup of this container is a little more complicated than the other containers.  It's based on the official nginx container on the [Docker Hub](https://hub.docker.com/account/signup/) and modified to inject our custom .conf file.

```
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
```

The first section installs confd and makes sure it's executable.  Next the confd .toml and .tmpl files are copied to the container along with the certificate files used for the HTTPS endpoint.  Next a command is added to the nginx.conf file force nginx to run in the foreground.  If it didn't, the container would terminate as soon as the nginx process was started.  Finally the start-nginx BASH script is copied to the container and set as the startup command.  This BASH script will run confd then start nginx.

```BASH
#!/bin/bash

echo "[nginx] confd is updating conf files based on environment variables..."
confd -onetime -backend env

# Start the Nginx service using the generated config
echo "[nginx] starting nginx service..."
/usr/sbin/nginx -c /etc/nginx/nginx.conf
```
