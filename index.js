const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var path = require('path')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req,res){
     res.sendFile(__dirname  + "/public/html/pocetna.html");
       
});

app.listen(8080);


