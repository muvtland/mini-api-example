const {Schema, model} = require('mongoose')
const config = require('config')
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    login: {
        type: String,
        required: true,
        unique: true,
        index: true,
        min: 3,
        max: 255
    },
    password:{
        type: String,
        required: true,
        min: 6,
        max: 255
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: String,
    lastName: String,
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({
        login: this.login
    }, config.get('privateKey'))
}

const User = model('User', userSchema)
exports.User = User