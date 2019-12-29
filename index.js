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

     fs.readFile('public/json/zauzeca.json', 'utf-8', function (err, data) {
          if (err) throw err;

          var objekti = JSON.parse(data);
          let flag = false; // bool vrijednost - da li je doslo do preklapanja ili ne?

          if (novoZauzece.dan != null) {
               // periodicno zauzece

               for (let i = 0; i < objekti.periodicna.length; i++) {

                    if (objekti.periodicna[i].dan == novoZauzece.dan && objekti.periodicna[i].semestar == novoZauzece.semestar && objekti.periodicna[i].naziv == novoZauzece.naziv
                         && porediVrijeme(objekti.periodicna[i].pocetak, novoZauzece.kraj) <= 0 && porediVrijeme(novoZauzece.pocetak, objekti.periodicna[i].kraj) <= 0) {
                         flag = true;
                         // preklapanje!
                         console.log("poklapanje u prvom");
                         res.statusCode = 250;
                         break;
                    }
               }

               if (!flag) {
                    // vanredna preklapanja?
                    for (let i = 0; i < objekti.vanredna.length; i++) {

                         let nizDatum = objekti.vanredna[i].datum.split(".");
                         let dan = parseInt(nizDatum[0]);
                         let mjesec = parseInt(nizDatum[1]);
                         let godina = parseInt(nizDatum[2]);

                         let prviDan = (new Date(godina, mjesec, dan).getDay()) % 7;
                         if (prviDan == 0) prviDan = 7;
                         prviDan--;

                         let semestar = getSemestar(mjesec);
                         console.log(objekti.vanredna[i]);
                         if (objekti.vanredna[i].naziv == novoZauzece.naziv && prviDan == novoZauzece.dan && semestar == novoZauzece.semestar
                              && porediVrijeme(objekti.vanredna[i].pocetak, novoZauzece.kraj) <= 0 && porediVrijeme(novoZauzece.pocetak, objekti.vanredna[i].kraj) <= 0) {
                              flag = true;

                              // preklapanje!
                              console.log("poklapanje u drugom");
                              res.statusCode = 250;
                              break;
                         }
                    }
               }

               if (!flag) {
                    // nemamo preklapanje - rezervacija odobrena
                    objekti.periodicna.push(novoZauzece);
               }
          }

          else {

               // vanredno zauzece 
               for (let i = 0; i < objekti.vanredna.length; i++) {
                    if (objekti.vanredna[i].datum == novoZauzece.datum && objekti.vanredna[i].naziv == novoZauzece.naziv
                         && porediVrijeme(objekti.vanredna[i].pocetak, novoZauzece.kraj) <= 0 && porediVrijeme(novoZauzece.pocetak, objekti.vanredna[i].kraj) <= 0) {
                         flag = true;
                         // preklapanje!
                         res.statusCode = 270;
                         break;
                    }
               }
               if (!flag) {

                    // periodicna preklapanja?

                    let nizDatum = novoZauzece.datum.split(".");
                    let dan = parseInt(nizDatum[0]);
                    let mjesec = parseInt(nizDatum[1]);
                    let godina = parseInt(nizDatum[2]);

                    let prviDan = new Date(godina, mjesec, dan).getDay();
                    if (prviDan == 0) prviDan = 7; // problem nedjelje...
                    prviDan--;

                    let semestar = getSemestar(mjesec);

                    for (let i = 0; i < objekti.periodicna.length; i++) {
                         if (objekti.periodicna[i].dan == prviDan && semestar == objekti.periodicna[i].semestar && objekti.periodicna[i].naziv == novoZauzece.naziv
                              && porediVrijeme(objekti.periodicna[i].pocetak, novoZauzece.kraj) <= 0 && porediVrijeme(novoZauzece.pocetak, objekti.periodicna[i].kraj) <= 0) {
                              // preklapanje!

                              console.log("preklop");
                              flag = true;
                              res.statusCode = 270;
                              break;
                         }
                    }
               }

               if (!flag) {
                    // nemamo preklapanje - rezervacija odobrena
                    objekti.vanredna.push(novoZauzece);
               }
          }

          if (!flag) {
               fs.writeFile('public/json/zauzeca.json', JSON.stringify(objekti), function (err) {
                    if (err) throw err;
               })
          }

          res.send(JSON.stringify(objekti));
     })

});

app.get('/zauzeca.json', function (req, res) {
     console.log("pozvan sam1");
     res.sendFile(__dirname + "/zauzeca.json");
});

app.listen(8080);

const zimski = [9, 10, 11, 0];
const ljetni = [1, 2, 3, 4];

// funckija pronalaska semestra
function getSemestar(mjesec) {

     if (zimski.includes(mjesec)) {
          console.log("zimski", mjesec);
          return "zimski";
     }
     else if (ljetni.includes(mjesec)) {
          console.log("ljetni", mjesec);
          return "ljetni";
     }
     return "";
     // nemamo semestar
}

// funkcija za poredjenje vremena
function porediVrijeme(prvo, drugo) {

     var elementiPrvog = prvo.split(":");
     var elementiDrugog = drugo.split(":");

     var prviDatum = new Date("01/01/2000");                 // proizvoljne vrijednosti
     var drugiDatum = new Date("01/01/2000");

     prviDatum.setHours(elementiPrvog[0]);
     prviDatum.setMinutes(elementiPrvog[1]);
     drugiDatum.setHours(elementiDrugog[0]);
     drugiDatum.setMinutes(elementiDrugog[1]);

     if (prviDatum < drugiDatum) {
          return -1;
     }
     else if (prviDatum == drugiDatum) {
          return 0;
     }
     else {
          return 1;
     }
}
