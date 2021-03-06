
exports.socialAPI = function(app, dbConnection, validate, multer, path, nesting, async, moment, transporter, emails) {

	/* Create comments */
	app.put('/comments', function (req, res) {
		var comment = req.body;
		if(!comment.userId || !comment.projectId || !comment.comment) {
			res.status(400).send("Bad Request. Parameters mismatched.");
			return;
		};
		try {
			dbConnection.query('INSERT INTO comments SET ?', comment, function (error, results, fields) {
				if (error) {
					res.status(500).send('Internal Server Error.');
					return;
				}
				/*emails.sendEmails(app, transporter, 'user-register.ejs', user.email, 'Welcome to Back Me!', function(info) {
					console.log(info);
				});*/
				res.status(200).send(results);
			});
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});
	
	/* get comments based on projectId */
	app.get('/comments/:projectId', function (req, res) {
		var projectId = req.params.projectId;
		if(!projectId) {
			res.status(400).send("ProjectId should is required.");
			return;
		};
		try {
			dbConnection.query({sql: 'SELECT * FROM comments \
				LEFT JOIN (SELECT userId, name, profilePicture, loginType FROM users) users ON (comments.userId = users.userId) \
				WHERE comments.projectId = ? AND comments.abused!="true"', nestTables: true}, projectId, function (error, results, fields) {
				if (error) {
					res.status(500).send('Internal Server Error.');
					return;
				}
				res.status(200).send(results);
			});

		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});
	
	/* Create likes */
	app.put('/likes', function (req, res) {
		var like = req.body;
		if(!like.userId || !like.projectId) {
			res.status(400).send("Bad Request. Parameters mismatched.");
			return;
		};
		try {
			dbConnection.query('INSERT INTO likes SET ?', like, function (error, results, fields) {
				if (error) {
					res.status(500).send(error);
					return;
				}
				res.status(200).send(results);
			});
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});
	
	/* Create likes */
	app.put('/views', function (req, res) {
		var view = req.body;
		if(!view.projectId) {
			res.status(400).send("Bad Request. ProjectId is required.");
			return;
		};
		try {
			dbConnection.query('INSERT INTO views SET ?', view, function (error, results, fields) {
				if (error) {
					res.status(500).send(error);
					return;
				}
				res.status(200).send(results);
			});
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});
	
	/* Create favourites */
	app.put('/favourites', function (req, res) {
		var favourite = req.body;
		if(!favourite.userId || !favourite.projectId) {
			res.status(400).send("Bad Request. Parameters mismatched.");
			return;
		};
		try {
			dbConnection.query('INSERT INTO favourites SET ?', favourite, function (error, results, fields) {
				if (error) {
					res.status(500).send('Internal Server Error.');
					return;
				}
				res.status(200).send(results);
			});
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});
	
	/* delete favourite based on favouriteId */
	app.delete('/favourites', function (req, res) {
		var favourite = req.body;
		if(!favourite.userId || !favourite.projectId) {
			res.status(400).send("Bad Request. Parameters mismatched.");
			return;
		};
		try {
			dbConnection.query('DELETE FROM favourites WHERE userId = ? AND projectId = ?', [favourite.userId, favourite.projectId], function (error, results, fields) {
				if (error) {
					res.status(500).send('Internal Server Error.');
					return;
				}
				res.status(200).send(results);
			});

		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});
}
