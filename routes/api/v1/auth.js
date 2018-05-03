var express = require('express') 
  , router = express.Router()
  , Controller = require('../../../controllers/auth');

router.post('/', function(req, res) {
  Controller.auth(req, res);
});

module.exports = router;