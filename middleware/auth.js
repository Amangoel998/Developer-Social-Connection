const jwt = require('jsonwebtoken');
const config = require('config');


// next is used to move to next peice of middleware
module.exports = function(req, res, next){
    // Get toekn from header
    const token = req.header('x-auth-token');
    if (!token)
        res.status(401).json({msg: 'No token, authorization Denied'});
    
    // Verify
    try{
        const payload = jwt.verify(token, config.get('jwtKey'));
        req.user = payload.user
        // To move to nex middleware
        next();
    }catch(err){
        res.status(401).json({ msg : 'Token not valid or expired' });
    }
}