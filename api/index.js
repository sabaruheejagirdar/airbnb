const express = require('express');
// For cross origin, that is to communicatae 5173(app port) to 4000(server port)
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')
// for cookie
const jwt = require('jsonwebtoken')
const User = require('./models/User.js')
// To retrieve cookie
const cookieParser = require('cookie-parser')

require('dotenv').config()

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'gsdfysujguasdygbcjvfgyuhijkhgyutdha';

// uxaQQSJS4DrdlDAO

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
}));


mongoose.connect(process.env.MONGO_URL);

app.get('/test', (req,res) =>{
    res.json('test ok');
});

app.post('/register', async (req, res) =>{
    const {name,email,password} = req.body;
    try{
        const userDoc = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt),
        });
        res.json(userDoc);
    }catch(e){
        res.status(422).json(e);
    }
    
});

app.post('/login', async(req, res) => {
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc){
        // res.json("Found")
        const passwordMatches = bcrypt.compareSync(password, userDoc.password)
        if (passwordMatches){
            jwt.sign({ email: userDoc.email, id: userDoc._id}, jwtSecret, {}, (err,token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc)
            })
            
        } else{
            res.status(422).json("Password incorrect")
        } 
    }else{
        res.json("Not found")
    }
});

// Triggered on useEffect within UserContext
app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    if (token){
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) throw err;
            const {name, email, _id} = await User.findById(userData.id)
            res.json({name, email, _id});
        });
    }else{
        res.json(null);
    }
});



app.listen(4000);