const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

app.get('/', (req: any, res: any) => res.send('Hello World'));
app.listen(PORT, () => console.log(`I'm all ears on ${ PORT }`))
