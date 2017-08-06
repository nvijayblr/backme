
exports.adminAPI = function(app, dbConnection, validate, multer, path, nesting, async, moment, transporter, emails) {
	
	/*Get All projects*/
	app.get('/admin/projects', function (req, res) {
		var admin = req.query;

		if(admin.role == 'ADMIN' && admin.adminId) {
			try {
				dbConnection.query('SELECT p.*, a.adminId, (SELECT COALESCE(SUM(amount),0) from payments pay where pay.projectId=p.projectId AND pay.txnStatus="TXN_SUCCESS") AS funded from projects p, assignprojects a WHERE p.projectId=a.projectId and a.adminId=? GROUP BY p.projectId ORDER BY p.projectId DESC', [admin.adminId], function (error, results, fields) {
					if (error) {
						console.log(error);
						res.status(500).send("Internal Server Error.");
						return;
					}
					res.status(200).send(results);
				});
			} catch(e) {
				console.log(e);
				res.status(500).send(e);
			}

		} else {
			try {
				dbConnection.query('SELECT p.*, (SELECT COALESCE(SUM(amount),0) from payments pay where pay.projectId=p.projectId AND pay.txnStatus="TXN_SUCCESS") AS funded FROM projects p ORDER BY p.projectId DESC', function (error, results, fields) {
					if (error) {
						console.log(error);
						res.status(500).send("Internal Server Error.");
						return;
					}
					res.status(200).send(results);
				});
			} catch(e) {
				console.log(e);
				res.status(500).send(e);
			}
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

	/*update admin details*/
	app.put('/admin/status', function (req, res) {
		var admin = req.body;
		if(!admin.adminId || !admin.status) {
			res.status(400).send("Bad Request. Admin ID/status should not be blank.");
			return;
		};
		try {
			dbConnection.query('UPDATE admin SET status=? WHERE adminId IN ('+admin.adminId+')', [admin.status], function (error, results, fields) {
				if (error) {
					res.status(500).send(error);
					return;
				}
				results.admin = admin;
				res.status(200).send(results);
			});
		} catch(e) {
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
			dbConnection.query('DELETE FROM admin WHERE adminId IN('+admin.adminId+')', function (error, results, fields) {
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
			if(adminId) {
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
			dbConnection.query('DELETE FROM category WHERE categoryId IN ('+category.categoryId+')', function (error, results, fields) {
				if (error) {
					res.status(500).send(error);
					return;
				}
				results.category = category;
				res.status(200).send(results);
			});
		} catch(e) {
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
			dbConnection.query('DELETE FROM banks WHERE bankId IN ('+banks.bankId+')', function (error, results, fields) {
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
			dbConnection.query('DELETE FROM cities WHERE cityId IN ('+cities.cityId+')', function (error, results, fields) {
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

	/*Get All abused comments */
	app.get('/admin/comments/abused', function (req, res) {
		try {
			dbConnection.query('SELECT c.*, (SELECT name from users WHERE users.userId=c.userId) as createdBy, (SELECT name from users WHERE users.userId=c.abusedBy) as reportedBy FROM comments c WHERE abused="true"', function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send("Internal Server Error.");
					return;
				}
				res.status(200).send(results);
			});
		} catch(e) {
			console.log(e);
			res.status(500).send("Internal Server Error.");
		}
	});
	
	/*update abused comment details*/
	app.put('/admin/comments/abused', function (req, res) {
		var abusedCmt = req.body;
		if(!abusedCmt.commentId) {
			res.status(400).send("Bad Request. commentId should not be blank.");
			return;
		};
		try {
			dbConnection.query('UPDATE comments SET ? WHERE commentId=?', [abusedCmt, abusedCmt.commentId], function (error, results, fields) {
				if (error) {
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

	
	app.put('/admin/comments/abused/status', function (req, res) {
		var abusedCmt = req.body;
		if(!abusedCmt.commentId) {
			res.status(400).send("Bad Request. commentId should not be blank.");
			return;
		};
		try {
			dbConnection.query('UPDATE comments SET abused = ? WHERE commentId IN ('+abusedCmt.commentId+')', [abusedCmt.abused], function (error, results, fields) {
				if (error) {
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

	
	/*delete specific abused comments details*/
	app.delete('/admin/comments/abused', function (req, res) {
		var abusedCmt = req.body;
		if(!abusedCmt.commentId) {
			res.status(400).send("Bad Request. commentId should not be blank.");
			return;
		};
		try {
			dbConnection.query('DELETE FROM comments WHERE commentId IN ('+abusedCmt.commentId+')', function (error, results, fields) {
				if (error) {
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


	
	/*update project details*/
	app.put('/admin/projects', function (req, res) {
		var project = req.body;
		if(!project.projectId) {
			res.status(400).send("Bad Request: ProjectId should not be empty.");
			return;
		};
		try {
			dbConnection.query('UPDATE projects SET status=? WHERE projectId IN ('+project.projectId+')', [project.status], function (error, results, fields) {
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

	/*Get All payments*/
	app.get('/pay/history', function (req, res) {
		try {
			dbConnection.query('SELECT * FROM payments', function (error, results, fields) {
				if (error) {
					res.status(500).send(error);
					return;
				}
				res.status(200).send(results);
			});
		} catch(e) {
			res.status(500).send(e);
		}
	});


	/*Get Specific payments details*/
	app.get('/pay/history/:paymentId', function (req, res) {
		var paymentId = req.params.paymentId;
		try {
			if(paymentId) {
				dbConnection.query('SELECT * FROM payments WHERE orderId=?', [paymentId], function (error, results, fields) {
					if (error) {
						res.status(500).send(error);
						return;
					}
					res.status(200).send(results);
				});
			}
		} catch(e) {
			res.status(500).send(e);
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
	
	/*update user details*/
	app.put('/admin/users/status', function (req, res) {
		var user = req.body;
		if(!user.userId) {
			res.status(400).send("Bad Request: UserId should not be empty.");
			return;
		};
		try {
			dbConnection.query('UPDATE users SET status=? WHERE userId IN ('+user.userId+')', [user.status], function (error, results, fields) {
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
	
	/*Statistics: Get project by location */
	app.get('/admin/statistics/projectCountByLocation', function (req, res) {
		var admin = req.query;
		if(!admin.fromDate || !admin.toDate) {
			res.status(400).send("Bad Request: From Date / To Date should not be empty.");
			return;
		};
		if(admin.role == 'ADMIN' && admin.adminId) {
			try {
				dbConnection.query('SELECT COUNT(p.projectId) as projectCount, p.location, a.adminId FROM projects p, assignprojects a WHERE (p.createdDate BETWEEN ? AND ?) AND p.projectId=a.projectId AND a.adminId=? GROUP BY p.location', [admin.fromDate, admin.toDate, admin.adminId], function (error, results, fields) {
					if (error) {
						res.status(500).send(error);
						return;
					}
					res.status(200).send(results);
				});
			} catch(e) {
				res.status(500).send(e);
			}
		} else {
			try {
				dbConnection.query('SELECT COUNT(*) as projectCount, location FROM projects WHERE createdDate BETWEEN ? AND ? GROUP BY location', [admin.fromDate, admin.toDate], function (error, results, fields) {
					if (error) {
						res.status(500).send(error);
						return;
					}
					res.status(200).send(results);
				});
			} catch(e) {
				res.status(500).send(e);
			}
		}
	});


	app.get('/admin/statistics/trending', function (req, res) {
		var admin = req.query;
		if(!admin.fromDate || !admin.toDate) {
			res.status(400).send("Bad Request: From Date / To Date should not be empty.");
			return;
		};
		if(admin.role == 'ADMIN' && admin.adminId) {
			try {
				//TODO: update the 	query as based on the assigned projects to admin.
				dbConnection.query("SELECT DATE_FORMAT(viewedOn, '%Y %b') as monthYear, COUNT(viewId) as viewCount, (SELECT COUNT(likeId) from likes WHERE DATE_FORMAT(likedOn, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS likesCount, (SELECT COUNT(shareId) from shares WHERE DATE_FORMAT(sharedOn, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS sharesCount, (SELECT COUNT(amount) from payments WHERE txnStatus='TXN_SUCCESS' AND DATE_FORMAT(txnDate, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS supportersCount from views WHERE viewedOn BETWEEN ? AND ? GROUP BY DATE_FORMAT(viewedOn, '%Y%m')", [admin.fromDate, admin.toDate], function (error, results, fields) {
					if (error) {
						res.status(500).send(error);
						return;
					}
					res.status(200).send(results);
				});
			} catch(e) {
				res.status(500).send(e);
			}
		} else {
			try {
				dbConnection.query("SELECT DATE_FORMAT(viewedOn, '%Y %b') as monthYear, COUNT(viewId) as viewCount, (SELECT COUNT(likeId) from likes WHERE DATE_FORMAT(likedOn, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS likesCount, (SELECT COUNT(shareId) from shares WHERE DATE_FORMAT(sharedOn, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS sharesCount, (SELECT COUNT(amount) from payments WHERE txnStatus='TXN_SUCCESS' AND DATE_FORMAT(txnDate, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS supportersCount from views WHERE viewedOn BETWEEN ? AND ? GROUP BY DATE_FORMAT(viewedOn, '%Y%m')", [admin.fromDate, admin.toDate], function (error, results, fields) {
					if (error) {
						res.status(500).send(error);
						return;
					}
					res.status(200).send(results);
				});
			} catch(e) {
				res.status(500).send(e);
			}
		}
		
	});


	app.get('/admin/statistics/projectscount', function (req, res) {
		var admin = req.query;
		if(!admin.fromDate || !admin.toDate) {
			res.status(400).send("Bad Request: From Date / To Date should not be empty.");
			return;
		};
		if(admin.role == 'ADMIN' && admin.adminId) {
			try {
				dbConnection.query("SELECT COUNT(p.projectId) as projectCount, DATE_FORMAT(createdDate, '%Y %b') as monthYear, a.adminId FROM projects p, assignprojects a WHERE (p.createdDate BETWEEN ? AND ?) AND p.projectId=a.projectId AND a.adminId=? GROUP BY DATE_FORMAT(createdDate, '%Y%m')", [admin.fromDate, admin.toDate, admin.adminId], function (error, results, fields) {
					if (error) {
						res.status(500).send(error);
						return;
					}
					res.status(200).send(results);
				});
			} catch(e) {
				res.status(500).send(e);
			}
		} else {
			try {
				dbConnection.query("SELECT COUNT(*) as projectCount, DATE_FORMAT(createdDate, '%Y %b') as monthYear FROM projects WHERE createdDate BETWEEN ? AND ? GROUP BY DATE_FORMAT(createdDate, '%Y%m')", [admin.fromDate, admin.toDate], function (error, results, fields) {
					if (error) {
						res.status(500).send(error);
						return;
					}
					res.status(200).send(results);
				});
			} catch(e) {
				res.status(500).send(e);
			}
		}

	});


}

//SELECT p.projectId, p.title, (SELECT COUNT(*) from likes l where l.projectId=p.projectId) AS likesCount, (SELECT COUNT(*) from views v where v.projectId=p.projectId) AS viewsCount, (SELECT COUNT(*) from shares s where s.projectId=p.projectId) AS sharesCount, (SELECT COALESCE(SUM(amount),0) from payments pay where pay.projectId=p.projectId AND pay.txnStatus='TXN_SUCCESS') AS funded, (SELECT count(amount) from payments paycount where paycount.projectId=p.projectId AND paycount.txnStatus='TXN_SUCCESS') AS fundedCount, (SELECT SUM(likesCount+viewsCount)) AS socialCount FROM projects p HAVING socialCount>0 ORDER BY socialCount


//Bar Graph - No. of projects Trend Month on Month

//SELECT DATE_FORMAT(viewedOn, '%Y%b') as monthYear, COUNT(viewId) as viewCount, (SELECT COUNT(likeId) from likes WHERE DATE_FORMAT(likedOn, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS likesCount, (SELECT COUNT(shareId) from shares WHERE DATE_FORMAT(sharedOn, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS sharesCount, (SELECT COUNT(amount) from payments WHERE txnStatus='TXN_SUCCESS' AND DATE_FORMAT(txnDate, '%Y%m') = DATE_FORMAT(viewedOn, '%Y%m')) AS supportersCount from views GROUP BY DATE_FORMAT(viewedOn, '%Y%m')


//CREATE TABLE `backme`.`assignprojects` ( `assignId` INT NOT NULL AUTO_INCREMENT , `projectId` INT NOT NULL , `adminId` INT NOT NULL , `assignedDate` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP() , `reviewedDate` TIMESTAMP NOT NULL , `status` VARCHAR(255) NOT NULL , `comments` VARCHAR(1000) NOT NULL , PRIMARY KEY (`assignId`)) ENGINE = InnoDB;


//SELECT a.adminId, COUNT(ap.assignId) as assignCount from admin a LEFT JOIN assignprojects ap ON a.adminId = ap.adminId GROUP BY a.adminId ORDER BY assignCount LIMIT 1


//SELECT COUNT(*) as projectCount, DATE_FORMAT(createdDate, '%Y %b') as monthYear FROM projects WHERE createdDate BETWEEN ? AND ? GROUP BY DATE_FORMAT(createdDate, '%Y%m')

//SELECT COUNT(*) as projectCount, DATE_FORMAT(createdDate, '%Y %b') as monthYear FROM projects GROUP BY DATE_FORMAT(createdDate, '%Y%m')



//SELECT COUNT(p.projectId) as projectCount, p.location, a.adminId FROM projects p, assignprojects a WHERE p.projectId=a.projectId GROUP BY p.location


//SELECT p.*, a.adminId FROM projects p, assignprojects a WHERE p.projectId=a.projectId ORDER BY p.projectId DESC

//SELECT p.*, (SELECT COUNT(*) from likes l where l.projectId=p.projectId) AS likesCount, a.adminId FROM projects p, assignprojects a WHERE p.projectId=a.projectId ORDER BY p.projectId DESC

/*//SELECT p.*, TIMESTAMPDIFF(HOUR,CURDATE(),endByDate) as remainHours, TIMESTAMPDIFF(DAY,CURDATE(),endByDate) as remainDays, TIMESTAMPDIFF(DAY,createdDate,endByDate) as totalDays, a.adminId, (SELECT COUNT(*) from likes l where l.projectId=p.projectId) AS likesCount, (SELECT COUNT(*) from likes al where al.projectId=p.projectId) AS alreadyLiked, (SELECT COUNT(*) from views v where v.projectId=p.projectId) AS viewsCount, (SELECT COUNT(*) from payments p where p.projectId=p.projectId AND txnStatus="TXN_SUCCESS") AS supportersCount, a.adminId FROM projects p 
LEFT JOIN assignprojects a ON (p.projectId=a.projectId)
					LEFT JOIN spendmoney ON (p.projectId = spendmoney.projectId) 
					LEFT JOIN projectsassets ON (p.projectId = projectsassets.projectId) 
					LEFT JOIN servicerewards ON (p.projectId = servicerewards.projectId) 
					LEFT JOIN supportrewards ON (p.projectId = supportrewards.projectId) 
					LEFT JOIN team ON (p.projectId = team.projectId) 
					LEFT JOIN (SELECT orderId, projectId, COALESCE(SUM(amount),0) as amount, count(orderId) as count FROM payments WHERE txnStatus="TXN_SUCCESS" GROUP BY projectId) payments ON (p.projectId = payments.projectId) WHERE p.projectId=a.projectId AND a.adminId=8 ORDER BY p.projectId DESC*/



