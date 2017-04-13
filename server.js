let express = require('express')
let app = express()
app.use(express.static('public'))
app.listen(process.env.PORT, () => console.log('Tminder app is running'))
