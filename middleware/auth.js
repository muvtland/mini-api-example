const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = function (req, res, next) {
    const token = req.headers['authorization']
    if (!token) {
        req.auth = { status: false, text: 'Access denied. No token provided.', code: 401}
        return next()
    }

    try {
        req.auth = { status: true}
        req.user = jwt.verify(token, config.get('privateKey'))
        req.user.token = token
        return next()
    } catch (ex) {
        req.auth = { status: false, text: 'Invalid token', code: 401}
        return next()
    }
};