#!/usr/bin/env node

global.argv = require('minimist')(process.argv.slice(2))

var utils      = require('./lib/utils'),
    server     = require('./hookserver'),
    command    = argv._.shift(),
    subcommand = argv._.shift()

function unknown() {
    if(argv.h || argv.help)
        printHelp()
    else if(argv.v || argv.version)
        printVersion()
    else
        console.error('Unknown command provided: "' + [ command, subcommand ].concat(argv._).join(' ') + '"\nSee `hookserver help` for more information.')
}

function printHelp() {
    console.log(require('./lib/help'))
}

function printVersion() {
    console.log(require('./package.json').version)
}

function done(err, data) {
    if(err) {
        console.error('Command cannot be executed:')
        console.error(err)
        process.exit(1)
    }
    else if(data) {
        if(Array.isArray(data))
            console.log(data.join('\n'))
        else
            console.log(data)
    }
}

switch(command) {
    case 'add':
    case 'register':
        switch(subcommand) {
            case 'hook':
                utils.registerHook(argv._[0], argv._[1], done)
                break

            case 'key':
                var key = argv._[0 ],
                    validationResult

                if(!key)
                    console.log(key = utils.generateKey(argv.l || argv.length))
                else if(validationResult = utils.validateKey(key)) {
                    var plural = validationResult.length,
                        chars  = Array.prototype.slice.call(validationResult).map(function (char) { return '"' + char + '"' }).join(', ')

                    done('Invalid key provided. The following character' + (plural > 1 ? 's are ' : ' is ') + 'not allowed to be used in a key: ' + chars + '.')
                }

                utils.registerKey(key, done)
                break

            default:
                unknown()
        }
        break

    case 'rm':
    case 'remove':
    case 'unregister':
        switch(subcommand) {
            case 'hook':
                utils.unregisterHook(argv._[0], done)
                break

            case 'key':
                utils.unregisterKey(argv._[0], done)
                break

            default:
                unknown()
        }
        break

    case 'update':
        switch(subcommand) {
            case 'hook':
                utils.unregisterHook(argv._[0], function (err) {
                    if(err)
                        done(err)
                    else
                        utils.registerHook(argv._[0], argv._[1], done)
                })
                break

            case 'key':
                utils.unregisterKey(argv._[0], function (err) {
                    if(err)
                        done(err)
                    else
                        utils.registerKey(argv._[1], done)
                })
                break

            default:
                unknown()
        }
        break

    case 'ls':
    case 'list':
        switch(subcommand) {
            case 'hook':
            case 'hooks':
                utils.listHooks(done)
                break

            case 'key':
            case 'keys':
                utils.listKeys(done)
                break

            default:
                unknown()
        }
        break

    case 'run':
        utils.runHook(subcommand, function (err, output) {
            if(err)
                done(err)
            else
                console.log(output)
        })
        break

    case 'start':
        server(argv)
        break

    case 'stop':
        var force = subcommand === 'force' || argv.f || argv.force

        utils.stopServer(force, done)
        break

    case 'clean':
    case 'cleanup':
    case 'reset':
        require('./lib/cleanup')
        break

    case 'version':
        printVersion()
        break

    case 'help':
        printHelp()
        break

    default:
        unknown()
}