# Hookserver

## Usage

```sh
# install Hookserver as a cli tool
npm install -g hookserver

# start Hookserver daemonized and redirect log to ./hookserver.log
# 6086 is the default port, you can use -p or --port option to override it
hookserver start -d -l ./hookserver.log

# switch to the examples folder shipped with Hookserver
cd /usr/local/lib/node_modules/hookserver/examples  

# register a webhook with the name 'hello' that triggers the bash script found at './hello.sh' to be executed
hookserver add hook hello ./hello.sh
# register a new security key 'my-test-key' to allow access to the registered webhooks via http requests
hookserver add key my-test-key

# test it out: send a get request to 'http://localhost:6086/hello?my-test-key'
curl "http://localhost:6086/hello?my-test-key"

# the output:
# {"status":"success","result":"Hello Webhooks!\n"}
```

For more information, run `hookserver help` or take a look at [help.md](https://github.com/schwarzkopfb/hookserver/blob/master/help.md).

**Note on permissions:** 
Hookserver uses `/var/lib/hookserver` to store hook scripts and security keys.
Usually only the root user is allowed to make changes in that directory, so probably you'll have to use `sudo`.
If `npm` was invoked with root privileges, then it will change the uid to the user account or uid specified by the user config, which defaults to `nobody`. 
Set the `--unsafe-perm` flag to run scripts with root privileges and let Hookserver register its working folders.

```sh
# so instead of this...
npm install -g hookserver

# ...maybe you will have to use this
sudo npm i -g hookserver --unsafe-perm
```

## Application data

Keep in mind that registered hooks and security keys will not be deleted if you uninstall or update Hookserver.
You have to run `hookserver cleanup` before uninstalling it to remove all the saved application data. 

## License

[MIT license](https://github.com/schwarzkopfb/hookserver/blob/master/LICENSE).