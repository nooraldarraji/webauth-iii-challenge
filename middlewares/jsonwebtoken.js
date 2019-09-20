const jwt = require('jsonwebtoken')
const s = require('../config/secret.js')

module.exports = (req, res, next) => {
    const auth = req.headers.authorization
    console.log('from jwt mid', req.headers)
    if (auth) {
        jwt.verify(auth, s.jwtSecret, (err, decodedToken) => {

            if (err) {
                res
                    .status(401)
                    .json({ message: 'Try harder!' })
            } else {
                next()
            }
        })
    } else {
        res
            .status(400)
            .json({ message: 'No creds provided' })
    }
}