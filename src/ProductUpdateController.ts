/*

    Product Update Controller (Tony)

*/

var request = require('request');

class ProductUpdateController {
    updateProducts() {

        var jsonResponseWebsite: any;
        var jsonResponseExtend: any;
        var options = {
            'method': 'GET',
            'url': 'https://extendwebsite.com/wp-json/wc/v2/products',
            'headers': {
                'Authorization': 'Basic Y2tfNjVlYWE4ZmJlNmM3NDk0ZGJiZjdiNDU5ZDhjODhhZDI2ZjlkZTcyMzpjc19jODRjYmVjYTAxNTg3ZjE2MjI2ZmUzNTg1MjQ3NDI0YTk3ODE4YjUy',
                'Cookie': '__cfduid=da543047de25b2ea9e8001e6e997a7b151588177883'
            }
        };
        var options2 = {
            'method': 'GET',
            'url': 'https://api-demo.helloextend.com/stores/83d57b1a-4674-46d2-8831-373680d5637d/products',
            'headers': {
                'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc'
            }
        };
        //API call to Website
        request(options, function (error: any, response: any) { 
            if (error) throw new Error(error);
            jsonResponseWebsite = JSON.parse(response.body);

            //API call to Extend
            request(options2, function (error: any, response: any) { 
                if (error) throw new Error(error);
                jsonResponseExtend = JSON.parse(response.body);

                var counter: number = 0;
                var counter2: number = 0;
                let myMap = new Map()
                for (const property2 in jsonResponseExtend) {
                    var sku2 = parseInt(jsonResponseExtend[counter2]["referenceId"]);
                    var title2 = jsonResponseExtend[counter2]["title"];
                    myMap.set(sku2,title2);
                    counter2++;
                }
                for (const property in jsonResponseWebsite) {
                    var id = parseInt(jsonResponseWebsite[counter]["id"]);
                    var price = (parseInt(jsonResponseWebsite[counter]["price"])*100)+99;
                    var sku = parseInt(jsonResponseWebsite[counter]["sku"]);
                    var title = jsonResponseWebsite[counter]["name"];
                    var image = jsonResponseWebsite[counter]["images"][0]["src"];
                    var variation =jsonResponseWebsite[counter]["attributes"][0];
                    if (variation === undefined || variation.length == 0) {
                        //Do Nothing
                    }
                    else {
                        variation = variation["variation"];
                    }
                    const now = new Date()  
                    const secondsSinceEpoch = Math.round(now.getTime() / 1000)
                    console.log("Got a response: ", (myMap.get(sku)),title);
                    if (sku == 50) {
                        counter++;
                        continue;
                    }
                    if (variation == true) {
                        var jsonResponseVariant;
                        var index = 0;
                        var array =jsonResponseWebsite[counter]["variations"];
                        while (index < array.length) { 
                            //API CALL get variation
                            var options7 = {
                                'method': 'GET',
                                'url': 'https://extendwebsite.com/wp-json/wc/v2/products/'+array[index],
                                'headers': {
                                'Authorization': 'Basic Y2tfNjVlYWE4ZmJlNmM3NDk0ZGJiZjdiNDU5ZDhjODhhZDI2ZjlkZTcyMzpjc19jODRjYmVjYTAxNTg3ZjE2MjI2ZmUzNTg1MjQ3NDI0YTk3ODE4YjUy',
                                'Cookie': '__cfduid=da543047de25b2ea9e8001e6e997a7b151588177883'
                                }
                            };
                            index++;
                            request(options7, function (error: any, response: any) { 
                                if (error) throw new Error(error);
                                jsonResponseVariant = JSON.parse(response.body);
                                console.log(jsonResponseVariant);

                                var priceVariant = (parseInt(jsonResponseVariant["price"])*100)+99;
                                var skuVariant = parseInt(jsonResponseVariant["sku"]);
                                var titleVariant = jsonResponseVariant["name"];
                                var imageVariant = jsonResponseVariant["images"]
                                if (imageVariant === undefined || imageVariant.length == 0) {
                                    imageVariant = "";
                                }
                                else {
                                    imageVariant = imageVariant[0]["src"];
                                }

                                if (myMap.has(skuVariant)) {
                                    var options8 = {
                                        'method': 'PUT',
                                        'url': 'https://api-demo.helloextend.com/stores/83d57b1a-4674-46d2-8831-373680d5637d/products/'+skuVariant,
                                        'headers': {
                                        'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc',
                                        'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({"imageUrl":imageVariant,"updatedAt":secondsSinceEpoch,"price":priceVariant,"referenceId":skuVariant,"title":titleVariant})

                                    };
                                    request(options8, function (error: any, response: any) { 
                                        if (error) throw new Error(error);
                                        console.log(response.body);
                                    });
                                    myMap.delete(skuVariant);
                                }
                                else {
                                var options9 = {
                                    'method': 'POST',
                                    'url': 'https://api-demo.helloextend.com/stores/83d57b1a-4674-46d2-8831-373680d5637d/products',
                                    'headers': {
                                    'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc',
                                    'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({"createdAt":secondsSinceEpoch,"storeId":"83d57b1a-4674-46d2-8831-373680d5637d","enabled":false,"approved":false,"imageUrl":imageVariant,"overrides":{"mfrWarranty":{"parts":12,"url":"apple.com/warranty","labor":12}},"updatedAt":secondsSinceEpoch,"identifiers":{},"plans":["10001-misc-elec-base-replace-1y","10001-misc-elec-base-replace-2y","10001-misc-elec-base-replace-3y"],"mfrWarranty":{},"warrantyStatus":"warrantable","price":priceVariant,"referenceId":skuVariant,"title":titleVariant})

                                };
                                request(options9, function (error: any, response: any) { 
                                    if (error) throw new Error(error);
                                    console.log(response.body);
                                });
                                }
                            }); 
                        }
                        counter++;
                        continue;

                    }
                    if (myMap.has(sku)) {
                        var options3 = {
                            'method': 'PUT',
                            'url': 'https://api-demo.helloextend.com/stores/83d57b1a-4674-46d2-8831-373680d5637d/products/'+sku,
                            'headers': {
                                'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc',
                                'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({"imageUrl":image,"updatedAt":secondsSinceEpoch,"price":price,"referenceId":sku,"title":title})
                        };
                        request(options3, function (error: any, response: any) { 
                            if (error) throw new Error(error);
                            console.log(response.body);
                        });
                        myMap.delete(sku);
                    }
                    else {
                        var options4 = {
                            'method': 'POST',
                            'url': 'https://api-demo.helloextend.com/stores/83d57b1a-4674-46d2-8831-373680d5637d/products',
                            'headers': {
                                'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({"createdAt":secondsSinceEpoch,"storeId":"83d57b1a-4674-46d2-8831-373680d5637d","enabled":false,"approved":false,"imageUrl":image,"overrides":{"mfrWarranty":{"parts":12,"url":"apple.com/warranty","labor":12}},"updatedAt":secondsSinceEpoch,"identifiers":{},"plans":["10001-misc-elec-base-replace-1y","10001-misc-elec-base-replace-2y","10001-misc-elec-base-replace-3y"],"mfrWarranty":{},"warrantyStatus":"warrantable","price":price,"referenceId":sku,"title":title})

                        };
                        request(options4, function (error: any, response: any) { 
                            if (error) throw new Error(error);
                            console.log(response.body);
                        });
                    }
                counter++;
                }

                Array.from(myMap.values()).forEach(value =>
                    var options5 = {
                        'method': 'DELETE',
                        'url': 'https://api-demo.helloextend.com/stores/83d57b1a-4674-46d2-8831-373680d5637d/products/' + myMap.get(m),
                        'headers': {
                        'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc'
                        }
                    };
                    request(options5, function (error: any, response: any) { 
                        if (error) throw new Error(error);
                    });
                )
            });
        });
    }
}

// Singleton pattern so there aren't multiple controllers 
const productUpdateController = new ProductUpdateController();
Object.freeze(productUpdateController);

export default productUpdateController;