// store file that has functions that will process data

const knex = require('knex')(require('./knexfile'));
const crypto = require('crypto'); // to encrypt password

const accountSid = 'AC11fc5a6d3e18c8bbbd450936be91d01b';
const authKey = '28149a2a037854065a96ae8b30e4d2b4';
const client = require('twilio')(accountSid, authKey);//Log in to client account

module.exports = {
    createUser({email, password, phoneNum, name}){ // given a json with data
        console.log('Add user');

        const {salt, hash} = saltHashPassword({password}); // salt and hash password

        //return Promise.resolve(); // this is preliminary

        // insert data into database using Knex
        return knex('user').where('email', email)
            .then(([foundUser]) => {
                if(!foundUser) {
                    knex('user')
                        .insert({salt, encrypted_password: hash, email, phoneNum, name})
                        .then(([newId]) => {
                            //console.log(newId);
                        })
                        return {success: true};
                }
                else return {success: false};
        });
        
        
        // return knex('user').insert({
        //     salt,
        //     encrypted_password: hash,
        //     email,
        //     phoneNum,
        //     name
        // });
    },
    authenticate({email, password}){
        console.log('Authenticating user');

        //console.log(email);
        return knex('user').where('email', email)
           .then(([user]) => {
            if(!user) return { success: false};
            const {hash} = saltHashPassword({
                password,
                salt: user.salt
            })
            return {success: hash === user.encrypted_password}
        })
    },
    createPosts({title, price, user_id, description, picture}){
        //console.log(title + " " + price + " " + userID + " " + description + " " + picture);

        return knex('user_posts').insert({
            title,
            price,
            user_id,
            description,
            picture
        })
        .then(([anything]) => {
            let keyword = "%" + title + "%"; // looks for keyword in any point of string (% are wildcard char)
            return knex('wishlist').select('phoneNum').where('title', 'like', title).limit(1) // first one in the list, should be switched later
                .then(([wishListPhone]) => {
                        console.log(wishListPhone);
                        let temp = wishListPhone.phoneNum; // found.phoneNum is current List
                        console.log(temp);
                        //temp = "\"" + temp + "\"";
                        temp = JSON.parse(temp);
                        console.log(temp);
                        console.log(temp.numbers);
                        for(let i = 0; i<temp.numbers.length; i++){
                            let sendTo = "+1" + temp.numbers[i]; // send to Number
                            console.log(sendTo);
                            client.messages.create({//Create a new message from the client
                                to: sendTo, //Target number to receive message
                                from: '+19097571355',//Number from which the message will be sent(our Twilio number)
                                body: title + "\n" + description //Message contents
                             })//.then((message) => console.log(message.sid)) //Log message contents
                             
                            //  let now = Date.now()+5000;
                            //  while(Date.now()<now){}
                             
                        }
                })
            
        })
    },
    searchPosts({titleSearch}){
        let keyword = "%" + titleSearch + "%"; // looks for keyword in any point of string (% are wildcard char)
        //console.log(keyword);
        return knex('user_posts').where('title', 'like', keyword);
    },
    viewPost({post_id}){
        return knex('user_posts').where('id', post_id);
    },
    ownPosts({email}){
        // when email is equal to given email, join posts with email to return users posts
        return knex('user').where('email', email).innerJoin('user_posts', 'user.email', 'user_posts.user_id');
    },
    // if no posts are found use email to find phone #
    // create a wishlist item and store phone #
    // or if already created, update wishlist
    noPosts({email, title}){
        //let phoneNum = knex.select('phoneNum').from('user').whereRaw('email =?', email).limit(1);// .select('phoneNum').where('email', email);

        // select phoneNum from agora.user where email = "email";

        //console.log(phoneNum);

        return knex('wishlist').where('title', title)
            .then(([found]) => {
                if(!found) {
                    return knex('user').select('phoneNum').whereRaw('email =?', email).limit(1) // get the phone# for the user
                    .then(([foundCell]) => { // foundCell is what is returned from the select method
                        let phoneNum = foundCell.phoneNum; // access phoneNum from found Cell
                        const phoneJSON = JSON.stringify({numbers: [phoneNum]});
                        phoneNum = phoneJSON; // .toString(); // set phoneNum = to JSON in String Format
                        //console.log(phoneNum);
                        knex('wishlist').insert({title, phoneNum})
                        .then(([newId]) => {
                            //console.log(newId);
                        })
                        return {success: true};
                    })
                }
                else{ 
                    return knex('user').select('phoneNum').whereRaw('email =?', email).limit(1) // get the phone# for the user
                    .then(([foundCell]) => { // foundCell is what is returned from the select method
                        console.log(foundCell.phoneNum);
                        let phoneNumNew = foundCell.phoneNum;
                        
                        //let phoneNumNew = JSON.parse(foundCell.phoneNum); // access phoneNum JSON from found Cell
                        //phoneNumNew = phoneNumNew.numbers;
                        console.log("NEW PHONE # " + phoneNumNew);
                        let temp = found.phoneNum; // found.phoneNum is current List
                       
                        //temp = "\'" + temp + "\'";
                        //console.log(temp);
                        //temp = temp.numbers;
                        //console.log(temp);
                        let notJSON = JSON.parse(temp);
                        console.log("OLD LIST " + notJSON.numbers);
                        notJSON.numbers.push(phoneNumNew);
                        console.log(notJSON.numbers);
                        let phoneNum = notJSON.numbers;
                        console.log(phoneNum);

                        const phoneJSON = JSON.stringify({numbers: phoneNum});
                        phoneNum = phoneJSON;
                        console.log(phoneNum);


                        //const phoneJSON = JSON.stringify({numbers: [phoneNum]});
                        //phoneNum = phoneJSON; // .toString(); // set phoneNum = to JSON in String Format
                        //console.log(phoneNum);
                        return knex('wishlist').whereRaw('title =?', title).limit(1)
                             .update({
                                 phoneNum

                             })
                            //  .then(([anything]) => {
                            //      //console.log(newId);
                            //  })
                            //knex('wishlist').insert({title, phoneNum})
                        //  .then(([newId]) => {
                        //      //console.log(newId);
                        //  })
                        //return {success: true};
                    })
                    
                }
        });
    },
    // contact Seller through SMS when buyer presses button
    contactSeller({post_id, buyer_email}){
        let buyerPhone = knex('user').select('phoneNum').whereRaw('email =?', buyer_email).limit(1);
        let title = knex('user_posts').select('title').where('id', post_id).limit(1);

        //return knex('user').select('phoneNum').whereRaw('email =?', email).limit(1)

        //console.log("Buyer Phone"+buyerPhone.phoneNum);
        return knex('user_posts').select('user_id').whereRaw('id =?', post_id).limit(1)
        .then(([sellerEmail]) => { // foundCell is what is returned from the select method
        // when email is equal to given email, join posts with email to return users posts
            console.log("Seller Email " + sellerEmail.user_id);
            return knex('user').select('phoneNum').where('email', sellerEmail.user_id)
                .then(([sellerPhone]) => {
                    return knex('user').select('phoneNum').where('email', buyer_email).limit(1)
                        .then(([buyerPhone]) => {
                            return knex('user_posts').select('title').whereRaw('id =?', post_id).limit(1)
                                .then(([title]) => {
                                    console.log(sellerPhone.phoneNum);
                                    let sendTo = sellerPhone.phoneNum;
                                    client.messages.create({//Create a new message from the client
                                        to: "+1"+ sendTo, //Target number to receive message
                                        from: '+19097571355',//Number from which the message will be sent(our Twilio number)
                                        //body: "A customer is interested in your post: "+"\nFrom: "
                                        body: "A customer is interested in your post: "+ title.title + "\nFrom: " + buyerPhone.phoneNum //Message contents
                                    })
                                })
                            
                        })
                    
                })
        })



    }
}

// salt and hash password function
function saltHashPassword({password, salt = randomString()}){
    const hash = crypto.createHmac('sha512', salt).update(password);
    return {
        salt,
        hash: hash.digest('hex')
    }
}

// creates a random string
function randomString(){
    return crypto.randomBytes(4).toString('hex');
}
