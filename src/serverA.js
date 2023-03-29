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

// Get a list of all posts in the database
posts.list((err, body) => {
    if (err) {
      console.log(err)
    } else {
      console.log(body.rows)
    }
  })


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

//lists all the comments
app.get('/comments', function (req, res) {
    comments.list({ include_docs: true },function(err, result) {
        if(err){
            return res.status(500).send('Error getting comments');
        }
        const allComments = result.rows.map(row => row.doc);
        res.status(200).json(allComments);
    });
});


//add ID
// Create a new post
app.post('/posts', (req, res) => {
    const newPost = {
      PostTopic: req.body.Topic,
      PostData: req.body.PostData
    };
    posts.insert(newPost, (err, result) => {
      if (err) {
        return res.status(500).send('Error creating post');
      }
      newPost.postID = result.id;
      res.status(201).json(newPost);
    });
});


// Create a new comment
app.post('/comments', (req, res) => {
    const newComment = {
        postID: req.body.postID,
        commentText: req.body.commentText
    };
    comments.insert(newComment, (err, result) => {
      if (err) {
        return res.status(500).send('Error creating comment');
      }
      newComment.commentID = result.id;
      res.status(201).json(newComment);
    });
});



app.use(express.static('../public'));
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);