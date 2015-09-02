/**
 * Created by schwarzkopfb on 15/9/2.
 */

var crypto = require('crypto')

function md5(contents) {
    return crypto.createHash('md5').update(contents).digest('hex')
}

module.exports = md5