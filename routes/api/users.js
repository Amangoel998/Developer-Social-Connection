const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const config = require('config');

const router = express.Router();

const check = require('express-validator').check;

//@access   Public
//@route    GET api/users
//@Desc     Route the flow
//router.get('/', (req, res) => req.send("User Route"));

//@access   Public
//@route    POST api/users
//@Desc     Register User
//router.post('/', (req, res) => req.send("User Route"));

// To add validation

// Get Object Model
const User = require('../../models/User');

router.post( '/',
    [
    check('name', 'Name is required').not().isEmpty(),
    check('password', 'Password Required').isLength({min: 6}),
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

        //req.send("User Route")
        
        // Now to make Mongoose Query

        // One Way is then and Catch
        // User.findOne().then()...etc

        // 2nd Way is to use sync and wait
        // Make the above anonymous function async
        try{
            // I : See if user exists

            //Pass parameter to search
            let user = await User.findOne({email});
            if(user){
                return res.status(400).json( { errors: [{msg : 'User Already Exists'}] } );
            }

            // II : Get the gravatar

            const avatar = gravatar.url(email, {
                size: '200',
                rating: 'pg',
                default: 'mm'
            })

            user = new User({
                name, email, avatar, password
            })
            
            // III : Encrypt Password

            // 10 is the rounds(recommended)
            // More for more secure but time consuming
            const salt = await bcrypt.genSalt();

            user.password = await bcrypt.hash(password, salt);

            // Now save the object 
            await user.save();

            // IV : Use JWTokens
            const payload = {
                user: {
                    id: user.id
                }
            };
            // Put secret int o default.json and get require('config')
            //Use 3600
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

//To restrict the authentication create middleware

module.exports = router;