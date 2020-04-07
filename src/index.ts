const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

app.get('/', (req: any, res: any) => res.send('Hello World'));
app.listen(PORT, () => console.log(`I'm all ears on ${ PORT }`))

var https = require('follow-redirects').https;
var fs = require('fs');

var options = {
  'method': 'GET',
  'hostname': 'extendwebsite.com',
  'path': '/wp-json/wc/v2/products',
  'headers': {
    'Authorization': 'Basic Y2tfODg1NmUwOWQ1MDMwYjdjNmJhM2E1N2NiZjIwZTlkNzk2ODYxMTliMDpjc185YjkxZGQ5NmU4NjMxNzM0MmQ3YTdjYTg3MzUyNTZmODZhMDg5M2Uz',
    'Cookie': '__cfduid=d36e6e652677dd5f6fd03c3affb94d1531585433794'
  },
  'maxRedirects': 20
};
