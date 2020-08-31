const express = require('express')
const router = express.Router()
const md5 = require('md5')
const { validationResult, check } = require('express-validator')
const {User} = require('../models/user.model')
const auth = require('../middleware/auth')
const {hidePartEmail} = require('../utils')



router.post('/registration', [
    check('login').exists().withMessage('login field is required').isLength({min: 3}).withMessage('must be at least 3 chars long'),
    check('password').exists().withMessage('password field is required').isLength({min: 6}).withMessage('must be at least 6 chars long'),
    check('email').exists().withMessage('email field is required').isEmail().normalizeEmail().withMessage('invalid email').custom(value => {
        return User.findOne({email:value}).then(user => {
            if (user) {
                return Promise.reject('E-mail already in use')
            }
        });
    }),
], async (req, res) => {
    try {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {login, password, email} = req.body
        if (login && password && email) {
            req.body.password = md5(password)
            const user = new User(req.body)
            await user.save()
            res.statusCode = 201
            res.ok = true
            return res.json({data: {message: 'registration completed successfully'}})
        } else {
            res.statusCode = 400
            res.ok = false
            return res.json({message: 'partial information'})
        }

    } catch (e) {
        res.statusCode = 400
        res.ok = false
        if (e.code === 11000){
            const field = Object.keys(e.keyPattern)[0]
            e.message = `${field} already used in the system`
        }
        return res.json({message: e.message})
    }
})

router.post('/auth', [
    check('login').exists().withMessage('login field is required').isLength({min: 3}).withMessage('must be at least 3 chars long'),
    check('password').exists().withMessage('password field is required').isLength({min: 6}).withMessage('must be at least 6 chars long'),
], async (req, res) => {
    try {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        let {login, password} = req.body
        if (login && password) {
            password = md5(password)
            const user = await User.findOne({login, password})
            if (!user) {
                res.statusCode = 404
                res.ok = false
                return res.json({message: 'user not found'})
            }
            const token = user.generateAuthToken()
            res.header('Authorization', token)
            res.json({data: {token}})
        } else {
            res.statusCode = 400
            res.ok = false
            return res.json({message: 'partial information'})
        }
    } catch (e) {

    }
})


router.post('/change_password', [
    check('new_password').exists().withMessage('new_password field is required').isLength({min: 6}).withMessage('must be at least 6 chars long'),
] , auth, async (req, res) => {
    try {
        if (!req.auth.status) {
            res.statusCode = req.auth.code
            res.ok = false
            return res.json({message: req.auth.text})
        }
        let {old_password, new_password} = req.body

        if (old_password && new_password) {
            old_password = md5(old_password)
            const user = await User.findOne({password: old_password})
            if (!user) {
                res.statusCode = 400
                res.ok = false
                return res.json({message: 'wrong password'})
            }
            user.password = md5(new_password)
            await user.update()
            res.statusCode = 200
            res.ok = true
            res.json({data: {message: 'password successfully change'}})
        } else {
            res.statusCode = 400
            res.ok = false
            return res.json({message: 'partial information'})
        }
    } catch (e) {
        res.statusCode = 400
        res.ok = false
        return res.json({message: 'bad request'})
    }
})

router.get('/user', auth, async (req, res) => {
    try {
        const userLogin = req.query.login
        if (!userLogin) {
            res.statusCode = 400
            res.ok = false
            return res.json({message: 'partial information'})
        }
        const user = await User.findOne({login: userLogin})
        if (!user) {
            res.statusCode = 400
            res.ok = false
            return res.json({message: 'user not found'})
        }
        const {login, email, firstName, lastName} = user

        if (req.auth.status && req.user.login === login) {
            res.statusCode = 200
            res.ok = true
            return res.json({data: login, email, firstName, lastName})
        } else {
            const newEmail = hidePartEmail(email)
            res.statusCode = 200
            res.ok = true
            return res.json({data: login, email: newEmail, firstName, lastName})
        }
    } catch (e) {
        res.statusCode = 400
        res.ok = false
        return res.json({message: e.message})
    }
})

module.exports = router