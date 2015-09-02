/**
 * Created by schwarzkopfb on 15/9/2.
 */

global.argv = require('minimist')(process.argv.slice(2))

var utils  = require('../lib/utils'),
    colors = require('colors')

function print(msg) {
    console.error(msg.red)
}

utils.deleteConfigDirectory(function (err) {
    if(err)
        print('Cannot delete "' + utils.APP_HOME + '". Please try running this command again as root/Administrator.')

    try {
        utils.deleteLogFileSync()
    }
    catch(ex) {
        print('Cannot delete "' + utils.LOG_PATH + '". Please try running this command again as root/Administrator.')
    }

    try {
        utils.ensureConfigDirectorySync()
    }
    catch(ex) {
        print('Cannot recreate "' + utils.APP_HOME + '".')
    }

    try {
        utils.ensureLogFileSync()
    }
    catch(ex) {
        print('Cannot recreate "' + utils.LOG_PATH + '".')
    }

    utils.ensureHookDirectory(function (err) {
        if(err)
            print('Cannot recreate "hooks/".')
        else
            utils.ensureKeyFile(function (err) {
                if(err)
                    print('Cannot recreate "keys.json".')
            })
    })
})