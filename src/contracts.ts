/*
 
 CONTRACT Retrieving (Marko Crnkovic)
 
 */
const request = require('request');
 
/* Interfaces */

// Object that holds customer data
interface CustomerObject {
    phone: string
    email: string
    name: string
    address: AddressObject
    shippingAddress?: AddressObject
}
// Shipping/Billing Addresses
interface AddressObject {}

// Plan key in ExtendWarrantyObject
interface PlanObject {
    purchasePrice: number
    planId: string
}
// Product key in ExtendWarrantyObject
interface ProductObject {
    referenceId: string
    purchasePrice: number
    // serialNumber omitted
}

// Error object
interface InformativeError {
    error: string
}

// Object that gets sent to Extend
// per https://developers.extend.com/2019-08-01#tag/Contracts
interface ExtendWarrantyObject {
    transactionId: string
    poNumber?: string
    transactionTotal: number
    currency: string
    transactionDate: number // epoch time

    customer: CustomerObject
    product: ProductObject
}

class ContractController {

    // Creates customer object from blob and returns it. Takes preference over shipping addres for customer details
    // but will use billing details if shipping details don't exist
    // Returns:
    //        - Object filled with customer details per Extend's formatting
    //        - or -
    //        - Error object to be passed through response
    private getCustomer(blob: any) {
        function getAddress(addrBlob: any) {
            var retObj: any = {};
            
            // adding a temporary customer object. Later we will query all
            // address objects and work with them
            var customerObj: any = {};
            
            customerObj['fname'] = addrBlob.first_name;
            customerObj['lname'] = addrBlob.last_name;
            customerObj['email'] = addrBlob.email;
            customerObj['phone'] = addrBlob.phone;
            
            retObj['address1']     = addrBlob.address_1;
            retObj['address2']     = addrBlob.address_2;
            retObj['city']         = addrBlob.city;
            retObj['provinceCode'] = addrBlob.state;
            retObj['countryCode']  = addrBlob.country;
            retObj['postalCode']   = addrBlob.postcode;
            retObj["_tmp_customer"] = customerObj;
            
            return retObj;
        }
        
        var customerMutableObject: any = {};
        
        var shippingData: any = getAddress(blob.shipping);
        var billingData: any = getAddress(blob.billing);
        
        // Extract customer data
        // Shipping data takes precedence.
        // Data from billingData gets written. data from shippingData overwrites billing data.
        // This effectivley combines both objects while giving shippingData precedence over billingData
        
        if (Object.keys(billingData._tmp_customer).length !== 0) {
            let cobj = billingData._tmp_customer;
            
            const name = cobj.fname + " " + cobj.lname;
            customerMutableObject['name'] = name;
            
            customerMutableObject['email'] = cobj.email;
            customerMutableObject['phone'] = cobj.phone;
        }
        
        if (Object.keys(shippingData._tmp_customer).length !== 0) {
            let cobj = shippingData._tmp_customer;
            
            if (cobj.fname && cobj.lname) {
                const name = cobj.fname + " " + cobj.lname;
                customerMutableObject['name'] = name;
            }
            if (cobj.email) {
                customerMutableObject['email'] = cobj.email;
            }
            
        }
        // Error checking
        if ( !(customerMutableObject.email)) {
            console.error("[Index.ts getCustomer]: Could not extract EMAIL fom customer information.");
            return {error : "[Index.ts getCustomer]: Could not extract EMAIL from customer information."} as InformativeError
        }
        
        if (!(customerMutableObject.name)) {
            console.error("[Index.ts getCustomer]: Could not extract NAME fom customer information.");
            return {error : "[Index.ts getCustomer]: Could not extract NAME from customer information."} as InformativeError
        }
        
        // Sanatize both objects.
        delete shippingData['_tmp_customer'];
        delete billingData['_tmp_customer'];
        
        // Append data to object
        customerMutableObject['address'] = shippingData;
        customerMutableObject['billingAddress'] = billingData;
        
        // By now customerMutable should conform to CustomerObject
        var customerObject: CustomerObject = customerMutableObject;
        
        return customerObject
    }


    // Parses products from woo-commerce's "line_items" into an object with {"warranties" : [], "products": []}
    // NOTE: This could be optimized for time complexity, but in reality how big
    // will a cart actually get? Even with 1k objects O(n) isn't
    // too bad
    //
    // NOTE: This is a helper function for createWarrantyObjects:lineItems
    private parseProducts(lineItems: [any]) {
        var parsed: any = {warranties: [], products: []};
        
        // Takes items with quantities > 1 and seperates them appending the extra ones to the end
        lineItems.forEach(item => {
            var quantity = item.quantity;
            while (quantity > 1) {
                lineItems.push(item);
            }
        });
        
        lineItems.forEach(item => {
            // SKU is planID with "extend-" prepended. This us denote what products are plans vs products
            if (item.sku.includes("extend-")) {
                parsed.warranties.push(item);
            } else {
                parsed.products.push(item);
            }
        })
        
        return parsed;
    }

    // creates full warranty objects that are ready to be combined with global data in createCompleteObjects:reqBody:customer:warrantyObjects
    private createWarrantyObjects(lineItems: [any]) {
        var objs = this.parseProducts(lineItems);
        var warrantyProductObjects: any[] = []; // objects get filled with warranty data and will get customer data inserted before being sent
        // Golden Path checking
        if (objs.warranties.length < 1) {
            return;
        }
        
        objs.warranties.forEach((warranty: any) => {
            
            const productSKU = warranty.meta_data[0]; // warranty should be the only thing in the meta_data array
            
            var planId = warranty.sku.split('extend-')[1]; // SKU is planID with "extend-" prepended. This us denote what products are plans vs products
            var planObject: PlanObject = { purchasePrice: (warranty.price * 100), planId: planId};
            
            // using this so it can be terminated on hit
            for (var i = 0; i < objs.products.length; i++) {
                const product = objs.products[i];
                if (product.sku === productSKU) {
                    // calculate total since woo uses 00.00 for total
                    
                    var _price: number = + product.price * 100;
                    
                    var warrantyObject: any = {}
                    warrantyObject['product'] = {referenceId: product.sku, purchasePrice: _price } // omitting serialNumber
                    warrantyObject['plan'] = planObject;
                    warrantyProductObjects.push(warrantyObject);
                    break;
                }
            };
        });
        
        return warrantyProductObjects;
    }

