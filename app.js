const express = require('express');
const app = express();
var cookieParser = require('cookie-parser');
app.use(cookieParser());

const dotenv = require("dotenv");

dotenv.config({ path: './config.env' });
require('./db/conn');

app.use(express.json());
app.use(require('./router/auth'));

const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV === "production"){
    app.use(express.static("client/build"));
    const path = require("path");
    app.get("*", (req, res) =>{
        res.sendDate(path.resolve(__dirname, 'client', 'build', 'index.html'));
    })
}

app.listen(PORT, ()=>{
    console.log(`Server is running at port number ${PORT}`);
})