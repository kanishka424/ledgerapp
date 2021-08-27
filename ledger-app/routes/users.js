const config = require('config')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const _ = require('lodash')
const { User, validate } = require('../models/user');
const mongooes = require('mongoose');
const express = require('express');
const router = express.Router();


router.post('/', async (req, res) => {//for initially registering users
    const { error } = validate(req.body);
    if (error) res.status(400).send(error.details[0].message);//my two lines for validating object (name,eamil,pw) when a user registers
    let user = await User.findOne({ email: req.body.email });//we search by a propert rathar than id so instead of findById we use findOne();//this returns a promise 
    if (user) return res.status(400).send('User already registered');//since this is registering not logging

    // user =new User({
    //     name:req.body.name,
    //     email:req.body.eamil,
    //     password:req.body.password

    // });
    user = new User(_.pick(req.body, ['name', 'email', 'password']))//heere we replaced the above code
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt)//returns a promise
    await user.save();//saving to db

    const token = jwt.sign({ _id: user._id }, config.get('jwtPrivateKey'))//how to create a jwt token first agument is what we include (payload) secons one is the secret key we use to create signature
    res.send(_.pick(user, ['name', 'email']));//can filter only the properties we need and returns an object with only those properties
});



module.exports = router;