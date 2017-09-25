const router = require('express').Router();

/* GET home page. */
router.get('/', async(req, res, next) => {
  return res.render('index', { title: 'Local Media Server' });
});

router.get('/files', (req, res, next) => {
  return res.render('files', { title: 'Local Media Server' });
});

router.get('/upload', (req, res, next) => {
  return res.render('upload', { title: 'Upload' });
});

module.exports = router;
