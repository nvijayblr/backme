var _tempVar = {
	test: function () {
		console.log('your calling the function from the external file.');
	},
	callGet: function (app, dbConnection) {
		return app.get('/users1', function (req, res) {
			try {
				dbConnection.query('SELECT * FROM users', function (error, results, fields) {
					if (error) {
						res.status(500).send("Internal Server Error.");
						return;
					}
					res.status(200).send(results);
				});
			} catch (e) {
				res.status(500).send("Internal Server Error.");
			}
		});
	}
};

module.exports = _tempVar;
