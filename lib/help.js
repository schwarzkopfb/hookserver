/**
 * Created by schwarzkopfb on 15/8/31.
 */

var commands = {
    'add hook': {
        args: {
            name: 'Name of the hook.',
            scriptPath: 'File path pointing to a bash script to be executed when the webhook is triggered.'
        },

        desc: 'Register a named webhook.'
    },

    'add key': {
        args: {
            key: {
                desc: 'The key itself. If not provided, a random-generated key will be added and displayed.',
                optional: true
            }
        },

        desc: 'Register a new security key and save its md5 hash. This key allows access to any registered webhook on this server. You can use multiple keys at the same time.',

        opts: {
            l: {
                aliases: [ 'length' ],
                desc: 'If no key provided, you can set the length of the random-generated key with this option.'
            }
        }
    },

    'update hook': {
        args: {
            name: 'Name of the hook.',
            scriptPath: 'File path pointing to the new bash script to be executed when the webhook is triggered.'
        },

        desc: 'Update a previously registered webhook.'
    },

    'update key': {
        args: {
            currentKey: 'The key to be updated.',
            newKey: 'The new key replacing the current one.'
        },

        desc: 'Update a previously registered security key.'
    },

    'remove hook': {
        args: { 'name': 'Name of the hook.' },
        desc: 'Unregister a previously added webhook.'
    },

    'remove key': {
        args: { 'key': 'The key to be dropped.' },
        desc: 'Drop a previously added security key.'
    },

    'list hooks': {
        args: [],
        desc: 'Display a list of registered webhooks.'
    },

    'list keys': {
        args: [],
        desc: 'Display a list of stored md5 hashes generated from security keys.'
    },

    'run': {
        args: { 'hookName': 'Name of the hook to run.' },
        desc: 'Trigger a webhook from commandline.'
    },

    'start': {
        args: [],
        desc: 'Start up the webhook http server.',

        opts: {
            d: {
                aliases: [ 'daemonize' ],
                desc: 'This option allows you to run the server in the background detached from this shell.'
            },

            p: {
                aliases: [ 'port' ],
                desc: 'Overwrite default port (6086).'
            },

            l: {
                aliases: [ 'log' ],
                desc: 'If running deamonized, you can set the log path of the server with this flag.'
            }
        }
    },

    'stop': {
        args: [],
        desc: 'Stop server daemon.',

        opts: {
            f: {
                aliases: [ 'force' ],
                desc: 'Set this option to avoid waiting the server to close its open connections and stop it immediately.'
            }
        }
    },

    'cleanup': {
        args: [],
        desc: 'Delete all the registered hooks and keys. Warning: this action cannot be undone.'
    },

    'version': {
        args: [],
        desc: 'Show Hookserver version number.'
    },

    'help': {
        args: [],
        desc: 'Show this help.'
    }
}

var options = {
    v: {
        aliases: [ 'version' ],
        desc: 'Set this option without any command or subcommand to display Hookserver version number.'
    },

    h: {
        aliases: [ 'help' ],
        desc: 'Set this option without any command or subcommand to display this help.'
    }
}

// code to display help based on upper descriptors //

var manifest = require('../package.json'),
    colors   = require('colors')

colors.setTheme({
    title: [ 'bold', 'underline' ]
})

var MAX_LINE_LENGTH = 50

function truncate(text) {
    var words  = text.split(' '),
        result = [],
        line   = ''

    for(var i = 0, l = words.length; i < l; i++) {
        var nextWord = words[i]

        if(line.length + nextWord.length + 1 > MAX_LINE_LENGTH) {
            result.push(line)
            line = nextWord + ' '
        }
        else
            line += nextWord + ' '
    }

    if(line.length)
        result.push(line)

    return result
}

function prefixOption(name, noColor) {
    return (name.length === 1 ? '-' : '--') + (!noColor ? name.bold : name)
}

