var cfenv = require('cfenv')
	;

var config = {
	cloudant : {},
	secret : "IBMConnectionsCloud.01012016",
	box : {
	  boxAppSettings: {
	    clientID: "",
	    clientSecret: "",
	    appAuth: {
	      keyID: "",
	      privateKey: "",
	      passphrase: ""
	    }
	  },
	  enterpriseID: ""
	}
};

if (process.env.VCAP_SERVICES) {
	var appEnv = cfenv.getAppEnv();
	//console.log('*******AppEnv:', appEnv);

	//Cloudant
	var cloudantConfig = appEnv.getService('CloudantBoxPlatform');
	config.cloudant.username = cloudantConfig.credentials.username;
	config.cloudant.password = cloudantConfig.credentials.password;
	config.cloudant.url = cloudantConfig.credentials.url;
} else {

	//cloudant
	config.cloudant.username = "";
	config.cloudant.password = "";
	config.cloudant.url = "";
	/*config.cloudant.username = "ff6b0cb0-d0f3-4c9b-a5b9-79b7c954c470-bluemix";
	config.cloudant.password = "557d903f7ea204d0b64ca438691f3f88ff6cdaf29058ce4e82ae85981b48e42e";
	config.cloudant.url = "https://ff6b0cb0-d0f3-4c9b-a5b9-79b7c954c470-bluemix:557d903f7ea204d0b64ca438691f3f88ff6cdaf29058ce4e82ae85981b48e42e@ff6b0cb0-d0f3-4c9b-a5b9-79b7c954c470-bluemix.cloudant.com";*/
}
//Base de datos
config.cloudant.base = "boxplatformusers";

module.exports = config;
