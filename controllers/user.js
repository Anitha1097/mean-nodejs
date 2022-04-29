const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10).then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
            .then(result => {
                res.status(201).json({
                    message: "User created!",
                    result: result
                });
            })
            .catch(err => {
                res.status(500).json({
                    message: "Email already exist!"
                });
            });
    });
}

exports.userLogin = (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user && req.body.type == 'login') {
                return res.status(401).json({
                    message: "Auth failed"
                });
            } else if (!user && req.body.type == 'socialLogin') {
                bcrypt.hash(req.body.password, 10).then(hash => {
                    const user = new User({
                        email: req.body.email,
                        password: hash
                    });
                    user.save()
                        .then(result => {
                            res.status(201).json({
                                message: "User created!",
                                result: result
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: "There's a problem to save user!"
                            });
                        });
                });
            }
            fetchedUser = user;
            if (req.body.type == 'login') {
                return bcrypt.compare(req.body.password, user.password);
            } else if (req.body.type == 'socialLogin') {
                return req.body.password;

            }
        })
        .then(result => {
            if (!result) {
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            const token = jwt.sign({ email: fetchedUser.email, userId: fetchedUser._id },
                process.env.JWT_KEY, { expiresIn: "1h" }
            );
            res.status(200).json({
                status: 'User Created',
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id,
                type: req.body.type
            });
        })
        .catch(err => {
            return res.status(401).json({
                message: "Invalid authentication credentials!"
            });
        });
}
