const express = require('express');
const {send400} = require('../utils');
const {verifyJWT} = require('../middleware/auth');
const {insertTweet} = require('../database/database');

const router = express.Router();

router.post('/', verifyJWT, (req, res) => {
    if (!req.hasInvitation) {
        return send400(res, "You can't tweet without having an invitation");
    }
    if (!req.body.tweet) {
        return send400(res, "Your tweet can't be empty");
    }
    //All checks passed & we are good to go - insert user tweet into database
    insertTweet(req.tweeterID, req.body.tweet)
        .then((tweets) => {
            res.status(200).json({success: true, data: tweets});
        })
        .catch((_) => {
            res.status(500).json({success: false, data: "Something went very wrong"});
        });
})

module.exports = router