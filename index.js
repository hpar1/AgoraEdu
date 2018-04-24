/*
*	CitrusHack 2018 March 21-22
*/

const express = require('express');
const bodyParser = require('body-parser');

const store = require('./store');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());

// create user request
app.post('/createUser', (req, res) => {
    //console.log(req.body.email);
    // send data to store.js createUser function
    store.createUser({
        email: req.body.email,
        password: req.body.password,
        phoneNum: req.body.phone,
        name: req.body.name
    })
    .then(({success}) => {
        if(success) res.send({success: 'Success!'});
        else res.send({success: 'Failed'});
    })
      //.then(() => res.send({success: 'Success!'}))// res.sendStatus(200)); // 200 is success
});

// login authentication request
app.post('/login', (req, res) => {
    //console.log(req.body.email + "    " + req.body.password)
    store.authenticate({
        email: req.body.email,
        password: req.body.password
    })
    .then(({success}) => {
        if(success) res.send({success: 'Success!'});
        else res.send({success: 'Failed'});
    })
})

// create user posts
app.post('/createPosts', (req, res) => {
    // console.log(user_id);
    store.createPosts({
        title: req.body.title,
        price: req.body.price,
        user_id: req.body.email,
        description: req.body.description,
        picture: req.body.uri
        
    })
    .then(() => res.send({success: 'Success!'}))
    // .then(({success}) => {
    //     if(success) res.send({success: 'Success!'});
    //     else res.send({success: 'Failed'});
    // })
})

// search through posts
app.post('/searchPosts', (req, res) => {
    store.searchPosts({
        titleSearch: req.body.searchTerm
    })
    .then(data => {
    //    console.log(data); // send data to console to verify
        res.send(data); // send data back to frontend
    })
})

// send back one post to view
app.post('/viewPost', (req, res) => {
    store.viewPost({
        post_id: req.body.id
    })
    .then(data => {
        res.send(data);
    })
})

// user sees their current posts
app.post('/viewOwnPosts', (req, res) => {
    store.ownPosts({
        email: req.body.email
    })
    .then(data => {
        res.send(data);
    })
})

// if no posts are found wishlist option is available
// add user to wishlist
app.post('/noPostsFound', (req, res) => {
    store.noPosts({
        email: req.body.email,
        title: req.body.title
    })
    .then(() => res.send({success: 'Success!'}))
    // .then(({success}) => {
    //     if(success) res.send({success: 'Success!'});
    //     else res.send({success: 'Failed'});
    // })
})

// contact seller button
app.post('/contactSeller', (req, res) =>{
    store.contactSeller({
        post_id: req.body.ID,
        buyer_email: req.body.email
    })
    .then(() => res.send({success: 'Success!'}))
})

// // upload single photo TEST
// app.post('/single', upload.single('photo'), function (req, res, next) {
//     // req.file is the `avatar` file
//     // req.body will hold the text fields, if there were any
//     console.log(req.body)
//     console.log(req.file)
//     res.status(201).send('success')
// })

app.listen(3000, () => console.log('App listening on port 3000!'));