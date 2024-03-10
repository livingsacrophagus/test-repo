const fs = require('fs');
const axios = require('axios');

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwktopem = require("jwk-to-pem");
const {send400} = require('../utils');

//Don't waste your time obtaining this private key - this is not the way
const privateKey = fs.readFileSync('./jwt/private.key', 'utf8')

const createJWT = () => {
    const claims = {
        hasInvitation: false,
        tweeterID: crypto.randomBytes(32).toString('hex')
    };
    return jwt.sign(claims, privateKey, {
        algorithm: 'RS256',
        keyid: "b8bbdf5e-fb0f-4754-a02d-e47219ae007a",
        header: { "jku": 'http://localhost:1337/.well-known/jwks.json' }
    });
}

const issueJWT = (req, res, next) => {
    if (!req.cookies.token) {
        const cookieOptions = {
            secure: false,
            httpOnly: true,
            sameSite: "Lax",
            expires: new Date(Date.now() + 3000000),
        }
        return res.cookie('token', createJWT(), cookieOptions).redirect('/')
    }
    next()
}

const verifyJWT = async (req, res, next) => {
    try {
        if (!req.cookies.token) {
            return send400(res, 'Missing JWT token');
        }

        //Let's see if the user is authenticated
        let decodedToken = jwt.decode(req.cookies.token, {complete: true});
        if (!decodedToken) {
            return send400(res, 'Malformed JWT token');
        }
        const {kid, jku} = decodedToken.header;
        if (!kid) {
            return send400(res, 'JWT Header is missing kid entry');
        }
        if (!jku) {
            return send400(res, 'JWT Header is missing jku entry');
        }

        const resp = await axios.get(jku);

        if (!resp.data.keys) {
            return send400(res, 'Invalid JWKs - \'keys\' JSON array is missing');
        }

        const publicKey = resp.data.keys.find((key) => key.kid === kid);

        if (!publicKey) {
            return send400(res, 'No public key was found with a given kid');
        }

        decodedToken = jwt.verify(req.cookies.token, jwktopem(publicKey), {algorithm: 'RS256'});

        req.tweeterID = decodedToken.tweeterID;
        req.hasInvitation = decodedToken.hasInvitation;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return send400(res, 'Invalid JWT signature');
        }

        return res.status(500).json({success: false, data: 'Unable to fetch JKU'});
    }
}

module.exports = {issueJWT, verifyJWT}
