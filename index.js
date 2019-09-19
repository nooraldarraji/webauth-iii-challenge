const express = require("express");
const bcrypt = require("bcryptjs");
const server = express()
const cors = require("cors")
const jwt = require('jsonwebtoken')

const Users = require("./users/users-model.js")
const passwordHash = require("./middlewares/password-hash.js")
const sessionCookie = require("./middlewares/session-cookie.js")
const session = require("express-session")


const sessionConfig = {
    name: "hamster",
    secret: process.env.SESSION_SECRET || "keep it secret, keep it safe",
    cookie: {
        maxAge: 1000 * 60 * 60,
        secure: false,
        httpOnly: true
    },
    resave: false, // resave cookie on changes -Luis
    saveUninitialized: true // GDPR Complince, to show the new users if they want to save the cookie or not!
}

function generateToken(user) {
    const payload = {
        username: user.username
    }
    const secret = 'Keep it lowkey'
    const options = {
        expiresIn: '1d'
    }
    return jwt.sign(payload, secret, options)
}

server.use(express.json())
server.use(session(sessionConfig)) // session config should be an Object!
server.use(
    cors({
        origin: "http://localhost:8000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true
    })
);

server.get("/", (req, res) => {
    res.send("It's alive!")
})

server.post("/api/register", (req, res) => {
    console.log(req.body)
    let { username, password } = req.body

    console.log(username)
    const hash = bcrypt.hashSync(password, 2)

    Users.add({ username, password: hash })
        .then(saved => {
            res
                .status(201)
                .json(saved)
        })
        .catch(error => {
            res
                .status(500)
                .json(error)
        })
})

server.post("/api/login", (req, res) => {
    let { username, password } = req.body

    Users.findBy({ username })
        .first()
        .then(user => {
            req.session.user = user
            if (user && bcrypt.compareSync(password, user.password)) {
                const token = generateToken(user)
                res
                    .json({ message: token })
            } else {
                res
                    .status(401)
                    .json({ message: "You cannot pass!" })
            }
        })
        .catch(error => {
            res
                .status(500)
                .json(error)
        })
})

server.get("/api/users", passwordHash, sessionCookie, (req, res) => {
    Users.find()
        .then(users => {
            res.json(users)
        })
        .catch(err => res.send(err))
})

server.get("/api/logout", (req, res) => {
    if (req.session) {
        req.session.destroy(error => {
            if (error) {
                res
                    .status(500)
                    .json({
                        message: "You can check out anytime you like, but you can never leave"
                    })
            } else {
                res
                    .json({ message: "Bye come back soon" })
            }
        });
    } else {
        res
            .json({ messsage: "already logged out" })
    }
})


const port = process.env.PORT || 8000;

server.listen(port, () => console.log(`Listining on port ${port}`));