var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('ieexcel', { title: 'Import and Export Excel' });
});

module.exports = router;
