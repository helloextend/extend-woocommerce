import productUpdateController from "./ProductUpdateController";

const express = require('express');
const PORT = process.env.PORT || 5000

const app = express();

app.get('/product-update', () => productUpdateController.updateProducts());
app.listen(PORT, () => console.log(`I'm all ears on ${ PORT }`))
