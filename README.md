# Hookserver

## Usage

```sh

npm i -g hookserver

hookserver start -d

cd /usr/local/lib/node_modules/hookserver/examples
 
hookserver add hook hello ./hello.sh
hookserver add key my-test-key

curl http://localhost:6086/hello?my-test-key # {"status":"success","result":"Hello Webhooks!\n"}

```