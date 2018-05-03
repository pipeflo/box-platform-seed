var config = require('../config/config')
	, Cloudant = require('cloudant')
	, https = require('https')
	;

module.exports = {
	getJobsHistory : function(req, res){
		//console.log("Validando id: ", idBrassring);
		https.get(config.cloudant.url + '/kenexasync/_design/jobs/_view/byBrassringId',
			function(response) {
		        // Continuously update stream with data
		        var body = '';
		        response.on('data', function(d) {
		            body += d;
		        });
		        response.on('end', function() {
		        	if (response.statusCode == 200) {
			        	var parsed = JSON.parse(body);
			        	res.status(200).json(parsed);
		        	} else {
		        		console.error("Error getting jobs synced history: ", body);
		        		callback({
							"status" : 500,
							"message" : "Error getting jobs synced history with status: " + response.statusCode + ", message: " + body
						}, null);
		        	}
		        });
		        response.on('error', function(err){
		        	console.error('Error getting jobs synced history: ', err);
			        callback({
						"status" : 500,
						"message" : "Error getting jobs synced history: " + err
					}, null);
		        });
    		}
    	).end();
	}
	, getRequestsHistory: function (req, res) {
		https.get(config.cloudant.url + '/kenexasync/_design/syncrequests/_view/all',
			function(response) {
		        // Continuously update stream with data
		        var body = '';
		        response.on('data', function(d) {
		            body += d;
		        });
		        response.on('end', function() {
		        	if (response.statusCode == 200) {
			        	var parsed = JSON.parse(body);
			        	res.status(200).json(parsed);
		        	} else {
		        		console.error("Error getting Sync Requests history: ", body);
		        		callback({
							"status" : 500,
							"message" : "Error getting Sync Requests history with status: " + response.statusCode + ", message: " + body
						}, null);
		        	}
		        });
		        response.on('error', function(err){
		        	console.error('Error getting Sync Requests history: ', err);
			        callback({
						"status" : 500,
						"message" : "Error getting Sync Requests history: " + err
					}, null);
		        });
    		}
    	).end();
	}
	, getCandidatesHistory : function(req, res){
		//console.log("Validando id: ", idBrassring);
		https.get(config.cloudant.url + '/candidatessync/_design/candidates/_view/byIdentifier',
			function(response) {
		        // Continuously update stream with data
		        var body = '';
		        response.on('data', function(d) {
		            body += d;
		        });
		        response.on('end', function() {
		        	if (response.statusCode == 200) {
			        	var parsed = JSON.parse(body);
			        	res.status(200).json(parsed);
		        	} else {
		        		console.error("Error getting Candidates synced history: ", body);
		        		callback({
							"status" : 500,
							"message" : "Error getting Candidates synced history with status: " + response.statusCode + ", message: " + body
						}, null);
		        	}
		        });
		        response.on('error', function(err){
		        	console.error('Error getting Candidates synced history: ', err);
			        callback({
						"status" : 500,
						"message" : "Error getting Candidates synced history: " + err
					}, null);
		        });
    		}
    	).end();
	}
}
