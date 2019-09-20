const bcrypt = require("bcryptjs")

const Users = require("../users/users-model.js")

module.exports = (req, res, next) => {
    let { username, password } = req.headers
    console.log('from middleware', username)
    Users.findBy({ username })
        .first()
        .then(user => {
            if (user && bcrypt.compareSync(password, user.password)) {
                next()
            } else {
                res
                    .status(401)
                    .json({ message: "You cannot pass! PH" })
            }
        })
        .catch(error => {
            res
                .status(500)
                .json(error)
        })
}
