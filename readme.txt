Assignment 5, CMPT353
Aitazaz Gilani
shg374, 11277321

File structure:
    src/ : contains serverA.js, serverB.JSON
    public/: contains the html pages for serverA and serverB demonstration
    database/ : contains couchdb

docker containers:
    serverA: for running part A of the assignment, REST Level 2, ports: 80:8080
    serverB: for running part B of the assignment, REST Level 3, ports: 81:8080
    cdb1: couchdb container, ports: 5984:5984


########################
Steps to run the project
########################

initialize node_modules:
    $ npm init -y
    $ npm install express body-parser nano

Create the folders database/couchdb

To run docker:
    $ docker-compose up -d

to run serverA:
    $ docker attach serverA
    # cd code/src
    # node serverA.js
    go to http://localhost:80/TestRestLevel2.html

to run serverB:
    $ docker attach serverB
    # cd code/src
    # node serverB.js
    go to http://localhost:81/TestRestLevel3.html

make sure all containers are running and make sure the folder database/couchdb/ has been created under the project