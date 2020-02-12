const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

//@access   Private
//@route    POST api/post
//@Desc     Create a post
router.post('/', [
    auth, [
        check('text', 'Text is Required').not().isEmpty()
      ]
    ] ,
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()});
        }
        try{
            const user = await User.findById(req.user.id).select('-password');

            // Creating Post
            const newPost = new Post({
                text: req.body.text,
                user: req.user.id,
                name: user.name,
                avatar: user.avatar
            });

            const post = await newPost.save();

            // Send the post as JSON
            res.json(post);

        }catch(err){
            res.status(500).send('Server Error');
        }

        console.log(profileFields.skills);
        res.send('Hello');
    }
);


//@access   Private
//@route    GET api/posts
//@Desc     Retrieve All Posts
router.get('/',
    async (req, res) =>{
        try {
            // To sort posts by recent,set negative date
            const posts = await Post.find().sort({ date: -1});
            res.json(posts);
        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error');
        }
    }
);

//@access   Private
//@route    GET api/posts/:id
//@Desc     Retrieve all Posts of its ID
router.get('/:id',
    async (req, res) =>{
        try {
            const post = await Post.findById(req.params.id);
            
            if(!post)
                return res.status(400).json({msg: "Post Not found"});
            
            res.json(post);
        } catch (err) {
            console.log(err.message);

            // err.kind property let us display error if objectId is invalid format
            if(err.kind == 'ObjectId')
                return res.status(400).json({msg: "Post Not found"});

            res.status(500).send('Server Error');
        }
    }
);

//@access   Private
//@route    DELETE api/posts/:id
//@Desc     Delete a post
router.delete('/:id', auth,async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        if(!post)
            return res.status(400).json({msg: "Post Not found"});
            

        if(post.user.toString() !== req.user.id){
            res.status(401).json({msg: 'User not Authorized'});
        }

        // Remove the Post
        await post.remove();

        res.json({msg: "Post deleted gracefully"});
    }catch(err){
        console.log(err);
        if(err.kind == 'ObjectId')
            return res.status(400).json({msg: "Profile Not found"});
    }
});

//@access   Private
//@route    PUT api/posts/like/:id
//@Desc     Add Like to Post
router.put('/like/:id', auth, 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors){
            return res.status(400).json({errors: errors.array() });
        }

        const {title, company, location, from,to, current, description} = req.body;
        const newExp = {title, company, location, from,to, current, description};
        // Notice: We dont use title: title

        try {
            const post = await Post.findById(req.params.id);

            // filter returns something only if successfull
            if(post.likes.filter(like=> like.user.toString()===req.user.id) > 0){
                return res.status(400).json({msg: 'Post aleadry Liked'});
            }
            // Similar to push but push into begin instead of end
            post.likes.unshift({user: req.user.id});

            // We only need to save it
            await post.save();

            // return all likes
            res.json(post.likes);

        } catch (err) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }
    }
);

//@access   Private
//@route    PUT api/posts/unlike/:id
//@Desc     Add UnLike to Post
router.put('/unlike/:id', auth, 
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors){
            return res.status(400).json({errors: errors.array() });
        }

        const {title, company, location, from,to, current, description} = req.body;
        const newExp = {title, company, location, from,to, current, description};
        // Notice: We dont use title: title

        try {
            const post = await Post.findById(req.params.id);

            // filter returns something only if successfull
            // proceed only if there is no like by same user himself
            if(post.likes.filter(like=> like.user.toString()===req.user.id) === 0){
                return res.status(400).json({msg: 'Post has not been Liked'});
            }
            
            // Similar to Profile experience remove, create index
            const removeIndex = post.likes.map(like=> like.user.toString()).indexOf(req.user.id);
            
            // Splice the array of likes
            post.likes.splice(removeIndex, 1);

            // We only need to save it
            await post.save();

            // return all likes
            res.json(post.likes);

        } catch (err) {
            console.log(error.message);
            res.status(500).send('Server Error');
        }
    }
);

// Adding Comment to a post
// Comments do not have like
//@access   Private
//@route    POST api/posts/comment/:id
//@Desc     Comet on post
router.post('/comment/:id', [
    auth, [
        check('text', 'Text is Required').not().isEmpty()
      ]
    ] ,
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array()});
        }
        try{
            const user = await User.findById(req.user.id).select('-password');

            //Get post
            const post = await Post.findById(req.params.id);

            // Creating Post
            // Since it is not a collection in DB, so jsut curly braces
            const newComment = {
                text: req.body.text,
                user: req.user.id,
                name: user.name,
                avatar: user.avatar
            };

            post.comments.unshift(newComment);

            // No nedd to get object
            await post.save();

            // Send the post as JSON
            res.json(post.comments);

        }catch(err){
            res.status(500).send('Server Error');
        }

        console.log(profileFields.skills);
        res.send('Hello');
    }
);

//@access   Private
//@route    DELETE api/posts/comments/:id/:comment_id
//@Desc     Delete a comment on post
router.delete('/comments/:id/:comment_id', auth,async (req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        const comment = post.comments.find(comment=> comment.id === req.params.comment_id);

        if(!comment)
            return res.status(400).json({msg: "Comment Not found"});
            

        if(cooment.user.toString() !== req.user.id){
            res.status(401).json({msg: 'User not Authorized'});
        }

        const removeIndex = post.comments.map(comment=> comment.user.toString()).indexOf(req.user.id);
            
        // Splice the array of likes
        post.comments.splice(removeIndex, 1);

        // We only need to save it
        await post.save();

        // return all likes
        res.json(post.comments);
        // Remove the Post
        await post.remove();

        res.json({msg: "Post deleted gracefully"});
    }catch(err){
        console.log(err);
        if(err.kind == 'ObjectId')
            return res.status(400).json({msg: "Profile Not found"});
    }
});

module.exports = router;