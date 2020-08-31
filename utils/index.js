function hidePartEmail(email) {
    let newEmail = ''
    const charCount = email.length
    const hideCharCount = Math.ceil(charCount * 0.7)
    const randomArr = []
    let random
    for (let i = 0; i < charCount; i++) {
        random = Math.round(Math.random() * charCount)
        if (randomArr.indexOf(random) < 0) {
            randomArr.push(random)
        } else {
            i--
        }
        if (randomArr.length === hideCharCount) {
            break
        }
    }
    for (let i = 0; i < charCount; i++) {
        let needHide = randomArr.includes(i)
        if (needHide) {
            newEmail += '*'
        } else {
            newEmail += email[i]
        }
    }
    return newEmail
}


module.exports = {
    hidePartEmail
}