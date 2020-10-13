const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');

const { DB_USER, DB_PASS, DB_NAME, PORT, DB_SERVICES_COLLECTION } = process.env;

const uri = `mongodb+srv://creativeUser:creativePassword@cluster0.d5mpt.mongodb.net/creativeAgencyDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload())

client.connect(err => {
    const servicesCollection = client.db('creativeAgencyDatabase').collection('ourServices');
    const feedbacksCollection = client.db('creativeAgencyDatabase').collection('usersFeedbacks');
    const ordersCollection = client.db('creativeAgencyDatabase').collection('orders');

    //all services
    app.get('/services', (req, res) => {
        servicesCollection.find({})
            .toArray((err, collection) => {
                res.send(collection)
            })
    })


    //all Feedbacks
    app.get('/feedbacks', (req, res) => {
        feedbacksCollection.find({})
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
                if (result.success) {
                    res.sendStatus(200);
                    console.log('Posted Successfully')
                }
            })
            .catch(err => console.log(err))
    });


    //user Feedbacks
    app.post('/add-feedback', (req, res) => {
        const feedback = req.body;

        feedbacksCollection.insertOne(feedback)
            .then(result => {
                if (result.success) {
                    res.sendStatus(200);
                    console.log('Posted Successfully')
                }
            })
            .catch(err => console.log(err))
    })

    console.log(err ? err : "no error")
});



//add orders by customer
app.post('/add-orders', (req, res) => {
    const order = req.body;

    ordersCollection.insertOne(order)
        .then(result => {
            if (result.success) {
                res.sendStatus(200);
                console.log('Posted Successfully')
            }
        })
        .catch(err => console.log(err));

    // const projectImg = req.files.projectImg;
    // const type = projectImg.mimetype;
    // const size = projectImg.size;
    // const orderData = req.body;
    // const imgData = projectImg.data;
    // const encImg = imgData.toString('base64');

    // const convertedImg = {
    //     contentType: type,
    //     size: parseFloat(size),
    //     img: Buffer.from(encImg, 'base64')
    // };
    // const readyData = { service: orderData.service, description: orderData.description, name: orderData.name, email: orderData.email, price: orderData.price, projectImg: convertedImg };

    // ordersCollection.insertOne(readyData)
    //     .then(result => {
    //         if (result.success) {
    //             res.sendStatus(200);
    //             console.log('Posted Successfully')
    //         }
    //     })
    //     .catch(err => console.log(err))
})




app.listen(3100);