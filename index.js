const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const ObjectId = require('mongodb').ObjectId;

const { DB_USER, DB_PASS, DB_NAME, PORT } = process.env;

const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.d5mpt.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload())

client.connect(err => {
    const servicesCollection = client.db(DB_NAME).collection('ourServices');
    const feedbacksCollection = client.db(DB_NAME).collection('usersFeedbacks');
    const ordersCollection = client.db(DB_NAME).collection('orders');
    const adminsCollection = client.db(DB_NAME).collection('admins');

    //root
    app.get('/', (req, res) => {
        res.send('<h1> Welcome to Volunteer Network Database</h1>');
    });


    //all services
    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, collection) => {
                res.send(collection)
            })
    });



    //all Feedbacks
    app.get('/feedbacks', (req, res) => {
        feedbacksCollection.find({})
            .toArray((err, collection) => {
                res.send(collection)
                if (err) {
                    console.log(err)
                }
            })
    });



    //all admins
    app.get('/admins', (req, res) => {
        adminsCollection.find({})
            .toArray((err, collection) => {
                res.send(collection)
                if (err) {
                    console.log(err)
                }
            })
    });



    //all ordersCollection
    app.get('/orders', (req, res) => {
        ordersCollection.find({})
            .toArray((err, collection) => {
                res.send(collection)
                if (err) {
                    console.log(err)
                }
            })
    });



    //user Orders 
    app.get('/users-orders', (req, res) => {
        const user = req.query.email;

        ordersCollection.find({ email: user })
            .toArray((err, collection) => {
                res.send(collection)
                if (err) {
                    console.log(err)
                }
            })
    })


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
                if (result.insertedCount > 0) {
                    res.sendStatus(200);
                }
            })
            .catch(err => console.log(err))
    });


    //user Feedbacks
    app.post('/add-feedback', (req, res) => {
        const feedback = req.body;

        feedbacksCollection.insertOne(feedback)
            .then(result => {
                if (result.insertedCount > 0) {
                    res.sendStatus(200);
                }
            })
            .catch(err => console.log(err))
    });

    //add orders by customer
    app.post('/add-orders', (req, res) => {
        const projectImg = req.files.projectImg;
        const type = projectImg.mimetype;
        const size = projectImg.size;
        const orderData = req.body;
        const imgData = projectImg.data;
        const encImg = imgData.toString('base64');

        const convertedImg = {
            contentType: type,
            size: parseFloat(size),
            img: Buffer.from(encImg, 'base64')
        };
        const readyData = { service: orderData.service, orderDescription: orderData.orderDescription, name: orderData.name, email: orderData.email, price: orderData.price, projectImg: convertedImg, thumbnailType: orderData.thumbnailType, thumbnailImg: orderData.thumbnailImg, serviceDescription: orderData.serviceDescription, state: false };

        ordersCollection.insertOne(readyData)
            .then(result => {
                if (result.insertedCount > 0) {
                    res.sendStatus(200);
                }
            })
            .catch(err => console.log(err))
    });


    //add admins
    app.post('/add-admin', (req, res) => {
        const admin = req.body;
        adminsCollection.insertOne(admin)
            .then(result => {
                if (result.insertedCount > 0) {
                    res.sendStatus(200);
                }
            })
            .catch(err => console.log(err))
    });

    //Update state of orders
    app.patch('/order-state/:id', (req, res) => {
        console.log(req.params.id, req.body)
        ordersCollection.updateOne({ _id: ObjectId(req.params.id) }, {
            $set: { state: req.body.state }
        })
            .then(result => {
                if (result.modifiedCount > 0) {
                    res.sendStatus(200);
                    res.send({ "state": `${req.body.state}` })
                }
            })
            .catch(err => console.log(err))
    });


    console.log(err ? err : "no error")
});

app.listen(process.env.PORT || 3100);