
exports.projectsAPI = function(app, dbConnection, validate, multer, path, nesting, async, moment) {
	
	const MAX_FILE_SIZE = 50*1024*1024;
	
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
	
	/*create project*/
	app.put('/projects', function (req, res) {
		var upload = multer({
			storage: storage, 
			limits: {fileSize: MAX_FILE_SIZE}
		}).single('posterImg');

		upload(req, res, function (err, success) {
			if (err) {
				console.log(err);
				res.status(500).send('Error Uploading file. Invalid file format/exceeded file size/Internal Server error.');
				return;
			}
			var project = req.body;
			if(req.file) {
				project.coverImage = req.file.filename;
			}
			if(!project.title || !project.category || !project.location || !project.description || !project.userId) {
				res.status(400).send("Bad Request. PosterImage/Title/Category/Location/Description/UserId should not be empty.");
				return;
			};
			if(project.email && !validate.validateEmail(project.email)) {
				res.status(400).send("Invalid Email.");
				return;
			}
			try {
				dbConnection.query('INSERT INTO projects SET ?', project, function (error, results, fields) {
					if (error) {
						res.status(500).send(error.code);
						return;
					}
					results.coverImage = project.coverImage;
					res.status(200).send(results);
				});
			} catch(e) {
				res.status(500).send("Internal Server Error.");
			}
		});
		
	});

	/* Upload project Images */
	app.post('/projectImages', function (req, res) {
		var upload = multer({
			storage: storage, 
			limits: {fileSize: MAX_FILE_SIZE}
		}).fields([{name: 'projectImages', maxCount: 8}]);

		upload(req, res, function (err, success) {
			if (err) {
				console.log(err);
				res.status(500).send('Error Uploading file. Invalid file format/exceeded file size/Internal Server error.');
				return;
			}
			var project = req.body;
			if(req.files && req.files.posterImg) {
				project.coverImage = req.files.posterImg[0].filename;
			}
			if(!project.projectId || !project.userId) {
				res.status(400).send("Bad Request. Project ID/User ID should not be blank.");
				return;
			};
			var projectAssets = [];
			if(req.files && req.files.projectImages) {
				for(i in req.files.projectImages) {
					projectAssets.push([project.projectId, project.userId, req.files.projectImages[i].mimetype, req.files.projectImages[i].filename]);
				}
			}
			try {
				dbConnection.query('INSERT INTO projectsassets (projectId, userId, type, location) VALUES ?', [projectAssets], function (error, results, fields) {
					if (error) {
						res.status(500).send(error.code=='ER_DUP_ENTRY'?'Email already found.':error.code);
						return;
					}
					projectAssets[0].push(results.insertId);
					res.status(200).send(projectAssets);
					return;
				});
			} catch(e) {
				console.log(e);
				res.status(500).send("Internal Server Error.");
			}
		});
	});
	

	/*Update project*/
	app.post('/projects', function (req, res) {
		var upload = multer({
			storage: storage, 
			limits: {fileSize: MAX_FILE_SIZE}
		}).fields([{name: 'posterImg', maxCount: 1}, {name: 'userImg', maxCount: 1}]);

		upload(req, res, function (err, success) {
			if (err) {
				console.log(err);
				res.status(500).send('Error Uploading file. Invalid file format/exceeded file size/Internal Server error.');
				return;
			}
			var project = req.body;
			//console.log(req.files);
			if(req.files && req.files.posterImg) {
				project.coverImage = req.files.posterImg[0].filename;
			}
			if(req.files && req.files.userImg) {
				project.userPhoto = req.files.userImg[0].filename;
			}
			if(!project.projectId) {
				res.status(400).send("Bad Request. Project ID should not be blank.");
				return;
			};
			if(project.email && !validate.validateEmail(project.email)) {
				res.status(400).send("Invalid Email.");
				return;
			}
			
			if(project.endByDate) {
				project.endByDate = moment(project.endByDate).format('YYYY-MM-DD HH:mm:ss');
			}
			try {
				var spendmoney, projectsassets,supportrewards,servicerewards;
				if(project.spendmoney) {
					spendmoney = project.spendmoney;
					delete project.spendmoney;
				}
				if(project.projectsassets) {
					projectsassets = project.projectsassets;
					delete project.projectsassets;	
				}
				if(project.supportrewards) {
					supportrewards = project.supportrewards;
					delete project.supportrewards;	
				}
				if(project.servicerewards) {
					servicerewards = project.servicerewards;
					delete project.servicerewards;	
				}
				if(project.projectImages) {
					delete project.projectImages;	
				}
				async.waterfall([
					function (wCB) {
						dbConnection.query('UPDATE projects SET ? WHERE projectId=?', [project, project.projectId], function (error, results, fields) {
							if (error) {
								return wCB(error);
							}
							wCB();
						});
					},
					function (wCB) {
						/*if(req.files && req.files.projectImages) {
							var projectImagesData = [];
							for(i in req.files.projectImages) {
								projectImagesData.push([project.projectId, project.userId, req.files.projectImages[i].mimetype, req.files.projectImages[i].filename]);
							}
							dbConnection.query('INSERT INTO projectsassets (projectId, userId, type, location) VALUES ?', [projectImagesData], function (error, results, fields) {
								if (error) {
									return wCB(error);
								}
								wCB();
							});
						} else {
							wCB();
						}*/
						wCB();
					},
					function (wCB) {
						if(spendmoney) {
							var spendMoneyData = [];
							for(i in spendmoney) {
								spendMoneyData.push([spendmoney[i].projectId, spendmoney[i].userId, spendmoney[i].amount, spendmoney[i].description]);
							}
							dbConnection.query('DELETE FROM spendmoney WHERE projectId=?', project.projectId, function (error, results, fields) {
								if (error) {
									return wCB(error);
								}
								dbConnection.query('INSERT INTO spendmoney (projectId, userId, amount, description) VALUES ?', [spendMoneyData], function (error, results, fields) {
									if (error) {
										return wCB(error);
									}
									wCB();
								});
							});
						} else {
							wCB();
						}				
					},
					function (wCB) {
						if(supportrewards) {
							var supportRewardsData = [];
							for(i in supportrewards) {
								supportRewardsData.push([supportrewards[i].projectId, supportrewards[i].userId, supportrewards[i].amount, supportrewards[i].title, supportrewards[i].description]);
							}
							dbConnection.query('DELETE FROM supportrewards WHERE projectId=?', project.projectId, function (error, results, fields) {
								if (error) {
									return wCB(error);
								}
								dbConnection.query('INSERT INTO supportrewards (projectId, userId, amount, title, description) VALUES ?', [supportRewardsData], function (error, results, fields) {
									if (error) {
										return wCB(error);
									}
									wCB();
								});
							});
						} else {
							wCB();
						}				
					},
					function (wCB) {
						if(servicerewards) {
							var servicerewardsData = [];
							for(i in servicerewards) {
								servicerewardsData.push([servicerewards[i].projectId, servicerewards[i].userId, servicerewards[i].amount, servicerewards[i].activityName, servicerewards[i].availableDate, servicerewards[i].description]);
							}
							dbConnection.query('DELETE FROM servicerewards WHERE projectId=?', project.projectId, function (error, results, fields) {
								if (error) {
									return wCB(error);
								}
								dbConnection.query('INSERT INTO servicerewards (projectId, userId, amount, activityName, availableDate, description) VALUES ?', [servicerewardsData], function (error, results, fields) {
									if (error) {
										return wCB(error);
									}
									wCB();
								});
							});
						} else {
							wCB();
						}				
					},
					function (wCB) {
						res.status(200).send('Project updated successfully.');
					}
				], function (err) {
					// If we pass first paramenter as error this function will execute.
					res.status(500).send(err.code?err.code:"Internal Server Error.");
				});

			} catch(e) {
				console.log(e);
				res.status(500).send("Internal Server Error.");
			}
		});
	});

	
	/*Get All projects*/
	app.get('/projects', function (req, res) {
		try {
			dbConnection.query({sql: 'SELECT *, TIMESTAMPDIFF(HOUR,CURDATE(),endByDate) as remainHours, \
					TIMESTAMPDIFF(DAY,CURDATE(),endByDate) as remainDays, TIMESTAMPDIFF(DAY,createdDate,endByDate) as totalDays FROM projects \
					LEFT JOIN spendmoney ON projects.projectId = spendmoney.projectId \
					LEFT JOIN projectsassets ON projects.projectId = projectsassets.projectId \
					LEFT JOIN servicerewards ON projects.projectId = servicerewards.projectId \
					LEFT JOIN supportrewards ON projects.projectId = supportrewards.projectId \
					WHERE projects.STATUS = "ACTIVE" AND projects.endByDate >= CURDATE()', nestTables: true}, function (error, results, fields) {
				var nestingOptions = [
					{ tableName : 'projects', pkey: 'projectId', fkeys:[{table:'spendmoney',col:'projectId'}, {table:'projectsassets',col:'projectId'}, {table:'servicerewards',col:'projectId'}, {table:'supportrewards',col:'projectId'}, {table:'remaindayshours',col:'projectId'}]},
					{ tableName : 'spendmoney', pkey: 'spendId'},
					{ tableName : 'projectsassets', pkey: 'assetId'},
					{ tableName : 'servicerewards', pkey: 'serviceId'},
					{ tableName : 'supportrewards', pkey: 'supportId'},
					{ tableName : 'remaindayshours', pkey: 'remainId'}
				];
				var nestedRows = nesting.convertToNested(results, nestingOptions);
				if (error) {
					res.status(500).send("Internal Server Error.");
					return;
				}
				res.status(200).send(nestedRows);
			});
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});
	
	/*Get Specific project details*/
	app.get('/projects/:projectId', function (req, res) {
		var projectId = req.params.projectId;
		try {
			if(projectId) {
				dbConnection.query({sql: 'SELECT *, TIMESTAMPDIFF(HOUR,CURDATE(),endByDate) as remainHours, \
					TIMESTAMPDIFF(DAY,CURDATE(),endByDate) as remainDays, TIMESTAMPDIFF(DAY,createdDate,endByDate) as totalDays FROM projects \
					LEFT JOIN spendmoney ON projects.projectId = spendmoney.projectId \
					LEFT JOIN projectsassets ON projects.projectId = projectsassets.projectId \
					LEFT JOIN servicerewards ON projects.projectId = servicerewards.projectId \
					LEFT JOIN supportrewards ON projects.projectId = supportrewards.projectId  WHERE projects.projectId=? AND \
					projects.STATUS = "ACTIVE" AND projects.endByDate >= CURDATE()', nestTables: true}, [projectId], function (error, results, fields) {
					var nestingOptions = [
						{ tableName : 'projects', pkey: 'projectId', fkeys:[{table:'spendmoney',col:'projectId'}, {table:'projectsassets',col:'projectId'}, {table:'servicerewards',col:'projectId'}, {table:'supportrewards',col:'projectId'}, {table:'remaindayshours',col:'projectId'}]},
						{ tableName : 'spendmoney', pkey: 'spendId'},
						{ tableName : 'projectsassets', pkey: 'assetId'},
						{ tableName : 'servicerewards', pkey: 'serviceId'},
						{ tableName : 'supportrewards', pkey: 'supportId'},
						{ tableName : 'remaindayshours', pkey: 'remainId'}
					];
					var nestedRows = nesting.convertToNested(results, nestingOptions);
					if (error) {
						res.status(500).send("Internal Server Error.");
						return;
					}
					res.status(200).send(nestedRows.length ? nestedRows[0] : nestedRows);
				});
			}
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});

	/*Get Specific project by userId*/
	app.get('/projectsByUser', function (req, res) {
		var user = req.query;
		try {
			if(user.userId && user.status) {
				dbConnection.query({sql: 'SELECT *, TIMESTAMPDIFF(HOUR,CURDATE(),endByDate) as remainHours, \
					TIMESTAMPDIFF(DAY,CURDATE(),endByDate) as remainDays, TIMESTAMPDIFF(DAY,createdDate,endByDate) as totalDays FROM projects \
					LEFT JOIN spendmoney ON projects.projectId = spendmoney.projectId \
					LEFT JOIN projectsassets ON projects.projectId = projectsassets.projectId \
					LEFT JOIN servicerewards ON projects.projectId = servicerewards.projectId \
					LEFT JOIN supportrewards ON projects.projectId = supportrewards.projectId  WHERE projects.userId=? AND projects.status=?  AND projects.endByDate >= CURDATE()', nestTables: true}, [user.userId, user.status], function (error, results, fields) {
					var nestingOptions = [
						{ tableName : 'projects', pkey: 'projectId', fkeys:[{table:'spendmoney',col:'projectId'}, {table:'projectsassets',col:'projectId'}, {table:'servicerewards',col:'projectId'}, {table:'supportrewards',col:'projectId'}, {table:'remaindayshours',col:'projectId'}]},
						{ tableName : 'spendmoney', pkey: 'spendId'},
						{ tableName : 'projectsassets', pkey: 'assetId'},
						{ tableName : 'servicerewards', pkey: 'serviceId'},
						{ tableName : 'supportrewards', pkey: 'supportId'},
						{ tableName : 'remaindayshours', pkey: 'remainId'}
					];
					var nestedRows = nesting.convertToNested(results, nestingOptions);
					if (error) {
						res.status(500).send("Internal Server Error.");
						return;
					}
					res.status(200).send(nestedRows);
				});				
			}
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});

	/*Get projects list for home page*/
	app.get('/search', function (req, res) {
		var query = '%';
		if(req.query.q) {
			query = '%'+req.query.q+'%';
		}
		try {
			dbConnection.query("SELECT projectId, title, category, coverImage, moneyNeeded, endByDate, createdDate, userId, name, userPhoto, TIMESTAMPDIFF(DAY,CURDATE(),endByDate) as remainDays FROM projects WHERE STATUS = 'ACTIVE' AND endByDate >= CURDATE() AND (title LIKE ? OR category LIKE ?  OR name LIKE ?  OR location LIKE ?  OR description LIKE ?)", [query, query, query, query, query], function (error, results, fields) {
				if (error) {
					console.log(error);
					res.status(500).send("Internal Server Error.");
					return;
				}
				res.status(200).send(results);
			});				
		} catch(e) {
			res.status(500).send("Internal Server Error.");
		}
	});

}
