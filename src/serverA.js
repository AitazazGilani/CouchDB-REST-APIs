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

// Get a list of all documents in the database
posts.list((err, body) => {
    if (err) {
      console.log(err)
    } else {
      console.log(body.rows)
    }
  })


  
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);