const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const cors = require('cors');
require('dotenv').config();
const objectId = require('mongodb').ObjectId;
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5099;


app.use(cors());
app.use(express.json());
app.use(fileUpload());



const uri = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.m62xz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travelex');
        const usersCollection = database.collection('users');


        //Add Blog 
        app.post('/blogs', async (req, res) => {
            console.log('body', req.body);
            console.log(req.files)
            res.json('done');
        })



        //Users API
        app.post('/users', async (req, res) => {
            const email = req.body.email;
            const name = req.body.displayName;
            const user = {
                name,
                email,
                isAdmin: false
            }
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });


        app.put('/users', async (req, res) => {
            const user = { ...req.body, isAdmin: false };
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });



    }
    finally {

    }
}


run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
});

//31EVVnpcV2lQjU8K
//foodadmin
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
