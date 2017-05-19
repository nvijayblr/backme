"use strict";

var paytm_config = require('./paytm/paytm_config').paytm_config;
var paytm_checksum = require('./paytm/checksum');
var querystring = require('querystring');

exports.route = function(app, dbConnection, validate, multer, path, nesting, async, moment) {
	app.get('/test', function(request, response){
		response.writeHead(200 , {'Content-type':'text/html'});
		response.write('<html><head><title>Paytm</title></head><body>');
		response.write('</body></html>');
		response.end(); 
	});
	app.post('/generate_checksum', function(request, response){
		console.log('generate_checksum');
		var paramarray = {};
		paramarray['MID'] = '';
		paramarray['ORDER_ID'] = '';
		paramarray['CUST_ID'] = '';
		paramarray['INDUSTRY_TYPE_ID'] = '';
		paramarray['CHANNEL_ID'] = '';
		paramarray['TXN_AMOUNT'] = '';
		paramarray['WEBSITE'] = '';
		var fullBody = '';
		request.on('data', function(chunk) {
			fullBody += chunk.toString();
		});
		//request.on('end', function() {
			//var decodedBody = querystring.parse(fullBody);
			var decodedBody = request.body;
			// below code snippet is mandatory, so that no one can use your checksumgeneration url for other purpose .
			for (var name in decodedBody)
			{
				var n = decodedBody[name].includes("REFUND");
				var m = decodedBody[name].includes("|");
				 paramarray[name] = decodedBody[name];
				 if(n == false || m == false)
				{
				  paramarray[name] = decodedBody[name];
				}
			}
			paytm_checksum.genchecksum(paramarray, paytm_config.MERCHANT_KEY, function (err, res) {
				response.writeHead(200, {'Content-type' : 'text/json','Cache-Control': 'no-cache'});
				response.write(JSON.stringify(res));
				response.end();
			});
		//});
	});
	
	app.post('/verify_checksum', function(request, response){
		var fullBody = '';
		request.on('data', function(chunk) {
			fullBody += chunk.toString();
		});
		//request.on('end', function() {
			var decodedBody = request.body;
			//var decodedBody = querystring.parse(fullBody);
			response.writeHead(200, {'Content-type' : 'text/html','Cache-Control': 'no-cache'});
			if(paytm_checksum.verifychecksum(decodedBody, paytm_config.MERCHANT_KEY)) {
				decodedBody.IS_CHECKSUM_VALID="Y";
			}else{
				decodedBody.IS_CHECKSUM_VALID="N";
			}
			if(decodedBody.CHECKSUMHASH){
				delete decodedBody.CHECKSUMHASH;
			}
			response.write('<html>');
			response.write('<head>');
			response.write('<meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-I">');
			response.write('<title>Paytm</title>');
			response.write('<script type="text/javascript">');
			response.write('function response(){');
			response.write('return document.getElementById("response").value;');
			response.write('}');
			response.write('</script>');
			response.write('</head>');
			response.write('<body>');
			response.write('Redirect back to the app<br>');
			response.write('<form name="frm" method="post">');
			response.write('<input type="hidden" id="response" name="responseField" value=\'' + htmlEscape(JSON.stringify(decodedBody)) + '\'>');
			response.write('</form>');
			response.write('</body>');
			response.write('</html>');					

			response.end();
		//});
	});
 }

function htmlEscape(str) {
  return String(str)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
}
