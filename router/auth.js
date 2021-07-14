const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const authenticate = require('../middleware/authenticate');


require('../db/conn');
const User = require('../model/userSchema');

router.post('/register', async (req, res) =>{
    const {name, email, phone, work, password, cpassword} = req.body;

    if(!name || !email || !phone || !work || !password || !cpassword){
        return res.status(422).json({ error: "Please fill all the fields" });
    }

    try{
        const userExist =await User.findOne({ email: email });

        if(userExist){
            return res.status(422).json({ error: "Email already exist" });
        }else if(password != cpassword){
            return res.status(422).json({ error: "Password and confirm password are not same" });
        }

        const user = new User({name, email, phone, work, password, cpassword});

        await user.save();

        return res.json({ message: "User registered successfully" });
    }catch(err){
        console.log(err);
    }   
});

router.post('/signin',async (req, res) =>{
    const { email, password} = req.body;

    if(!email || !password ){
        return res.status(422).json({ error : "Fill all the fields"});
    }

    try{
        const userLogin = await User.findOne({ email: email });
        if(userLogin){
            const isMatch = await bcrypt.compare(password, userLogin.password);

            const token = await userLogin.generateAuthToken();

            res.cookie("jwtoken", token,{
                expires: new Date(Date.now() + 25892000000),
                httpOnly: true
            });

            if(isMatch){
                return res.json({ message: "User login successfull"});
            }else{
                return res.status(422).json({ message: "Invalid Credentials"});
            }
        }else{
            return res.status(422).json({ message: "Invalid Credentials"});
        }
    }catch(err){
        console.log(err);
    }
});

router.get('/getdata', authenticate, (req, res) => {
    res.send(req.rootUser);
})

router.post('/contactus',authenticate, async (req, res) =>{
    const {name, email, phone, message} = req.body;

    if(!name || !email || !phone || !message){
        return res.status(422).json({ error : "Fill all the fields"});
    }
    try{
        const userContact = await User.findOne({ _id: req.userID });
        if(userContact){
            const userMessage = await userContact.addMessage(name, email, phone, message);

            await userContact.save();

            res.status(201).json({ message:" Contact successfull"});
        }
    }
    catch(err){
        console.log(err);
    }
});

router.get('/logout', authenticate, (req, res) => {
    res.clearCookie('jwtoken', {path:'/'});
    res.status(200).send("User Logout");
});

module.exports = router;