    /// combines global data like customer and transaction data with warranties.
    /// returns list of complete warranty objects
    private createCompleteObjects(reqBody: any, customer: any, warrantyObjects: any[] | undefined) {
        var completeObjects: ExtendWarrantyObject[] = [];
        
        if (warrantyObjects === undefined) {
            console.error("warranty objects are undefined.")
            return;
        }
        
        warrantyObjects.forEach(warranty => {
            // warranty object information
            warranty['transactionId']    = reqBody.number;
            warranty['poNumber']         = reqBody.order_key;
            warranty['transactionTotal'] = (+reqBody.total * 100); // since total is in 00.00
            warranty['currency']         = reqBody.currency; // can't find documentation on ISO standard for currency denotion
            warranty['transactionDate']  = new Date(reqBody.date_modified_gmt).valueOf(); // converts 2020-04-30T19:14:11 to epoch (hopefully)
            
            warranty['customer'] = customer;
            
            var typedCompleteObject: ExtendWarrantyObject = warranty; // type conformance/safety
            
            completeObjects.push(typedCompleteObject);
        });
        return completeObjects;
    }

    // iterates through warranties and sends them to extend
    // consider exposing as a shortcut?
    private sendRequests(warranties: ExtendWarrantyObject[] | undefined, completion: (_: boolean) => void) {
        
        if (warranties === undefined) {
            console.error("Warranties object in sendRequests is udnefined.");
            return false;
        }
        
        // WARNING: this logic might become result in race condition.
        // This is not addressed further due to the scope of the project, but please
        // consider the atomacy of "jobs"
        
        // Jobs add themselves to the this makeshift operation queue.
        // As they complete they either change from "working" to "complete" or "failed" and call checkJobs:
        // check job checks for any "working" jobs, and if there are none it calls the closure with
        // success denoting the logical inverse of the extistance of any "failed" jobs.
        var jobs: any = {};
        
        // Basic job buffer. If list includes a 'failed' job, a call has failed.
        function checkJobs() {
            var complete: boolean = true;
            var hasFailure: boolean = false;
            
            Object.keys(jobs).forEach(job => {
                if (jobs[job] === "working") {
                    complete = false;
                } else if (jobs[job] == "failed") {
                    hasFailure = true;
                }
            });
            
            if (complete) {
                if (hasFailure) {
                    completion(false);
                } else {
                    completion(true);
                }
            }
        }
        
        warranties.forEach(warranty => {
            
            var contractObject: any = {
                'method': 'POST',
                'url': 'https://api-demo.helloextend.com/stores/83d57b1a-4674-46d2-8831-373680d5637d/contracts',
                'headers': {
                    'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc',
                    'Content-Type': 'application/json'
                },
            body: '{"transactionId":"1","transactionTotal":23999,"customer":{"phone":"518-506-2642","email":"mcrnkovic@usfca.edu","name":"Marko Crnkovic","address":{"address1":"1 Stockton St","address2":"","city":"San Francisco","countryCode":"USA","postalCode":"90001","provinceCode":"CA"},"shipping-address":{"address1":"2 Stockton St","address2":"","city":"San Francisco","countryCode":"USA","postalCode":"90001","provinceCode":"CA"}},"product":{"referenceId":"1654385435","purchasePrice":23999},"currency":"USD","transactionDate":1587411905,"plan":{"purchasePrice":499,"planId":"10001-misc-elec-base-replace-1y"}}'
            }
            
            jobs[warranty.transactionId] = "working";
            
            request(contractObject, (error: any, res: any, body: any) => {
                if (error) {
                    console.error(error);
                    jobs[warranty.transactionId] = "failed";
                } else if (res.statusCode != 201) {
                    console.error(body);
                    console.error(res.code);
                    jobs[warranty.transactionId] = "failed";
                } else {
                    console.log(body);
                    jobs[warranty.transactionId] = "complete";
                }
                checkJobs();
            });
            
        });
        return true;
    }

    // Essentailly the main function
    // Runs on golden path flow
    public createContracts(req: any, res: any) {
        
        // Parse WooCommerce Object
        var customer: CustomerObject | InformativeError = this.getCustomer(req.body);
        
        if (customer instanceof Error) {
            // getCustomer IS the error object now, so we can pass
            // it through the response.
            res.status(500).send(customer);
            return;
        }
        
        // Creates objects with product, and plan tags filled
        var warrantyObjects = this.createWarrantyObjects(req.body.line_items);
        
        // Populates the rest of the data. This data is global, that's why it's abstracted to
        // another function.
        var completeObjects = this.createCompleteObjects(req.body, customer, warrantyObjects);
        // console.log(completeObjects);
        // Send contracts to Extend. Monitor success status
        this.sendRequests(completeObjects, success => {
            // Report success back to webhook in case it's monitoring
            // Helpful for debugging
            if (success === true) {
                res.sendStatus(200);
            } else {
                console.error("Error in sending contracts to Extend. Look at above logs");
                res.sendStatus(500);
            }
        });
    }
}

// Creating singleton interface. This makes sure that there's only one controller.
const contractController = new ContractController()
Object.freeze(contractController)

export default contractController;