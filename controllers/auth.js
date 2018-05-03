var https = require('https')
, config = require('../config/config')
, jwt = require('jsonwebtoken')
, usersDb = require('./usersDb')
, boxSDK = require('box-node-sdk')
;

module.exports = {
	auth: function (req, res) {

		//1. Authnticate using connections cloud AppId

		var authTokenBase64 = req.body.code || req.headers['loginToken'];

		getUserDataFromConnections(authTokenBase64, function(errGettingConnectionsUserData, userData){
			if (!errGettingConnectionsUserData){
				//2. Validate User Token
				console.log("Authenticated with User Data email:", userData.entry.emails[0].value);
				usersDb.validateUser(userData.entry.emails[0].value, function(errValidatingUser, userDbData){
					if(!errValidatingUser){
						if(userDbData){
							//User Exists, create Token
							userData.appUserId = userDbData.appUserID;
							createUserToken(userData, function(errCreatingToken, token){
								//Send token back
								res.status(200).json({
									"userData": userData,
									"token": token
								});
							});
						} else {
							//User does not Exists, create appuser
							console.log("Box Config", config.box.boxAppSettings);
							const sdk = new boxSDK(config.box.boxAppSettings);

							const client = sdk.getAppAuthClient('enterprise', config.box.enterpriseID);
							client.enterprise.addUser(
								userData.entry.emails[0].value,
								userData.entry.displayName,
								{ is_platform_access_only: true },
								function(errorCreatingAppUser, newUser){
									if(!errorCreatingAppUser){
										console.log('Box App User Created:', newUser);
										//appUser created now save it on boxplatform DB
										newUser.boxId = newUser.id;
										delete newUser.id;
										newUser.email = userData.entry.emails[0].value;
										usersDb.insertUser(newUser, function(errorInsertinUser, response){
											if(!errorInsertinUser){
												console.log("User registered in DB");
												//appuser created and registered in boxplatformusers db, now create token and send it
												createUserToken(newUser, function(errCreatingToken, token){
													//Send token back
													res.status(200).json({
														"userData": newUser,
														"token": token
													});
												});
											} else {
												console.log("error registering user:", errorInsertinUser);
											}
										});
									} else {
										if (errorCreatingAppUser.statusCode == 409){
											console.log("This user already has a Box account but is not registered as a Box Platform user!");
										} else {
											console.log("Error creating new App User:", err);
										}
									}
								}
							);
						}
					}

				});
			} else {
				res.status(errGettingConnectionsUserData.status).json(errGettingConnectionsUserData);
			}
		});
	}
}

let getUserDataFromConnections = function (authTokenBase64, callback){

	var options = {
		hostname: 'apps.na.collabserv.com',
		port: 443,
		path: '/connections/opensocial/basic/rest/people/@me/@self',
		method: 'GET',
		headers: { 'Authorization': 'Basic ' + authTokenBase64 }
	};

	var req = https.request(options, function(response) {
		var body = '';
		response.on('data', (d) => {
			body += d;
		}).on('end', function(){
			if (response.statusCode == 200) {
				console.log("Datos usuario:", body);
				var userData = JSON.parse(body);
				userData.tokenBase64 = authTokenBase64;

				callback(null, userData);
				return;
			} else {
				console.log("Authentication Error with status code:", response.statusCode);
				callback({
					"status": response.statusCode,
					"message": "User not found"
				}, null);
				return;
			}
		});
	});
	req.end();

	req.on('error', (e) => {
		console.error(e);
		callback({
			"status" : 500,
			"message": "Error trying to login: " + e
		}, null);
	});
}

let createUserToken = function(userData, callback){
	var token = jwt.sign(userData, config.secret, {
		expiresIn: '2h' // expires in 2 hours
	});
	callback(null, token);
}
