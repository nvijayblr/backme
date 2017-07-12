
exports.adminAPI = function(app, dbConnection, validate, multer, path, nesting, async, moment, transporter, emails) {
	
	/*Get All projects*/
	app.get('/admin/projects', function (req, res) {
		try {
			dbConnection.query({sql: 'SELECT *, TIMESTAMPDIFF(HOUR,CURDATE(),endByDate) as remainHours, \
					TIMESTAMPDIFF(DAY,CURDATE(),endByDate) as remainDays, TIMESTAMPDIFF(DAY,createdDate,endByDate) as totalDays, (SELECT COUNT(*) from likes l where l.projectId=projects.projectId) AS likesCount, (SELECT COUNT(*) from likes al where al.projectId=projects.projectId) AS alreadyLiked, (SELECT COUNT(*) from views v where v.projectId=projects.projectId) AS viewsCount, (SELECT COUNT(*) from payments p where p.projectId=projects.projectId AND txnStatus="TXN_SUCCESS") AS supportersCount FROM projects \
					LEFT JOIN spendmoney ON (projects.projectId = spendmoney.projectId) \
					LEFT JOIN projectsassets ON (projects.projectId = projectsassets.projectId) \
					LEFT JOIN servicerewards ON (projects.projectId = servicerewards.projectId) \
					LEFT JOIN supportrewards ON (projects.projectId = supportrewards.projectId) \
					LEFT JOIN team ON (projects.projectId = team.projectId) \
					LEFT JOIN (SELECT orderId, projectId, COALESCE(SUM(amount),0) as amount, count(orderId) as count FROM payments WHERE txnStatus="TXN_SUCCESS" GROUP BY projectId) payments ON (projects.projectId = payments.projectId) ORDER BY projects.projectId DESC', nestTables: true}, function (error, results, fields) {
				var nestingOptions = [
					{ tableName : 'projects', pkey: 'projectId', fkeys:[{table:'spendmoney',col:'projectId'}, {table:'projectsassets',col:'projectId'}, {table:'servicerewards',col:'projectId'}, {table:'supportrewards',col:'projectId'}, {table:'team',col:'projectId'}, {table:'remaindayshours',col:'projectId'}, {table:'payments',col:'projectId'}]},
					{ tableName : 'spendmoney', pkey: 'spendId'},
					{ tableName : 'projectsassets', pkey: 'assetId'},
					{ tableName : 'servicerewards', pkey: 'serviceId'},
					{ tableName : 'supportrewards', pkey: 'supportId'},
					{ tableName : 'team', pkey: 'teamtId'},
					{ tableName : 'remaindayshours', pkey: 'remainId'},
					{ tableName : 'payments', pkey: 'orderId'}
				];
				var nestedRows = nesting.convertToNested(results, nestingOptions);
				if (error) {
					console.log(error);
					res.status(500).send("Internal Server Error.");
					return;
				}
				res.status(200).send(nestedRows);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send(e);
		}
	});
	
	/*Admin releted apis*/
	
	/*admin login*/
	app.post('/admin/login', function (req, res) {
		var admin = req.body;
		if(!admin.email || !admin.password) {
			res.status(400).send("Bad Request. Email/Password should not be empty.");
			return;
		};
		try {
			dbConnection.query('SELECT * FROM admin WHERE email=? AND BINARY password=? AND status="ACTIVE"', [admin.email, admin.password], function (error, results, fields) {
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


	/*create admin*/
	app.post('/admin', function (req, res) {
		var admin = req.body;
		if(!admin.email || !admin.password || !admin.name) {
			res.status(400).send("Bad Request. Parameters mismatched.");
			return;
		};
		if(!validate.validateEmail(admin.email)) {
			res.status(400).send("Invalid Email.");
			return;
		}
		admin.status = 'ACTIVE';
		try {
			dbConnection.query('INSERT INTO admin SET ?', admin, function (error, results, fields) {
				if (error) {
					res.status(500).send(error.code=='ER_DUP_ENTRY'?'Email already found.':error.code);
					return;
				}

				/*emails.sendEmails(app, transporter, 'user-register.ejs', admin.email, 'Welcome to Back Me!', function(info) {
					console.log(info);
				});*/
				res.status(200).send(results);
			});
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});


	/*update admin details*/
	app.put('/admin', function (req, res) {
		var admin = req.body;
		if(!admin.adminId) {
			res.status(400).send("Bad Request. Admin ID should not be blank.");
			return;
		};
		if(admin.email && !validate.validateEmail(admin.email)) {
			res.status(400).send("Invalid Email.");
			return;
		}
		try {
			dbConnection.query('UPDATE admin SET ? WHERE adminId=?', [admin, admin.adminId], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send(error);
					return;
				}
				results.admin = admin;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*delete specific admin details*/
	app.delete('/admin', function (req, res) {
		var admin = req.body;
		if(!admin.adminId) {
			res.status(400).send("Bad Request. Admin ID should not be blank.");
			return;
		};
		try {
			dbConnection.query('DELETE FROM admin WHERE adminId=?', [admin.adminId], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send(error.code);
					return;
				}
				results.admin = admin;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*Get All admin*/
	app.get('/admin', function (req, res) {
		try {
			dbConnection.query('SELECT * FROM admin', function (error, results, fields) {
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


	/*Get Specific admin details*/
	app.get('/admin/:adminId', function (req, res) {
		var adminId = req.params.adminId;
		try {
			if(userId) {
				dbConnection.query('SELECT * FROM admin WHERE adminId=?', [adminId], function (error, results, fields) {
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
	
	
	/*Category releted apis*/
	
	/*create category*/
	app.post('/category', function (req, res) {
		var category = req.body;
		if(!category.name) {
			res.status(400).send("Bad Request. Category name should not be blank.");
			return;
		};
		try {
			dbConnection.query('INSERT INTO category SET ?', category, function (error, results, fields) {
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

	
	/*update category details*/
	app.put('/category', function (req, res) {
		var category = req.body;
		if(!category.categoryId) {
			res.status(400).send("Bad Request. Category ID should not be blank.");
			return;
		};
		try {
			dbConnection.query('UPDATE category SET ? WHERE categoryId=?', [category, category.categoryId], function (error, results, fields) {
				if (error) {
					res.status(500).send(error);
					return;
				}
				results.category = category;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*delete specific category details*/
	app.delete('/category', function (req, res) {
		var category = req.body;
		if(!category.categoryId) {
			res.status(400).send("Bad Request. category ID should not be blank.");
			return;
		};
		try {
			dbConnection.query('DELETE FROM category WHERE categoryId=?', [category.categoryId], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send(error);
					return;
				}
				results.category = category;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*Get All category*/
	app.get('/category', function (req, res) {
		try {
			dbConnection.query('SELECT * FROM category', function (error, results, fields) {
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


	/*Get Specific category details*/
	app.get('/category/:categoryId', function (req, res) {
		var categoryId = req.params.categoryId;
		try {
			if(userId) {
				dbConnection.query('SELECT * FROM category WHERE categoryId=?', [categoryId], function (error, results, fields) {
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

	
	/*Banks releted apis*/
	
	/*create bank*/
	app.post('/banks', function (req, res) {
		var banks = req.body;
		if(!banks.name) {
			res.status(400).send("Bad Request. Bank name should not be blank.");
			return;
		};
		try {
			dbConnection.query('INSERT INTO banks SET ?', banks, function (error, results, fields) {
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

	
	/*update bank details*/
	app.put('/banks', function (req, res) {
		var banks = req.body;
		if(!banks.bankId) {
			res.status(400).send("Bad Request. bank ID should not be blank.");
			return;
		};
		try {
			dbConnection.query('UPDATE banks SET ? WHERE bankId=?', [banks, banks.bankId], function (error, results, fields) {
				if (error) {
					res.status(500).send(error);
					return;
				}
				results.banks = banks;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*delete specific banks details*/
	app.delete('/banks', function (req, res) {
		var banks = req.body;
		if(!banks.bankId) {
			res.status(400).send("Bad Request. bank ID should not be blank.");
			return;
		};
		try {
			dbConnection.query('DELETE FROM banks WHERE bankId=?', [banks.bankId], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send(error);
					return;
				}
				results.banks = banks;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*Get All bank*/
	app.get('/banks', function (req, res) {
		try {
			dbConnection.query('SELECT * FROM banks', function (error, results, fields) {
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


	/*Get Specific bank details*/
	app.get('/banks/:bankId', function (req, res) {
		var bankId = req.params.bankId;
		try {
			if(userId) {
				dbConnection.query('SELECT * FROM banks WHERE bankId=?', [bankId], function (error, results, fields) {
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
	
	
	/*City releted apis*/
	
	/*create city*/
	app.post('/cities', function (req, res) {
		var cities = req.body;
		if(!cities.city) {
			res.status(400).send("Bad Request. City should not be blank.");
			return;
		};
		try {
			dbConnection.query('INSERT INTO cities SET ?', cities, function (error, results, fields) {
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

	
	/*update cities details*/
	app.put('/cities', function (req, res) {
		var cities = req.body;
		if(!cities.cityId) {
			res.status(400).send("Bad Request. City ID should not be blank.");
			return;
		};
		try {
			dbConnection.query('UPDATE cities SET ? WHERE cityId=?', [cities, cities.cityId], function (error, results, fields) {
				if (error) {
					res.status(500).send(error);
					return;
				}
				results.cities = cities;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*delete specific cities details*/
	app.delete('/cities', function (req, res) {
		var cities = req.body;
		if(!cities.cityId) {
			res.status(400).send("Bad Request. City ID should not be blank.");
			return;
		};
		try {
			dbConnection.query('DELETE FROM cities WHERE cityId=?', [cities.cityId], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send(error);
					return;
				}
				results.cities = cities;
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*Get All cities*/
	app.get('/cities', function (req, res) {
		try {
			dbConnection.query('SELECT * FROM cities', function (error, results, fields) {
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


	/*Get Specific category details*/
	app.get('/cities/:cityId', function (req, res) {
		var cityId = req.params.cityId;
		try {
			if(userId) {
				dbConnection.query('SELECT * FROM cities WHERE cityId=?', [cityId], function (error, results, fields) {
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
	
	/*update project details*/
	app.put('/admin/projects', function (req, res) {
		var project = req.body;
		if(!project.projectId) {
			res.status(400).send("Bad Request: ProjectId should not be empty.");
			return;
		};
		try {
			dbConnection.query('UPDATE projects SET ? WHERE projectId=?', [project, project.projectId], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send(error);
					return;
				}
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

	/*update user details*/
	app.put('/admin/users', function (req, res) {
		var user = req.body;
		if(!user.userId) {
			res.status(400).send("Bad Request: UserId should not be empty.");
			return;
		};
		try {
			dbConnection.query('UPDATE users SET ? WHERE userId=?', [user, user.userId], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send(error);
					return;
				}
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});

}