function generateHelp() {
    var commandList = Object.keys(commands),
        maxLength   = 0,
        text        = '',
        lengths     = {}

    var lines = commandList.reduce(function (lines, item) {
        var command     = commands[ item ],
            args        = Object.keys(command.args),
            opts        = command.opts,
            optNames    = opts && Object.keys(opts),
            line        = '  ' + manifest.name + ' ' + item.bold + (args.length ? ' ' : '') + args.map(function (arg) { var o = command.args[arg ].optional; return (o ? '[' : '') + '<' + arg.yellow + '>' + (o ? ']' : '') }).join(' '),
            lineNoColor = '  ' + manifest.name + ' ' + item + (args.length ? ' ' : '') + args.map(function (arg) { var o = command.args[arg ].optional; return (o ? '[' : '') + '<' + arg + '>' + (o ? ']' : '') }).join(' ')

        if(opts) {
            line        += ' ' + optNames.map(function (opt) { return '[' + prefixOption(opt, true).blue + ']' }).join(' ')
            lineNoColor += ' ' + optNames.map(function (opt) { return '[' + prefixOption(opt, true) + ']' }).join(' ')
        }

        var length = lineNoColor.length

        if(length > maxLength)
            maxLength = length - args.length

        lengths[line] = length
        lines.push(line)

        return lines
    }, [])

    maxLength += 4

    lines = lines.reduce(function (lines, line, i) {
        var cmd       = commands[ commandList[i] ],
            argList   = Object.keys(cmd.args),
            opts      = cmd.opts,
            optList   = opts && Object.keys(opts),
            desc      = truncate(cmd.desc),
            multiline = desc.length > 1

        lines.push(line + new Array(maxLength - lengths[ line ]).join(' ') + desc.shift())

        var currDesc

        while(currDesc = desc.shift())
            lines.push(new Array(maxLength).join(' ') + currDesc)

        if(multiline)
            lines.push('')

        if(argList.length)
            for(var i = 0, l = argList.length; i < l; i++) {
                var arg = cmd.args[ argList[i] ]

                line        = ' ' + new Array(manifest.name.length).join(' ') + ' ⇒ ' + argList[ i ].yellow + ':'
                lineNoColor = ' ' + new Array(manifest.name.length).join(' ') + ' ⇒ ' + argList[ i ] + ':'

                if(typeof arg === 'string')
                    desc = truncate(arg)
                else
                    desc = truncate(arg.desc)

                multiline = desc.length > 1

                line = line + new Array(maxLength - lineNoColor.length).join(' ') + desc.shift()

                lines.push(line)

                while(currDesc = desc.shift())
                    lines.push(new Array(maxLength).join(' ') + currDesc)

                if(multiline)
                    lines.push('')
            }

        if(opts) {
            var lineNoColor

            for (var i = 0, l = optList.length; i < l; i++) {
                var item = optList[ i ]

                line        = ' ' + new Array(manifest.name.length).join(' ') + ' ⇒ ' + [ item ].concat(opts[ item ].aliases).map(function (args) { return prefixOption(args, true).blue }).join(', ') + ':'
                lineNoColor = ' ' + new Array(manifest.name.length).join(' ') + ' ⇒ ' + [ item ].concat(opts[ item ].aliases).map(function (args) { return prefixOption(args, true) }).join(', ') + ':'

                desc      = truncate(opts[ optList[ i ] ].desc)
                multiline = desc.length > 1

                line = line + new Array(maxLength - lineNoColor.length).join(' ') + desc.shift()

                lines.push(line)

                while (currDesc = desc.shift())
                    lines.push(new Array(maxLength).join(' ') + currDesc)

                if (multiline)
                    lines.push('')
            }
        }

        if(!multiline)
            lines.push('')

        return lines
    }, [])

    text += 'Commands'.title + ':\n\n' + lines.join('\n') + '\n\n'

    var optionList = Object.keys(options)

    lengths = {}

    lines = optionList.map(function (item) {
        var names = [ item ].concat(options[ item ].aliases).map(function (args) { return prefixOption(args) })

        var line        = '  ' + names.join(', '),
            lineNoColor = '  ' + [ item ].concat(options[ item ].aliases).map(function (args) { return prefixOption(args, true) }).join(', '),
            length      = lineNoColor.length

        if(length > maxLength)
            maxLength = length

        lengths[line] = length

        return line
    })

    lines = lines.reduce(function (lines, line, i) {
        var desc = truncate(options[ optionList[i] ].desc)

        lines.push(line + new Array(maxLength - lengths[line]).join(' ') + desc.shift())

        var currDesc

        while(currDesc = desc.shift())
            lines.push(new Array(maxLength).join(' ') + currDesc)

        lines.push('')

        return lines
    }, [])

    return text + 'Options'.title + ':\n\n' + lines.join('\n')
}

module.exports = 'Usage'.title + ':\n\n  hookserver <command> [<subcommand>] [<value1>] [<value2>] [options]\n\n' + generateHelp()