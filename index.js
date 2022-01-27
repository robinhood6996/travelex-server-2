const express = require('express');
const fileUpload = require("express-fileupload");
const app = express();
const cors = require('cors');
require('dotenv').config();
const objectId = require('mongodb').ObjectId;
const { MongoClient, ObjectId } = require('mongodb');
const port = process.env.PORT || 5099;

app.use(fileUpload());
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.ADMIN}:${process.env.PASSWORD}@cluster0.m62xz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travelex');
        const usersCollection = database.collection('users');
        const blogCollection = database.collection('blogs');


        //Add Blog 
        app.post('/blogs', async (req, res) => {
            const blog = req.body;
            blog['status'] = 'Pending';
            const result = await blogCollection.insertOne(blog);
            res.json(result);
        });


        //Get Blogs
        app.get('/blogs', async (req, res) => {
            const cursor = blogCollection.find({});
            const blogs = await cursor.toArray();
            res.json(blogs);
        });

        //Get SIngle Blog
        app.get('/blog/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) }
            const result = await blogCollection.findOne(query);
            res.json(result);
        });

        //Delete Blog
        app.delete('/blog/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
            res.json(result);
        });

        //Update Blog Status
        app.put('/blog/status/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body.status;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: data
                }
            };
            const result = await blogCollection.updateOne(filter, updateDoc);
            res.send(result);
        })



        //Users API
        app.post('/users', async (req, res) => {
            const email = req.body.email;
            const name = req.body.displayName;
            const user = {
                name,
                email,
            }
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        //Put User if Exist or Not
        app.put('/users', async (req, res) => {
            const user = { ...req.body, isAdmin: false };
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        // Admin check
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
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
