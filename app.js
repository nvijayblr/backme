var async = require('async');
var mysql = require('mysql');
var cors = require('cors');
var path = require('path')
var multer  = require('multer')
var express = require('express');
var request = require('request');
var app = express();
var bodyParser = require('body-parser');
var moment = require('node-moment');

var validate = require('./validation');
var projects = require('./projects');
var _temp = require('./_temp');
var nesting = require('./mysql-nesting');

var dbConnection = mysql.createConnection({
	/*host: 'localhost',
	user: 'root',
	password: '',
	database: 'backme'*/
  	host: 'localhost',
	user: 'root',
	password: 'Xcz?2oAffm',
	database: 'backme',
	port: 3306,
	debug: true
});
var server = app.listen(3001, function () {
    var host = server.address().address,
        port = server.address().port
    console.log("Backme Server listening at http://%s:%s", host, port);
});
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

/*app.use(function (req, res, next) {
	console.log('hai', req.body); 
	next();
});*/

//_temp.callGet(app, dbConnection);

/*Projects related API*/
projects.projectsAPI(app, dbConnection, validate, multer, path, nesting, async, moment);

/*Begin the Image upload test*/
var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		if(['.jpg','.png','.jpeg'].indexOf(path.extname(file.originalname)) == -1) {
			callback(new Error('FileUpload: Invalid Extension.', null));
		} else {
			callback(null, './uploads');
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
		dbConnection.query('SELECT * FROM users WHERE email=? AND BINARY password=?', [user.email, user.password], function (error, results, fields) {
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


/*singup user*/
app.post('/signup', function (req, res) {
	var user = req.body;
	if(!user.email || !user.password) {
		res.status(400).send("Bad Request. Parameters mismatched.");
		return;
	};
	if(!validate.validateEmail(user.email)) {
		res.status(400).send("Invalid Email.");
		return;
	}
	try {
		//dbConnection.query('INSERT INTO users SET email=?, password=?, name=?, interested=?', [user.email, user.password, user.name, JSON.stringify(user.interested)], function (error, results, fields) {
		dbConnection.query('INSERT INTO users SET ?', user, function (error, results, fields) {
			if (error) {
				res.status(500).send(error.code=='ER_DUP_ENTRY'?'Email already found.':error.code);
				return;
			}
			res.status(200).send(results);
		});
	} catch(e) {
		res.status(500).send("Internal Server Error.");
	}
});


/*update users*/
app.post('/users', function (req, res) {
	var user = req.body;
	if(!user.userId) {
		res.status(400).send("Bad Request. UserId should not be blank.");
		return;
	};
	if(user.email && !validate.validateEmail(user.email)) {
		res.status(400).send("Invalid Email.");
		return;
	}
	try {
		dbConnection.query('UPDATE users SET ? WHERE userId=?', [user, user.userId], function (error, results, fields) {
			if (error) {
				res.status(500).send(error.code);
				return;
			}
			res.status(200).send('Accont updated successfully.');
		});
	} catch(e) {
		res.status(500).send("Internal Server Error.");
	}
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

