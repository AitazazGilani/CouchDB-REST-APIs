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
  
    // Check if the required fields are present
    if (!newPost.PostTopic || !newPost.PostData ) {
      return res.status(400).json({ error: 'Topic and PostData are required fields' });
    }
  
    // Generate a new ID for the post
    const postID = `post-${Date.now()}`;
    
    // Save the new post to the database
    posts.insert(newPost, (err, body) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to create post' });
      }
  
      newPost.postID = postID;
      res.status(201).json(newPost);
    });
  });
  
  // Get all posts
  app.get('/posts', (req, res) => {
    // Use the "all-posts" view to get all posts
    posts.view('posts', 'all-posts', (err, body) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to get posts' });
      }
  
      // Return all posts
      return res.json(body.rows.map((row) => row.value));
    });
  });
  


app.use(express.static('../public'));
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);