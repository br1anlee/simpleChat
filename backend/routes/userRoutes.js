const express = require('express');
const database = require('../database');
const { isAuthorized } = require('../middlewares');
const router = express.Router();

router.get('/data', isAuthorized, (req, res) => {
	database
		.getUserData(req.session.user)
		.then((result) => {
			if (!result) return res.json({ data: false });
			return res.json({ data: result });
		})
		.catch((err) => res.sendStatus(500));
});

router.put('/profilePhoto', isAuthorized, (req, res) => {
	//store into s3 bucket, get presigned, store url into db, return results
});

module.exports = router;
