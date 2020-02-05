const express = require('express');
const router = express.Router();

//@access   Public
//@route    GET api/posts
//@Desc     Route the flow
router.get('/', (req, res) => req.send("Post Route"));

//To restrict the authenticatio create middleware

module.exports = router;