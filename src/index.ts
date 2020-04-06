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
var options2 = {
  'method': 'POST',
  'hostname': 'api-demo.helloextend.com',
  'path': '/stores/83d57b1a-4674-46d2-8831-373680d5637d/products',
  'headers': {
    'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc',
    'Content-Type': 'application/json'
  },
  'maxRedirects': 20
};
var options3 = {
  'method': 'GET',
  'hostname': 'api-demo.helloextend.com',
  'path': '/stores/83d57b1a-4674-46d2-8831-373680d5637d/products',
  'headers': {
    'X-Extend-Access-Token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InlrZTdAZG9ucy51c2ZjYS5lZHUiLCJhY2NvdW50SWQiOiJmZDEwMzk5Ni1lOWZmLTQ0NTktYmJlNS1mMDlhNzYyYWU4Y2IiLCJzY29wZSI6ImFsbCIsImlhdCI6MTU4NTI2NjkzOSwiZXhwIjoyNTQ5ODc1Njc3MzgsImlzcyI6ImFwaS1kZW1vLmhlbGxvZXh0ZW5kLmNvbSIsInN1YiI6Ijg4MzZkYjgxLTAwOTktNDUyNy1iNjM3LTFjNmQyOWY0MzdjZCJ9.Skqf0CvHKLFoYMkEVr5n8t8fzvWxr0UPPHW1nWIqbyc'
  },
  'maxRedirects': 20
};

var jsonResponse;
var req = https.request(options, function (res) {
  var req2 = https.request(options2, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function (chunk) {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
    });

    res.on("error", function (error) {
      console.error(error);
    });
  });
  
  var body = '';

  res.on("data", function (chunk) {
     body += chunk;
  });

  res.on("end", function (chunk) {

    var req3 = https.request(options, function (res) {
      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (chunk) {
        var body2 = Buffer.concat(chunks);
        var jsonResponse2 = JSON.parse(body2);
        jsonResponse = JSON.parse(body);
        counter = 0;
        counter2 = 0;
        let myMap = new Map()
        for (const property2 in jsonResponse2) {
          var sku = parseInt(jsonResponse2[counter2]["sku"]);
          var title = jsonResponse2[counter2]["name"];
          myMap.set(sku,title);
          counter2++;
          
        }

        for (const property in jsonResponse) {
          //console.log("Got a response: ", jsonResponse[counter]);
          //console.log("Got a response:", jsonResponse[counter]["id"]);
          var id = parseInt(jsonResponse[counter]["id"]);
          // console.log("Got a response:", id);
          var price = parseInt(jsonResponse[counter]["price"]);
          var sku = parseInt(jsonResponse[counter]["sku"]);
          var title = jsonResponse[counter]["name"];
          console.log("Got a response: ", (myMap.get(sku)));
          if (id >55) {
            var postData = JSON.stringify({"createdAt":1585094707876,"storeId":"83d57b1a-4674-46d2-8831-373680d5637d","enabled":false,"approved":false,"imageUrl":"http://lorempixel.com/640/480","overrides":{"mfrWarranty":{"parts":12,"url":"apple.com/warranty","labor":12}},"updatedAt":1585095730222,"identifiers":{},"plans":["10001-misc-elec-base-replace-1y","10001-misc-elec-base-replace-2y","10001-misc-elec-base-replace-3y"],"mfrWarranty":{},"warrantyStatus":"warrantable","price":price,"referenceId":sku,"title":title});
          

            req2.write(postData);

            req2.end();
          }

          counter++;
        }


      });

      res.on("error", function (error) {
        console.error(error);
      });
    });
    req3.end();
  });

  res.on("error", function (error) {
    console.error(error);
  });
});
req.end();