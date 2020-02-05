const express = require('express');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const check = require('express-validator').check;
const router = express.Router();

//@access   Public
//@route    GET api/auth
//@Desc     Route the flow
//router.get('/', (req, res) => req.send("Auth Route"));
//router.get('/', auth, (req, res) => req.send("Auth Route"));

router.get('/', auth, async (req, res) => {
    try{
        const user = User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@access   Public
//@route    POST api/auth
//@Desc     Authenticate user
router.post( '/',
    [
    // Remove check name and replace isLength to exists
    check('password', 'Password is Required').exists(),
    check('email', 'Email is required').isEmail()
    ], 
    // To use Sync and wait mark this function as async
    async(req, res) => {
        console.log(req.body);
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {name, password, email} = req.body;

        try{
            let user = await User.findOne({email});
            if(!user){
                // User Doesn't Exists
                // Ideally put both responses same as It can show if user exists or not
                return res.status(400).json( { errors: [{msg : 'Invalid Creadentials'}] } );
            }

            // Check Password
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch){
                // Password is Wrong
                // Ideally put both responses same as It can show if user exists or not
                return res.status(400).json( { errors: [{msg : 'Invalid Creadentials'}] } );
            }

            const payload = {
                user: {
                    id: user.id
                }
            };
            // Put secret in default.json and get require('config')
            // Use 3600 ideally
            jwt.sign(
                payload,
                config.get('jwtKey'),
                {expiresIn: 360000},
                (err, token) => {
                    if(err) throw err;
                    return res.json({ token });
                }
            )

            // res.send('User Registration Completed');

        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);
module.exports = router;