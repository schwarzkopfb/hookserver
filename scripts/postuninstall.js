/**
 * Created by schwarzkopfb on 15/9/2.
 */

var utils  = require('../lib/utils'),
    colors = require('colors')

utils.deleteConfigDirectory(function (err) {
    if(err) {
        var msg = 'Cannot delete "' + utils.APP_HOME + '". Please try running this command again as root/Administrator with the --unsafe-perm flag.'
        console.error(msg.red.bgWhite + '\n')
    }
})