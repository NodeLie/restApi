const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
    if(req.method == "OPTIONS") {
        next()
    }

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403)
        if (!user) return res.sendStatus(403)
        req.user = user
        next()
    })
}