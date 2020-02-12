const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

//@access   Private
//@route    GET api/profile/me
//@Desc     Route the flow
router.get('/me', auth,async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate(
            'user',
            ['name', 'avatar']
        );
        if(!profile){
            return res.status(400).json({ msg: 'No Profile for this user'});
        }
        res.json(profile);
    }catch(err){
        console.log(err);
    }
});

//@access   Private
//@route    POST api/profile
//@Desc     Create or Update a use profile
router.post('/', [
    auth, [
        check('status', 'Status is Required').not().isEmpty(),
        check('skills', 'Sklls are Required').not().isEmpty()
      ]
    ] ,
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(401).json({ errors: errors.array()});
        }
        const {
            company,
            location,
            website,
            status,
            bio,
            skills,
            githubusername,
            youtube,
            twitter,
            facebook,
            linkedin
        } = req.body;

        // Build Profile Object
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(githubusername) profileFields.githubusername = githubusername;
        if(status) profileFields.status = status;
        if(skills){
            // Here is map func to remove extra spaces for each skill
            profileFields.skills = skills.split(',').map(skill=>skill.trim());
        }

        // First set the social to an object
        profileFields.social = {};

        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(facebook) profileFields.social.facebook = facebook;
        if(linkedin) profileFields.social.linkedin = linkedin;

        // Now actually Insert and Update data
        try{
            // user retuens and ID which can be compared
            let profile = await Profile.findOne({user: req.user.id});
            // Since we use sync & await, we need to add await for mongoose func
            // As it returns a promise
            if(profile){
                profile = await Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields},
                    {new : true}
                );
                return res.json(profile);
            }

            // Create New One
            profile = new Profile(profileFields);
            await profile.save();

            return res.json(profile);

        }catch(err){
            res.status(500).send('Server Error');
        }

        console.log(profileFields.skills);
        res.send('Hello');
    }
);


//@access   Public
//@route    GET api/profile
//@Desc     Retrieve All Profiles
router.get('/',
    async (req, res) =>{
        try {
            const profile = await Profile.find().populate('user', ['name', 'avatar']);
            res.json(profile);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//@access   Public
//@route    GET api/profile/user/:user_id
//@Desc     Retrieve a Profile by UserID
router.get('/user/:user_id',
    async (req, res) =>{
        try {
            const profile = await Profile.findOne({
                user: req.params.user_id
            }).populate('user', ['name', 'avatar']);
            if(!profile)
                return res.status(400).json({msg: "Profile Not found"});
            res.json(profile);
        } catch (err) {
            console.log(err.message);
            // err.king property let us display error if objectId is invalid format
            if(err.kind == 'ObjectId')
                return res.status(400).json({msg: "Profile Not found"});
            res.status(500).send('Server Error');
        }
    }
);

//@access   Private
//@route    DELETE api/profile
//@Desc     Delete profile, user & posts
router.delete('/me', auth,async (req, res) => {
    try{
        // Remove Profile
        await Profile.findOneAndRemove({user: req.user.id});
        // Remove User
        await User.findOneAndRemove({_id: req.user.id});
        if(!profile){
            return res.status(400).json({ msg: 'No Profile for this user'});
        }
        res.json({msg: "User and Profile deleted"});
    }catch(err){
        console.log(err);
    }
});

//@access   Private
//@route    PUT api/profile/experience
//@Desc     Add Profile experience
router.put('/experience', [
    auth, [
        check('title', 'Title is Required').not().isEmpty(),
        check('company', 'Company is Required').not().isEmpty(),
        check('from', 'From Date is Required').not().isEmpty()
      ]
    ] ,
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors){
            return res.status(400).json({errors: errors.array() });
        }

        const {title, company, location, from,to, current, description} = req.body;
        const newExp = {title, company, location, from,to, current, description};
        // Notice: We dont use title: title

        try {
            const profile = await Profile.findOne({ user: req.user.id});

            // Similar to push but oush into begin instead of end
            profile.experience.unshift(newExp);
            await profile.save();

            res.json(profile);

        } catch (err) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }
    }
);
//@access   Private
//@route    DELETE api/profile/experience/:exp_id
//@Desc     Delete a Profile experience
router.delete('/experience/:exp_id', async (req, res) => {
       
    try {
        const profile = await Profile.findOne({ user: req.user.id});

        const removeIndex = profile.experience.map(item=>item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);
        
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
    }
);
//@access   Private
//@route    PUT api/profile/education
//@Desc     Add Profile education
router.put('/education', [
    auth, [
        check('fieldofstudy', 'Field of Study is Required').not().isEmpty(),
        check('school', 'School is Required').not().isEmpty(),
        check('degree', 'Degree is Required').not().isEmpty(),
        check('from', 'From Date is Required').not().isEmpty()
      ]
    ] ,
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors){
            return res.status(400).json({errors: errors.array() });
        }

        const {school, degree, fieldofstudy, from, to, current, description} = req.body;
        const newEdu = {school, degree, fieldofstudy, from,to, current, description};
        // Notice: We dont use title: title

        try {
            const profile = await Profile.findOne({ user: req.user.id});

            // Similar to push but oush into begin instead of end
            profile.education.unshift(newdu);
            await profile.save();

            res.json(profile);

        } catch (err) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }
    }
);
//@access   Private
//@route    DELETE api/profile/education/:exp_id
//@Desc     Delete a Profile education
router.delete('/education/:edu_id', async (req, res) => {
       
    try {
        const profile = await Profile.findOne({ user: req.user.id});

        const removeIndex = profile.education.map(item=>item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);
        
        await profile.save();

        res.json(profile);

    } catch (err) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
    }
);

//@access   Public
//@route    GET api/profile/github/:username
//@Desc     Get user github repository
router.get('/github/:username', async (req, res) => {
    // import request from request
    // import config from config
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created: asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubClientSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node.js'}
        };
        request(options, (error, response, body)=>{
            if(error) console.log(error.message);

            if(response.statusCode !== 200)
                return  res.status(404).json({msg: 'No github profile Found'});
            
            res.json(JSON.parse(body));
        })


        res.json(profile);

    } catch (err) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
    }
);

module.exports = router;