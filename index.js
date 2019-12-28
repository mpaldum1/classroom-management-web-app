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

          listaZauzeca = [];
          prilagodiUcitavanje(listaZauzeca, objekti.vanredna, objekti.periodicna);


          if (!isZauzetTermin(novoZauzece, trenutniMjesec)) {

               // mozemo rezervisati 

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
          }

     })

});

app.get('/zauzeca.json', function (req, res) {
     console.log("pozvan sam1");
     res.sendFile(__dirname + "/zauzeca.json");
});

app.listen(8080);

const zimski = [9, 10, 11, 0];
const ljetni = [1, 2, 3, 4];

function isZauzetTermin(zauzece, trenutniMjesec, listaZauzeca) {
     // provjera da li je vec termin zauzet

     let prilagodjenaPeriodicna = [];
     var semestar = zauzece.semestar;

     if (zauzece.dan != null && zauzece.dan != NaN) {

          // u pitanju je redovno zauzece
          // prilagođavamo zauzece
          for (var i = zauzece.dan; i <= 31; i += 7) {        // ukoliko je broj dana manji, ignorise se ostatak

               // popunjavamo listu zauzeca za svaku sedmicu u navedenom terminu

               var trenutna = new Kalendar.periodicnaZauzeca(i, zauzece.semestar, zauzece.pocetak, zauzece.kraj, zauzece.naziv, zauzece.predavac);
               prilagodjenaPeriodicna.push(trenutna);
               semestar = zauzece.semestar;
          }

     }

     else {
          // vanredno zauzece - samo jedno zauzece za razliku od periodicnog
          prilagodjenaPeriodicna.push(zauzece);
     }

     // provjera - imamo li preklapanja u zauzecima
     let flag = false;
     let trenutnaGodina = new Date().getFullYear();

     console.log("prilagodjena", prilagodjenaPeriodicna);
     console.log("lista", listaZauzeca);
     console.log(trenutniMjesec);


     prilagodjenaPeriodicna.forEach(elementZauzeca => {


          if (elementZauzeca.datum == undefined && !Kalendar.isRegularnoRedovnoZauzece(zauzece)) {
               flag = true;
          }


          listaZauzeca.forEach(element => {
               // formiramo datume za provjeru prilikom poredjenja

               let datumElementa = new Date(trenutnaGodina, trenutniMjesec, element.dan);
               if (element.datum != undefined) {

                    let datumNiz = element.datum.split(".");
                    datumElementa = new Date(datumNiz[2], datumNiz[1], datumNiz[0]);
               }

               let datumElementaZauzeca = new Date(trenutnaGodina, trenutniMjesec, elementZauzeca.dan);

               if (elementZauzeca.dan == undefined && (elementZauzeca.semestar == "zimski" || elementZauzeca.semestar == "ljetni")) {
                    let datumNiz = elementZauzeca.datum.split(".");
                    datumElementaZauzeca = new Date(datumNiz[2], datumNiz[1], datumNiz[0]);
               }

               let result = datumElementaZauzeca.getTime() == datumElementa.getTime() && Kalendar.porediVrijeme(element.pocetak, elementZauzeca.kraj) <= 0 &&
                    Kalendar.porediVrijeme(elementZauzeca.pocetak, element.kraj) <= 0 && element.naziv == elementZauzeca.naziv;

               if (result) {
                    flag = true;
                    // imamo preklapanje;
                    // return ne radi u situaciji foreach petlje - mozda optimizovati kasnije...
               }

          });

          console.log("prvi prolaz", flag);

     });

     if (!flag && semestar != undefined) {
          // provjera vanrednih zauzeca u drugim mjesecima za slucaj periodice rezervacije

          console.log("drugi prolaz", flag);
          listaZauzeca.forEach(element => {
               if (element.datum != undefined) {
                    // vanredno samo posmatramo 

                    let niz = element.datum.split(".");
                    let mjesec = parseInt(niz[1]);
                    let dan = parseInt(niz[0]);

                    console.log(mjesec, dan);

                    let result = Kalendar.porediVrijeme(element.pocetak, zauzece.kraj) <= 0 &&
                         Kalendar.porediVrijeme(zauzece.pocetak, element.kraj) <= 0 && element.naziv == zauzece.naziv;

                    if (semestar != null && dan == zauzece.dan) {
                         if (semestar == "ljetni") {
                              for (var i = 0; i < 4; i++) {

                                   if (result && ljetni[i] == mjesec) {
                                        flag = true;
                                   };
                              }
                         }

                         else {
                              for (var i = 0; i < 4; i++) {
                                   //      console.log("datum", element.datum);
                                   //     console.log("mjesec", mjesec);
                                   //     console.log("zimsi", zimski[i]);
                                   if (result && zimski[i] == mjesec) {
                                        flag = true;
                                   };
                                   //     console.log("result", result);
                                   //   console.log(flag);

                              }
                         }
                    }
               }
          });
     }

     return flag;
}

function prilagodiUcitavanje(listaZauzeca, vanredna, periodicna) {

     vanredna.forEach(element => {
          listaZauzeca.push(new Kalendar.vanrednaZauzeca(element.datum, element.pocetak, element.kraj, element.naziv, element.predavac));
     });

     periodicna = periodicna.filter(element => {
          return Kalendar.isRegularnoRedovnoZauzece(element);
     });

     periodicna.forEach(element => {
          for (var i = element.dan; i <= 31; i += 7) {

               // ukoliko je broj dana manji, ignorise se 
               // popunjavamo listu zauzeca za svaku sedmicu u navedenom terminu 
               // provjeriti radi li za svaki mjesec u navedenom semestru...

               var trenutna = new Kalendar.periodicnaZauzeca(i, element.semestar, element.pocetak, element.kraj, element.naziv, element.predavac);
               listaZauzeca.push(trenutna);
          }
     });
}


