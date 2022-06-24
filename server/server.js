const express = require('express');
const app = express();
const {MongoClient} = require('mongodb');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = 'mongodb+srv://KalleBlomkvist:dd09d84cc1b211ec9d640242ac120002@cluster0.wxbhy.mongodb.net/?retryWrites=true&w=majority';

let lastChange = {}; 

app.get('/:listId', async (req, res) => {
    res.status(200).json(lastChange[req.params.listId]); 
})

app.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const client = new MongoClient(uri); 
    await client.connect();
    try {
        let existingUser = await client.db('todolist').collection('todolist').findOne({ username: username });
        if (existingUser) res.status(200).json({result: 0}); 
        else {
            await client.db('todolist').collection('todolist').insertOne({ username: username , password: password});
            res.status(200).json({result: 1}); 
        }
    }
    catch (e) { console.log(e); res.status(500).json({ error: '500' });} 
    await client.close();
})

app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const client = new MongoClient(uri); 
    await client.connect();
    try {
        let existingUser = await client.db('todolist').collection('todolist').findOne({ username: username, password : password });
        if (existingUser) {
            if (existingUser.allLists) res.status(200).json(existingUser.allLists); 
            else res.status(200).json({}); 
        }
        else res.status(200).json({result: 0}); 
    }
    catch (e) { console.log(e); res.status(500).json();} 
    await client.close();
})

app.post('/saveByUsername/:username', async (req, res) => {
    const username = req.params.username;
    const client = new MongoClient(uri); 
    await client.db('todolist').collection('todolist').updateOne({
        username: username
    }, {
        $set: {
            allLists: req.body.allLists
        }
    })
    res.status(200).json(); 
    await client.close();
})

app.post('/saveByListId/:listId', async (req, res) => {
    const listId = req.params.listId; 
    const client = new MongoClient(uri); 
    await client.db('todolist').collection('listsById').updateOne({listId : listId}, {
        $set: {
            owner: req.body.owner,
            items: req.body.items
        }
    }, {upsert: true}) 
    lastChange[listId] = req.body;
    res.status(200).json(); 
    await client.close();
}) 

app.delete('/saveByListId/:listId', async (req, res) => {
    const listId = req.params.listId; 
    const client = new MongoClient(uri); 
    await client.db('todolist').collection('listsById').deleteOne({listId : listId});
    delete lastChange[listId]; 
    res.status(200).json(); 
    await client.close();
})

 
const PORT = 5000;
app.listen(PORT, console.log(` Server running on port ${PORT}`))