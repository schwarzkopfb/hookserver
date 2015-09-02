/**
 * Created by schwarzkopfb on 15/9/1.
 */

global.argv = require('minimist')(process.argv.slice(2))

var utils  = require('../lib/utils'),
    colors = require('colors')

try {
    utils.ensureConfigDirectorySync()
    utils.ensureLogFileSync()

    utils.ensureHookDirectory(function (err) {
        if (err)
            throw err
        else
            utils.ensureKeyFile(function (err) {
                if (err)
                    throw err
            })
    })
}
catch(ex) {
    var msg = 'Cannot write "' + utils.APP_HOME + '". Please try running this command again as root/Administrator with the --unsafe-perm flag.'
    console.error(msg.red.bgWhite + '\n')
}