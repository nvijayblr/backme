"use strict";

var paytm_config = require('./paytm/paytm_config').paytm_config;
var paytm_checksum = require('./paytm/checksum');
var querystring = require('querystring');

exports.route = function(app, dbConnection, validate, multer, path, nesting, async, moment, transporter, emails) {
	
	app.post('/paytmCallback', function(request, response) {
		console.log('request', request.body.STATUS);
		var payments, resData = {};
		try {
			async.waterfall([
				function (wCB) {
					request.body.TXNID = request.body.TXNID ? request.body.TXNID : '';
					if(request.body.STATUS == 'TXN_SUCCESS') {
						payments = [request.body.TXNID, request.body.STATUS, request.body.RESPMSG, request.body.RESPCODE, request.body.TXNDATE, request.body.PAYMENTMODE, request.body.BANKNAME, request.body.GATEWAYNAME, request.body.BANKTXNID, 'PENDING', request.body.ORDERID];
					} else {
						payments = [request.body.TXNID, request.body.STATUS, request.body.RESPMSG, request.body.RESPCODE, new Date(), '', '', '', '', 'FAILED', request.body.ORDERID];
					}
					dbConnection.query('UPDATE payments SET txnId=?, txnStatus=?, responseMsg=?, responseCode=?, txnDate=?, paymentMode=?, bankName=?, gatewayName=?, bankTxnId=?, status=? WHERE orderId=?', payments, function (error, results, fields) {
						if (error) {
							return wCB(error);
						}
						
						wCB();
					});
				},
				function (wCB) {
					dbConnection.query('SELECT * FROM payments WHERE orderId=?', request.body.ORDERID, function (error, results, fields) {
						if (error) {
							return wCB(error);
						}
						if(results[0].txnStatus == 'TXN_SUCCESS') {
							emails.sendEmails(app, transporter, 'payment.ejs', results[0].email, 'Thanks for your support!', function(info) {
								console.log(info);
							});
						}
						resData = results[0];
						wCB();
					});
				},
				function (wCB) {
					if(resData.purpose == 'HOME_PROMOTION' && resData.txnStatus == 'TXN_SUCCESS') {
						dbConnection.query('UPDATE projects SET homePagePromotion="YES" WHERE projectId = ?', resData.projectId, function (error, results, fields) {
							if (error) {
								return wCB(error);
							}
							wCB();
						});
					} else {
						wCB();
					}
				},
				function (wCB) {
					if(resData.purpose == 'SOCIAL_PROMOTION' && resData.txnStatus == 'TXN_SUCCESS') {
						dbConnection.query('UPDATE projects SET socialPromotion="YES" WHERE projectId = ?', resData.projectId, function (error, results, fields) {
							if (error) {
								return wCB(error);
							}
							wCB();
						});
					} else {
						wCB();
					}
				},
				function (wCB) {
					response.render('paytm-complete.ejs', {'restdata':resData});
				}
				
			], function (err) {
				// If we pass first paramenter as error this function will execute.
				response.status(500).send(err);
			});

		} catch(e) {
			console.log(e);
			response.status(500).send("Internal Server Error.");
		}	
		
	});

	app.post('/registerPayment', function(request, response) {
		var payments = request.body;
		var orderId = '';
		try {
			async.waterfall([
				function (wCB) {
					dbConnection.query('INSERT INTO payments SET ?', payments, function (error, results, fields) {
						if (error) {
							return wCB(error);
						}
						orderId = results.insertId;
						if(payments.email) {
							emails.sendEmails(app, transporter, 'payment.ejs', payments.email, 'Thanks for your support!', function(info) {
								console.log(info);
							});
						}
						wCB();
					});
				},
				function (wCB) {
					if(payments.purpose == 'HOME_PROMOTION') {
						dbConnection.query('UPDATE projects SET homePagePromotion="YES" WHERE projectId = ?', payments.projectId, function (error, results, fields) {
							if (error) {
								return wCB(error);
							}
							wCB();
						});
					} else {
						wCB();
					}
				},
				function (wCB) {
					if(payments.purpose == 'SOCIAL_PROMOTION') {
						dbConnection.query('UPDATE projects SET socialPromotion="YES" WHERE projectId = ?', payments.projectId, function (error, results, fields) {
							if (error) {
								return wCB(error);
							}
							wCB();
						});
					} else {
						wCB();
					}
				},
				function (wCB) {
					response.status(200).send({orderId:orderId});
				}
			], function (err) {
				// If we pass first paramenter as error this function will execute.
				response.status(500).send(err);
			});

		} catch(e) {
			console.log(e);
			response.status(500).send("Internal Server Error.");
		}	
	
	});

	app.post('/pay-paytm', function(request, response){
		
		var params = request.body;
		if(!params.projectId || !params.userId || !params.TXN_AMOUNT || !params.firstName || !params.email || !params.mobileNumber) {
			response.status(500).send("Bad Request: ProjectId/userId/Amount/firstName/Email/Mobile is required.");
			return;
		}
        var paramarray = {};
		try {
			async.waterfall([
				function (wCB) {
					var payments = [params.projectId, params.userId, params.TXN_AMOUNT, 'Paytm', 'INR', params.firstName, params.lastName, params.email, params.mobileNumber, params.purpose];
					dbConnection.query('INSERT INTO payments (projectId, userId, amount, payThrough, currency, firstName, lastName, email, mobileNumber, purpose) VALUES (?,?,?,?,?,?,?,?,?,?)', payments, function (error, results, fields) {
						if (error) {
							return wCB(error);
						}
						params.ORDER_ID = results.insertId;
						wCB();
					});
				},
				function (wCB) {
					paramarray['MID'] = paytm_config.MID;
					paramarray['CHANNEL_ID'] = paytm_config.CHANNEL_ID;
					paramarray['WEBSITE'] = paytm_config.WEBSITE;
					paramarray['INDUSTRY_TYPE_ID'] = paytm_config.INDUSTRY_TYPE_ID;
					paramarray['CALLBACK_URL'] = paytm_config.CALLBACK_URL;
					paramarray['TXN_AMOUNT'] = params.TXN_AMOUNT;
					paramarray['ORDER_ID'] = params.ORDER_ID; //unique OrderId for every request
					paramarray['CUST_ID'] = params.projectId;
					paramarray['EMAIL'] = params.email;
					paramarray['MOBILE_NO'] = params.mobileNumber;
					paytm_checksum.genchecksum(paramarray, paytm_config.MERCHANT_KEY, function (err, res) {
						if(err) {
							console.log(err);
							return wCB(err);
						}
						//response.status(200).send(JSON.stringify(res));
						response.write('<form name="frm" id="paytm" method="POST" action="'+paytm_config.PAYTM_ENVIORMENT+'">');
						response.write('<input type="hidden" name="MID" value='+ res.MID +'>');
						response.write('<input type="hidden" name="CHANNEL_ID" value='+ res.CHANNEL_ID +'>');
						response.write('<input type="hidden" name="WEBSITE" value='+ res.WEBSITE +'>');
						response.write('<input type="hidden" name="INDUSTRY_TYPE_ID" value='+ res.INDUSTRY_TYPE_ID +'>');
						response.write('<input type="hidden" name="CALLBACK_URL" value='+ res.CALLBACK_URL +'>');
						response.write('<input type="hidden" name="TXN_AMOUNT" value='+ res.TXN_AMOUNT +'>');
						response.write('<input type="hidden" name="ORDER_ID" value='+ res.ORDER_ID +'>');
						response.write('<input type="hidden" name="CUST_ID" value='+ res.CUST_ID +'>');
						response.write('<input type="hidden" name="EMAIL" value='+ res.EMAIL +'>');
						response.write('<input type="hidden" name="MOBILE_NO" value='+ res.MOBILE_NO +'>');
						response.write('<input type="hidden" name="CHECKSUMHASH" value='+ res.CHECKSUMHASH +'>');
						response.write('</form>');
						response.write('<script type="text/javascript">');
						response.write('document.getElementById("paytm").submit();');
						response.write('</script>');
						response.end();
					});
				}
			], function (err) {
				// If we pass first paramenter as error this function will execute.
				response.status(500).send(err);
			});

		} catch(e) {
			console.log(e);
			response.status(500).send("Internal Server Error.");
		}		
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
