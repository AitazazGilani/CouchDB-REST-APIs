'use strict';

// load package
const express = require('express');
const app = express();

const bodyParser = require("body-parser");
app.use( bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 8080;
const HOST = '0.0.0.0';

//load couchdb
var nano = require('nano')('http://admin:admin@couchdb1:5984');
var posts = nano.use('postsdb');
var comments = nano.use('commentsdb');


// Create a new post
app.post('/posts', (req, res) => {
    const newPost = {
        PostTopic: req.body.Topic,
        PostData: req.body.PostData
      };
    
      const resJSON = 
      {
        post: [],
        getComments: {verb:'GET', route: '/posts/:id/comments'},
        getAllPosts: {verb:'GET',route: '/posts'}
      }
  
    // Check if the required fields are present
    if (!newPost.PostTopic || !newPost.PostData ) {
      return res.status(400).json({ error: 'Topic and PostData are required fields' });
    }

    // Save the new post to the database
    posts.insert(newPost, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create post' });
      }
  
      newPost.postID = result.id;
      resJSON.post = newPost
      res.status(201).json(resJSON);
    });
  });
  
//lists all the posts
app.get('/posts', function (req, res) {
  posts.list({ include_docs: true },function(err, result) {
      if (err) {
          return res.status(500).send('Error getting posts');
        }
        const allPosts = result.rows.map(row => row.doc);
        res.status(200).json(allPosts);
  });
});



// GET a specific post by ID
app.get('/posts/:id', async (req, res) => {
  const id = req.params.id;
  const resJSON = 
  {
    postID: req.params.id,
    post: [],
    getComments: {verb:'GET', route: '/posts/:id/comments'},
    getAllPosts: {verb:'GET',route: '/posts'}
  }
  try {
    const post = await posts.get(id);
    resJSON.post = post
    res.status(200).json(resJSON);
  } catch (err) {
    if (err.statusCode === 404) {
      res.status(404).json({ message: 'Post not found' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});

//GET all comments for all posts
app.get('/comments', function (req, res) {
  comments.list({ include_docs: true },function(err, result) {
      if(err){
          return res.status(500).send('Error getting comments');
      }
      const allComments = result.rows.map(row => row.doc);
      res.status(200).json(allComments);
  });
});

//POST a new comment for a specific post
app.post('/posts/:id/comments', async (req, res) => {
    const newComment = {
      commentText: req.body.commentText
    };
    newComment.postID = req.params.id;

    const resJSON = 
    {
      postID: req.params.id,
      comment: [],
      getAllComments: {verb:'GET', route: '/posts/:id/comments'},
      getPost: {verb:'GET',route: '/posts/:id'}
    }

  try {
    const response = await comments.insert(newComment);
    resJSON.comment = newComment
    res.status(201).json(resJSON);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//GET all comments for a specific post
app.get('/posts/:id/comments', async (req, res) => {
  const id = req.params.id;
  const resJSON = 
  {
    postID: req.params.id,
    comments: [],
    addComment: {verb:'POST', route: '/posts/:id/comments'},
    getPost: {verb:'GET',route: '/posts/:id'}
  }
  try {
    const allComments = await comments.list({ include_docs: true });
    const commentsForPost = allComments.rows.filter(row => row.doc.postID === id).map(row => row.doc);
    resJSON.comments = commentsForPost;
    res.status(200).json(resJSON);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



app.use(express.static('../public'));
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);