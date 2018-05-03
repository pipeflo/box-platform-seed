var express = require('express')
var express = require('express')
  , router = express.Router()
  , jwt = require('jsonwebtoken')
  , Controller = require('../../../controllers/history')
  , config = require('../../../config/config')
  ;

router.get('/jobs', isLoggedIn, function(req, res) {
  Controller.getJobsHistory(req, res);
});

router.get('/candidates', isLoggedIn, function(req, res) {
  Controller.getCandidatesHistory(req, res);
});

router.get('/candidates/:applicantId/:brassringId', isLoggedIn, function(req, res) {
  console.log("Entro a Candidates Histori route");
  Controller.getCandidate(req, res);
});

router.get('/syncrequests', isLoggedIn, function(req, res) {
  Controller.getRequestsHistory(req, res);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    var token = req.body.token || req.headers['x-access-token'];

    // decode token
 	if (token) {
 		// verifies secret and checks exp
 		jwt.verify(token, config.secret, function(err, decoded) {
 			if (err) {
				return res.status(401).send({
					success: false,
					message: 'Failed to authenticate token.'
				});
		 	} else {
		 		// if everything is good, save to request for use in other routes
		 		req.userData = decoded;
		 		return next();

		 	}
 		});

 	} else {

		// if there is no token
		// return an HTTP response of 403 (access forbidden) and an error message
		return res.status(401).send({
			success: false,
			message: 'No token provided.'
		});
	}
}

module.exports = router;
