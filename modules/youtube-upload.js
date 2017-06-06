
/*begin the google login for upload video in youtube*/

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var youtube = google.youtube('v3');
var googleToken;

exports.youtubeAPI = function(app, dbConnection, validate, multer, path, nesting, async, moment, request, oAuthCredentials) {
	
	var oauth2Client = new OAuth2(
		oAuthCredentials.client_id,
		oAuthCredentials.client_secret,
		oAuthCredentials.redirect_url
	);

	// generate a url that asks permissions for Google+ and Google Calendar scopes
	var scopes = [
	  'https://www.googleapis.com/auth/plus.me',
	  'https://www.googleapis.com/auth/youtube.upload'
	];


	var url = oauth2Client.generateAuthUrl({
	  access_type: 'offline',
	  scope: scopes,
	  approval_prompt:'force'
	});

	console.log(url);

	request.get(url, function (error, response, body) {
		console.log('Hai')
		if (!error && response.statusCode == 200) {
			console.log('Hai')
		 }
	});

	app.get('/auth', function(req, res) {
		console.log('req.query.code', req.query.code);
		//var session = req.session;
		oauth2Client.getToken(req.query.code, function(err, tokens) {
			if (err) {
				console.log('Error while trying to retrieve access tokens', err);
				res.status(200).send(err);
				return;
			}
			//oauth2Client.setCredentials(tokens);
			oauth2Client.setCredentials({
				access_token: tokens.access_token,
				refresh_token: tokens.refresh_token,
				expiry_date: (new Date()).getTime() + (1000)
				//expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
			});
			
			//session["tokens"]=tokens;
			googleToken = tokens;
			google.options({auth: oauth2Client});
			console.log('tokens', tokens);
			res.status(200).send(tokens);
		});
	});

	app.get('/refreshOauthToken', function(req, res) {
		/*oauth2Client.refreshAccessToken(function(err, tokens) {
			oauth2Client.credentials = tokens;
			googleToken = tokens;
			google.options({auth: oauth2Client});
			console.log('refresh tokens', tokens);
			res.status(200).send(tokens);
		});*/
		setInterval(function() {
			oauth2Client.refreshAccessToken(function(err, tokens) {
				oauth2Client.credentials = tokens;
				googleToken = tokens;
				google.options({auth: oauth2Client});
				console.log('refresh tokens', tokens);
			});
		}, 1000*10);
		
	});
    /*setInterval(function() {
        oauth2Client.refreshAccessToken(function(err, tokens) {
            oauth2Client.credentials = tokens;
            googleToken = tokens;
            google.options({auth: oauth2Client});
            console.log('refresh tokens', tokens);
        });
    }, 1000*10);*/
	//1000*60*50
	app.post('/uploadVideo', function(req, res) {
		var upload = multer({
			storage: multer.memoryStorage()
		}).fields([{name:'projectImages', maxCount:8}]);

		upload(req, res, function (err, success) {
			if (err) {
				console.log(err);
				res.status(500).send(err);
				return;
			}
			var project = req.body;
			if(!project.projectId || !project.userId) {
				res.status(400).send("Bad Request. Project ID/User ID should not be blank.");
				return;
			};

			if(req.files && req.files.projectImages) {
				console.log(project);
				var videoData = req.files.projectImages[0].buffer;
				uploadToYoutube(videoData, project.title, project.title, googleToken, function(err, data) {
					if(err) {
						console.log(err);
						res.status(500).send(err);
						return;
					}
					try {
						var projectAssets = [];
						projectAssets.push([project.projectId, project.userId, 'Video', data.snippet.thumbnails["high"].url, data.id, data.snippet.title, data.snippet.description]);
						dbConnection.query('INSERT INTO projectsassets (projectId, userId, type, location, videoId, title, description) VALUES ?', [projectAssets], function (error, results, fields) {
							if (error) {
								res.status(500).send(error.code=='ER_DUP_ENTRY'?'Email already found.':error.code);
								return;
							}
							projectAssets[0].splice(4,0, results.insertId);
							res.status(200).send(projectAssets);
							return;
						});
					} catch(e) {
						console.log(e);
						res.status(500).send("Internal Server Error.");
					}
				});
			} else {
				res.status(500).send('Video file not found.');
			}
		});
	});


	function uploadToYoutube(videoBuffered, title, description,tokens, callback){
		youtube.videos.insert({
			part: 'status,snippet',
			resource: {
				snippet: {
					title: title,
					description: description,
					tags: ['Backme']
				},
				status: { 
					privacyStatus: 'public' //if you want the video to be private
				}
			},
			media: {
				body: videoBuffered
			}
		}, function(error, data){
			console.log('youtube err ', error);
			console.log('youtube data ', data);
			
			if(error){
				callback(error, null);
			} else {
				callback(null, data);
			}
		});
	};
}

/*end google login for upload video in youtube*/