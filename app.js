var async = require('async');
var mysql = require('mysql');
var cors = require('cors');
var path = require('path')
var multer  = require('multer')
var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var moment = require('node-moment');
var ccavenue = require('ccavenue');
var nodemailer = require('nodemailer');

var app = express();

var validate = require('./validation');
var projects = require('./projects');
var _temp = require('./_temp');
var nesting = require('./mysql-nesting');

var dbConnection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'backme'
  	/*host: 'localhost',
	user: 'root',
	password: 'Xcz?2oAffm',
	database: 'backme',
	port: 3306,
	debug: true*/
});
var server = app.listen(3001, function (request, response) {
    var host = server.address().address,
        port = server.address().port;
    console.log("Backme Server listening at http://%s:%s", host, port);
});
//http.createServer(onRequest).listen(8888);
app.use(express.static('public'));
app.use(cors());
app
	.use(bodyParser.urlencoded({ extended: false }))
	.use(bodyParser.json());


var connectDB = function() {
	dbConnection.connect(function (err) {
		if (err) {
			console.error('error connecting: ' + err.stack);
			return;
		}
	});
}
connectDB();


//_temp.callGet(app, dbConnection);

/*Projects related API*/
projects.projectsAPI(app, dbConnection, validate, multer, path, nesting, async, moment);

/*Paytm Integration*/
var router = require('./router');
router.route(app, dbConnection, validate, multer, path, nesting, async, moment);

const MAX_USERS_FILE_SIZE = 10*1024*1024;

/*ccavenue payment gateway*/
//Required
ccavenue.setMerchant("86540");
ccavenue.setWorkingKey("0B66015989C8CD68B53219345F8C8484");
ccavenue.setOrderId("1");
ccavenue.setRedirectUrl("http://localhost:3001/checkout");
ccavenue.setOrderAmount("1");
 
//Optional
var param = {
  billing_cust_address: 'Bangalore', 
  billing_cust_name: 'Nitish Kumar'
};
ccavenue.setOtherParams(param); //Set Customer Info 

app.get('/make-payment', function(req, res) {
	//console.log(res);
	ccavenue.makePayment(res); // It will redirect to ccavenue payment

});


/* Email Settings */
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nvijay.ooty@gmail.com',
        pass: 'Windows98*'
    }
});

app.get('/sendMail', function response(req, res) {
	sendVerificationMail('nvijay.ooty@gmail.com, vijay.n@altiux.com', '1', function(info) {
		res.status(200).send(info);
	});
});

function sendVerificationMail(_email, _link, _callback) {
	var mailOptions = {
		from: '"BACKME" <nvijay.ooty@gmail.com>', 
		to: _email, 
		subject: 'Backme Account Verification',
		text: '', // plain text body
		html: '<b>Please click the below link to verify your account.<b><br><br><h3><a href="'+_link+'" target="_blank">Verify</a></h3>'
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			if(_callback)
				_callback(error);
			return console.log(error);
		}
		if(_callback)
			_callback(info);
		console.log('Message %s sent: %s', info.messageId, info.response);
	});
}


// Server url should be as redirect url (which you are passing as Redirect Url).
app.post('/checkout1', function response(req, res) {
	var data = ccavenue.paymentRedirect(req); //It will get response from ccavenue payment.
	console.log(data);
	if(data.isCheckSumValid == true && data.AuthDesc == 'Y') {
	  // Success
	  // Your code
	} else if(data.isCheckSumValid == true && data.AuthDesc == 'N') {
	  // Unuccessful
	  // Your code
	} else if(data.isCheckSumValid == true && data.AuthDesc == 'B') {
	  // Batch processing mode
	  // Your code
	} else {
	  // Illegal access
	  // Your code
	}
});


/*Begin the Image upload test*/
var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		if(['.jpg','.png','.jpeg'].indexOf(path.extname(file.originalname)) == -1) {
			callback(new Error('FileUpload: Invalid Extension.', null));
		} else {
			callback(null, 'public/uploads');
		}
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});

app.post('/uploadTest', function(req,res){
	var upload = multer({
		storage: storage, 
		limits: {fileSize: 30*1024*1024}
	}).fields([{name:'posterImg', maxCount:1}, {name:'gallery', maxCount:8}]);
	
	upload(req, res, function (err, success) {
		if (err) {
			console.log(err);
			res.status(500).send(err);
			//res.status(500).send('Error Uploading file. Invalid file format/exceeded file size/Internal Server error.');
			return;
		}
		console.log(req.body.projectId);
		if(req.files && req.files.gallery) {
			var gallery = [];
			for(i in req.files.gallery) {
				console.log(req.files.gallery[i]);
				gallery.push([1, 1, req.files.gallery[i].mimetype, req.files.gallery[i].filename]);
			}
			try {
				/*dbConnection.query('INSERT INTO projectsassets (projectId, userId, type, location) VALUES ?', [gallery], function (error, results, fields) {
					if (error) {
						res.status(500).send(error.code=='ER_DUP_ENTRY'?'Email already found.':error.code);
						return;
					}
					res.status(200).send('images/videos added successfully.');
					return;
				});*/
			} catch(e) {
				res.status(500).send("Internal Server Error.");
			}
			res.status(200).send('images/videos added successfully.');
		} else if (req.files && (req.files.posterImg || req.files.gallery)) {
			res.status(200).send("File uploaded successfully.");
		} else
			res.status(404).send("Please select file to upload.");
	});
});

