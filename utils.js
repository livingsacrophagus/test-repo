const send400 = (res, message) => {
    return res.status(400).json({success: false, data: message});
}

module.exports = { send400 }