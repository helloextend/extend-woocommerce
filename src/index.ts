// USFCA 2020, Licensed to Extend
/* START IMPORTS */
import productUpdateController from "./ProductUpdateController";
import contractController from './ContractController';

const express = require('express');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

const app = express();
app.use(bodyParser.json());

/* END IMPORTS */

/* START SETUP */

// Default Path
app.get('/', (req: any, res: any) =>
  res.send("Extend WooCommerce Integration Demo. Endpoint '/' does not do anything. Refer to documentation"),
);

// Get Product Update
app.get('/product-update', () => productUpdateController.updateProducts());

// Post Contract
app.post('/contract', (req: any, res: any) => contractController.createContracts(req, res));

// Get Endpoints
app.get('/endpoints', (req: any, res: any) =>
  res.send("Current Endpoints<br/>----------------<br/>/product-update<br/>/contract<br/>---<br/>That's all."),
);

app.listen(PORT, () => console.log(`I'm all ears on ${PORT}`));

/* END SETUP */