/*End of the Image upload test*/


/*login user*/
app.post('/login', function (req, res) {
	var user = req.body;
	console.log(user);
	if(!user.email || !user.password) {
		res.status(400).send("Bad Request. Email/Password should not be empty.");
		return;
	};
	try {
		dbConnection.query('SELECT * FROM users WHERE email=? AND BINARY password=? AND loginType="CUSTOM" AND status="ACTIVE"', [user.email, user.password], function (error, results, fields) {
			if (error) {
				res.status(500).send("Internal Server Error.");
				return;
			}
			if(results.length)
				res.status(200).send(results);
			else
				res.status(404).send('Invalid userId/passowrd.');
		});
	} catch(e) {
    console.log(e);
		res.status(500).send("Internal Server Error.", e);
	}
});

var hostPath = ""

/*singup user*/
app.post('/signup', function (req, res) {
	var user = req.body;
	var host = req.protocol + '://' + req.get('host');
	if(!user.email || !user.password) {
		res.status(400).send("Bad Request. Parameters mismatched.");
		return;
	};
	if(!validate.validateEmail(user.email)) {
		res.status(400).send("Invalid Email.");
		return;
	}
	user.status = 'PENDING';
	if(!user.loginType) {
		user.loginType = 'CUSTOM';
	}
	try {
		dbConnection.query('INSERT INTO users SET ?', user, function (error, results, fields) {
			if (error) {
				res.status(500).send(error.code=='ER_DUP_ENTRY'?'Email already found.':error.code);
				return;
			}
			sendVerificationMail(user.email, host+'/verifyAccount/'+results.insertId);
			res.status(200).send(results);
		});
	} catch(e) {
		res.status(500).send("Internal Server Error.");
	}
});

/*verify email user*/
app.get('/verifyAccount/:userId', function (req, res) {
	var userId = req.params.userId;
	var host = req.protocol + '://' + req.get('host');
	if(!userId) {
		res.status(500).send('Internal Server Error. Try again.');
		return;
	};
	try {
		dbConnection.query('UPDATE users SET status="ACTIVE", loginType="CUSTOM" WHERE userId=?', userId, function (error, results, fields) {
			if (error) {
				res.status(500).send('Internal Server Error. Try again.');
				return;
			}
			res.status(200).send('Your account verified successfully. <a href="'+host+'">Click here</a> to login BACKME account.');
		});
	} catch(e) {
		res.status(500).send("Internal Server Error. Try again.");
	}
});


/*update users*/
app.post('/users', function (req, res) {
	var upload = multer({
		storage: storage, 
		limits: {fileSize: MAX_USERS_FILE_SIZE}
	}).fields([{name: 'userCoverPhoto', maxCount: 1}, {name: 'userProfilePhoto', maxCount: 1}]);

	upload(req, res, function (err, success) {
		if (err) {
			console.log(err);
			res.status(500).send('Error Uploading file. Invalid file format/exceeded file size/Internal Server error.');
			return;
		}
		var user = req.body;
		if(req.files && req.files.userCoverPhoto) {
			user.coverPicture = req.files.userCoverPhoto[0].filename;
		}
		if(req.files && req.files.userProfilePhoto) {
			user.profilePicture = req.files.userProfilePhoto[0].filename;
		}
		if(!user.userId) {
			res.status(400).send("Bad Request. User ID should not be blank.");
			return;
		};
		if(user.email && !validate.validateEmail(user.email)) {
			res.status(400).send("Invalid Email.");
			return;
		}
		try {
			dbConnection.query('UPDATE users SET ? WHERE userId=?', [user, user.userId], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send(error.code);
					return;
				}
				results.user = user;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});	
});

/*Get All users*/
app.get('/users', function (req, res) {
	try {
		dbConnection.query('SELECT * FROM users', function (error, results, fields) {
			if (error) {
				res.status(500).send("Internal Server Error.");
				return;
			}
			res.status(200).send(results);
		});
	} catch(e) {
		res.status(500).send("Internal Server Error.");
	}
});


/*Get All Specific users details*/
app.get('/users/:userId', function (req, res) {
	var userId = req.params.userId;
	try {
		if(userId) {
			dbConnection.query('SELECT * FROM users WHERE userId=?', [userId], function (error, results, fields) {
				if (error) {
					res.status(500).send("Internal Server Error.");
					return;
				}
				res.status(200).send(results);
			});
		}
	} catch(e) {
		res.status(500).send("Internal Server Error.");
	}
});

