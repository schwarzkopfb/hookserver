/**
 * Created by schwarzkopfb on 15/8/28.
 */

var fs   = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    DIR  = __dirname + '/../hooks',
    KEY  = __dirname + '/../keys.json'

function ensureHookDirectory(callback) {
    fs.exists(DIR, function (exists) {
        if(exists)
            fs.stat(DIR, function (err, stat) {
                if(err)
                    callback(err)
                else if(stat.isDirectory()) {
                    fs.chmod(DIR, 0700, function (err) {
                        if(err)
                            callback(err)
                        else
                            fs.readdir(DIR, function (err, files) {
                                if(err)
                                    callback(err)
                                else {
                                    var error, pending = files && files.length || 0

                                    function done(err) {
                                        if(error) return

                                        if(error = err)
                                            callback(err)
                                        else
                                            --pending || callback()
                                    }

                                    if(pending)
                                        files.forEach(function (file) {
                                            fs.chmod(DIR + '/' + file, 0500, done)
                                        })
                                    else
                                        callback()
                                }
                            })
                    })
                }
                else
                    callback('NOT_DIR')
            })
        else
            fs.mkdir(DIR, function (err) {
                if(err)
                    callback(err)
                else
                    fs.chmod(DIR, 0700, callback)
            })
    })
}

exports.ensureHookDirectory = ensureHookDirectory

function ensureKeyFile(callback) {
    fs.exists(KEY, function (exists) {
        if(exists)
            fs.stat(KEY, function (err, stat) {
                if(err)
                    callback(err)
                else if(stat.isFile()) {
                    fs.chmod(KEY, 0600, callback)
                }
                else
                    callback('NOT_FILE')
            })
        else
            fs.writeFile(KEY, '[]', { encoding: 'utf8' }, function (err) {
                if(err)
                    callback(err)
                else
                    fs.chmod(KEY, 0600, callback)
            })
    })
}

exports.ensureKeyFile = ensureKeyFile

function watchKeyFile(callback) {
    var keys = []

    function dropKeys() {
        for(var i = 0, l = keys.length; i < l; i++)
            keys.shift()
    }

    function loadKeys(callback) {
        fs.readFile(KEY, { encoding: 'utf8' }, function (err, contents) {
            if(err)
                callback(err)
            else {
                dropKeys()

                var keyList = JSON.parse(contents)

                for(var i = 0, l = keyList.length; i < l; i++)
                    keys.push(keyList[i])

                callback()
            }
        })
    }

    fs.watchFile(KEY, { persistent: false }, function () {
        // reload keys on file change
        loadKeys(function (err) {
            if(err)
                throw err
        })
    })

    loadKeys(function (err) {
        if(err)
            callback(err)
        else
            callback(null, keys)
    })
}

exports.watchKeyFile = watchKeyFile

function unwatchKeyFile() {
    fs.unwatchFile(KEY)
}

exports.unwatchKeyFile = unwatchKeyFile

function registerHook(name, scriptPath, callback) {
    existsHook(name, function (exists) {
        if(exists)
            callback('ALREADY_EXISTS')
        else
            fs.readFile(path.resolve(process.cwd(), scriptPath), { encoding: 'utf8' }, function (err, contents) {
                if(err)
                    callback(err)
                else {
                    var installPath = DIR + '/' + name + '.sh'

                    fs.writeFile(installPath, contents, { encoding: 'utf8' }, function (err) {
                        if (err)
                            callback(err)
                        else
                            fs.chmod(installPath, 0500, callback)
                    })
                }
            })
    })
}

exports.registerHook = registerHook

function unregisterHook(name, callback) {
    var hookFilePath = DIR + '/' + name + '.sh'

    fs.exists(hookFilePath, function (exists) {
        if(!exists)
            callback()
        else
            fs.unlink(hookFilePath, callback)
    })
}

exports.unregisterHook = unregisterHook

function existsHook(name, callback) {
    fs.exists(DIR + '/' + name + '.sh', callback)
}

exports.existsHook = existsHook

function listHooks(callback) {
    fs.readdir(DIR, function (err, files) {
        if(err)
            callback(err)
        else
            callback(null, Array.isArray(files) && files.map(function (file) { return path.basename(file, '.sh') }) || [])
    })
}

exports.listHooks = listHooks

function runHook(name, callback) {
    existsHook(name, function (exists) {
        if(!exists)
            callback('NOT_EXISTS')
        else
            exec(
                '"' + DIR + '/' + name + '.sh"',

                function (err, stdout, stderr) {
                    if (err)
                        callback(err)
                    else
                        callback(null, stdout || stderr)
                }
            )
    })
}

exports.runHook = runHook

function registerKey(key, callback) {
    fs.readFile(KEY, { encoding: 'utf8' }, function (err, contents) {
        if(err)
            callback(err)
        else {
            var keys = JSON.parse(contents)

            if(!~keys.indexOf(key))
                keys.push(key)

            fs.writeFile(KEY, JSON.stringify(keys), { encoding: 'utf8' }, callback)
        }
    })
}

exports.registerKey = registerKey

function unregisterKey(key, callback) {
    fs.readFile(KEY, { encoding: 'utf8' }, function (err, contents) {
        if(err)
            callback(err)
        else {
            var keys = JSON.parse(contents), i

            if(~(i = keys.indexOf(key)))
                keys.splice(i, 1)

            fs.writeFile(KEY, JSON.stringify(keys), { encoding: 'utf8' }, callback)
        }
    })
}

exports.unregisterKey = unregisterKey

function listKeys(callback) {
    fs.readFile(KEY, { encoding: 'utf8' }, function (err, contents) {
        if(err)
            callback(err)
        else
            callback(null, JSON.parse(contents))
    })
}

exports.listKeys = listKeys

var pidPath = path.resolve(__dirname + '/../hookserver.pid')

function stopServer(force, callback) {
    fs.exists(pidPath, function (exists) {
        if(!exists)
            callback('NOT_RUNNING')
        else
            fs.readFile(pidPath, { encoding: 'utf8' }, function (err, pid) {
                if(err)
                    callback(err)
                else
                    exec('kill ' + (force ? '-9 ' : '') + pid, function (err) {
                        if(err)
                            callback(err)
                        else if(force)
                            fs.unlink(pidPath, callback)
                        else
                            callback()
                    })
            })
    })
}

exports.stopServer = stopServer

var charGroups = [
    'abcdefghijklmnopqrstuvwxyz',  // lowercase
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',  // uppercase
    '01234567890',                 // numbers
    '!$&\'()*+-./:;<=>?@[]^-`{|}~' // punctuators
]

function rand(max) {
    return Math.round(Math.random() * max)
}

function randFrom(arr) {
    return arr[ rand(arr.length - 1) ]
}

function generateKey(length) {
    if(!length)
        length = 50

    var group, result = ''

    while(length--) {
        group = randFrom(charGroups)
        result += randFrom(group)
    }

    return result
}

exports.generateKey = generateKey

var keyValidator     = new RegExp('[' + charGroups.map(function (group) { return group.replace(']', '\\]') }).join('') + ']', 'g'),
    duplicateRemover = /(.)(?=.*\1)/g

function validateKey(key) {
    return key.replace(keyValidator, '').replace(duplicateRemover, '')
}

exports.validateKey = validateKey

///////////////////////////////////

Array.prototype.remove = function (items) {
    if(!Array.isArray(items))
        var args = Array.prototype.slice.call(arguments)
    else
        args = items

    var item, i

    while(item = args.shift()) {
        if(~(i = this.indexOf(item)))
            this.splice(i, 1)
    }

    return this
}