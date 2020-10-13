const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');

const { DB_USER, DB_PASS, DB_NAME, PORT, DB_SERVICES_COLLECTION } = process.env;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.d5mpt.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload())

client.connect(err => {
    const servicesCollection = client.db(DB_NAME).collection(DB_SERVICES_COLLECTION);

    //root
    app.get('/', (req, res) => {
        res.send('Welcome to Creative Agency`s Database')
    });




    //add services
    app.post('/add-services', (req, res) => {
        const icon = req.files.icon;
        const iconType = icon.mimetype;
        const iconSize = icon.size;
        const serviceData = req.body;
        const iconData = icon.data;
        const encIcon = iconData.toString('base64');

        const convertedIcon = {
            contentType: iconType,
            size: parseFloat(iconSize),
            img: Buffer.from(encIcon, 'base64')
        };
        const readyData = { title: serviceData.title, description: serviceData.description, icon: convertedIcon }

        servicesCollection.insertOne(readyData)
            .then(result => {
                if (result.success) {
                    res.sendStatus(200);
                    console.log('Posted Successfully')
                }
            })
            .catch(err => console.log(err))

    });

    console.log('connected successfully')
});




app.listen(3100);