/**
 * Created by schwarzkopfb on 15/8/28.
 */

var fs       = require('fs'),
    http     = require('http'),
    path     = require('path'),
    parseUrl = require('url').parse,
    spawn    = require('child_process').spawn,
    utils    = require('./utils'),
    server,
    keys

function startup(callback) {
    utils.ensureHookDirectory(function (err) {
        if(err)
            callback(err)
        else
            utils.ensureKeyFile(function (err) {
                if(err)
                    callback(err)
                else
                    utils.watchKeyFile(function (err, keyList) {
                        if(err)
                            callback(err)
                        else {
                            keys = keyList

                            callback()
                        }
                    })
            })
    })
}

var pidPath = path.resolve(__dirname + '/../hookserver.pid')

function writePid(pid, callback) {
    if(arguments.length === 1) {
        callback = pid
        pid      = process.pid
    }

    fs.exists(pidPath, function (exists) {
        if(exists)
            callback('ALREADY_RUNNING')
        else
            fs.writeFile(pidPath, pid, callback)
    })
}

function deletePid(callback) {
    fs.unlink(pidPath, callback)
}

function checkPid(callback) {
    fs.exists(pidPath, callback)
}

var logPath = path.resolve(__dirname + '/../hookserver.log')

function fork() {
    var argv   = process.argv.remove([ '-d', '--daemonize', '--daemonized' ]),
        stdout = fs.openSync(logPath, 'a')

    argv.push('--__worker')

    return spawn(argv.shift(), argv, {
        detached: true,
        stdio: [
            'ignore',
            stdout,
            stdout
        ]
    })
}

function respond(response, status, message) {
    if(status === 200) {
        response.writeHead(status, { 'Content-Type': 'text/json' })
        response.write('{"status":"success","result":"' + message + '"}')
    }
    else {
        response.writeHead(status, message, { 'Content-Type': 'text/json' })
        response.write('{"status":"error","message":"' + message + '"}')
    }

    response.end()
}

function requestListener(req, res) {
    var url      = parseUrl(req.url),
        pathname = url.pathname

    if(!pathname || pathname === '/')
        respond(res, 400, 'You must specify a hook name to run.')
    else {
        if(pathname[0] === '/')
            pathname = pathname.substring(1)

        var query = decodeURIComponent(url.query)

        if(typeof query === 'string' && query.length && ~keys.indexOf(query))
            utils.existsHook(pathname, function (exists) {
                if(!exists)
                    respond(res, 404, 'No registered hook found with the given name.')
                else
                    utils.runHook(pathname, function (err, output) {
                        if(err) {
                            console.error(err)
                            respond(res, 500, 'Internal server error.')
                        }
                        else
                            respond(res, 200, output.replace(/["]/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r\t]/g, ''))
                    })
            })
        else
            respond(res, 403, 'Invalid key provided.')
    }
}

function start(argv) {
    var port      = +argv.p || +argv.port || process.env.PORT || 6086,
        daemonize = argv.d || argv.daemonize || argv.daemonized

    if(daemonize)
        checkPid(function (exists) {
            if(exists && module.parent)
                console.warn('Server is already running, --daemonize flag ignored.')

            start(daemonize = !exists)
        })
    else
        start()

    function start() {
        startup(function (err) {
            if(err)
                console.error('Server cannot start up:\n', err)
            else {
                if(!daemonize) {
                    server = http.createServer(requestListener).listen(port, function () {
                        console.log('Hookserver is ready to accept connections on port', port)
                    })
                }
                else {
                    var child = fork()

                    writePid(child.pid, function (err) {
                        if(err) {
                            console.error('Cannot write "hookserver.pid". Cannot start up daemonized.\n', err)
                            child.kill()
                        }
                        else {
                            console.log('stdout and stderr goes to "' + logPath + '"')
                            console.log('Running daemonized. Worker started, parent exiting.')

                            process.exit()
                        }
                    })
                }
            }
        })
    }

    var exiting

    function exit() {
        if(exiting && !daemonize) {
            utils.unwatchKeyFile()

            process.stdout.clearLine()
            process.stdout.cursorTo(0)

            process.exit()
        }

        exiting = true

        if(!daemonize && process.stdout.isTTY) {
            process.stdout.clearLine()
            process.stdout.cursorTo(0)
            console.log('Closing open connections...')
            console.log('(^C again to force quit)')
        }
        else
            console.log(this ? 'SIGTERM' : 'SIGINT', 'received. Closing open connections...')

        function delPid(callback) {
            deletePid(function (err) {
                if(err)
                    console.warn('Cannot unlink "hookserver.pid". Try to remove it manually.')

                if(callback)
                    callback()
            })
        }

        if(daemonize)
            delPid()
        else {
            var closeTimeout = setTimeout(function () {
                utils.unwatchKeyFile()

                closeTimeout = null

                console.log('Close timeout exceeded. Force exiting.')

                if(argv.__worker)
                    delPid(function () {
                        process.exit()
                    })
                else
                    process.exit()
            }, 30000)

            server.close(function () {
                if(closeTimeout) {
                    utils.unwatchKeyFile()

                    console.log('Server closed all its open connections. Exiting.')
                    clearTimeout(closeTimeout)

                    if(argv.__worker)
                        delPid()
                }
            })
        }
    }

    process.on('SIGINT', exit.bind(0)).on('SIGTERM', exit.bind(1)).on('SIGHUP', function noop() {})
}

if(module.parent)
    module.exports = start
else
    start({ _: [] })