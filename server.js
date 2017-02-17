let express = require('express')
let app = express()
app.use(express.static('public'))
app.get('/', (req, resp) => resp.render('index.html'))
app.listen(process.env.PORT, () => console.log('Tminder app is running'))