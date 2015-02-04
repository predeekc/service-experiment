# service-experiment

## add hosts entries

## r


## certificate creation

openssl genrsa 2048 > host.key
openssl req -new -x509 -nodes -sha1 -days 3650 -key host.key > host.cert
#[enter *.domain.com for the Common Name]
openssl x509 -noout -fingerprint -text < host.cert > host.info
cat host.cert host.key > host.pem
chmod 400 host.key host.pem