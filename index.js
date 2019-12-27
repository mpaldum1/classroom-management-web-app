const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var path = require('path')
const fs = require('fs');
const xhttp = require('http');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
     res.sendFile(__dirname + "/public/html/pocetna.html");

});


app.post("/http://localhost:8080/html/rezervacija.html", function (req, res) {

     let novoZauzece = JSON.parse(JSON.stringify(req.body));

     var fs = require('fs')

     fs.readFile('public/json/zauzeca.json', 'utf-8', function (err, data) {
          if (err) throw err;
          var objekti = JSON.parse(data);

          if (novoZauzece.dan != null) {
               // periodicno zauzece
               objekti.periodicna.push(novoZauzece);
          }
          else {
               objekti.vanredna.push(novoZauzece);
          }

          fs.writeFile('public/json/zauzeca.json', JSON.stringify(objekti), function (err) {
               if (err) throw err;
          })

          res.send(JSON.stringify(objekti));

     })

});

app.get('/zauzeca.json', function (req, res) {
     console.log("pozvan sam1");
     res.sendFile(__dirname + "/zauzeca.json");
});

app.listen(8080);


