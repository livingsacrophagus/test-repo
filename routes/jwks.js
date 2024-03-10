const fs = require('fs');
const express = require('express');

const router = express.Router();

const jwks = fs.readFileSync('./jwt/jwks.json', 'utf8');

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(jwks);
})

module.exports = router;