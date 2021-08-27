const _ = require('lodash')
const bcrypt = require('bcrypt');
const Joi = require('Joi');
const { User } = require('../models/user');
const express = require('express');
const router = express.Router();




router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("No such user registered.");//here we do the opposite of register becuse this is authentication

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send('Invalid email or password');

    const token = user.generatAuthToken();
    //res.send(token);//we send the token to client after a succesful authenticationS
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'email']))


})




function validate(user) {
    let schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    });
    return schema.validate(user)
}






module.exports = router;