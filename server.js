const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const config = require('config')
const userRoutes = require('./routes/user.routes')

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.use('/api', userRoutes)

const PORT = config.get('port')

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)
mongoose.connect(config.get('mongo_url'), {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(() => {
    console.log("Connected to MongoDB...")
    app.listen(PORT, () => console.log('server started port:' + PORT))
}).catch(err => console.error("Could not connect to MongoDB..." + err))


