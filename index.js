const express = require('express');
const app = express();
const bodyParser = require('body-parser');
var path = require('path')
const fs = require('fs');
const xhttp = require('http');

const Sequelize = require('sequelize');
const sequelize = require('./Database/db.js');

const db = require('./Database/db.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public')));



app.get('/html/osoblje', function (req, res) {

     db.osoblje.findAll({
          attributes: ['ime', 'prezime', 'uloga'], raw: true
     }).then(function (osoblje) {

          res.send((JSON.stringify(osoblje)));
     })
});

app.get('/html/ucitajIzBaze', function (req, res) {    

     db.rezervacija.findAll({

          include: [{ model: db.termin, as: "terminRezervacija", required: true },
          { model: db.sala, as: "salaRezervacija", required: true },
          { model: db.osoblje, as: "osobljeRezervacija", required: true }
          ]

     }).then(function (zauzeca) {
          console.log(zauzeca);
          zauzeca = nastimajZauzeca(zauzeca);
          res.send(JSON.stringify(zauzeca));
     });

});

app.post('/html/upisiUBazu', function (req, res) {

     let novoZauzece = JSON.parse(JSON.stringify(req.body));

     db.rezervacija.findAll({

          include: [{ model: db.termin, as: "terminRezervacija", required: true },
          { model: db.sala, as: "salaRezervacija", required: true },
          { model: db.osoblje, as: "osobljeRezervacija", required: true }
          ]

     }).then(function (zauzeca) {

          var objekti = nastimajZauzeca(zauzeca);
          let flag = false; // bool vrijednost - da li je doslo do preklapanja ili ne?

          console.log("objekti", objekti);
          console.log("novo zauceze", novoZauzece);

          if (novoZauzece.dan != null) {
               // periodicno zauzece

               for (let i = 0; i < objekti.periodicna.length; i++) {


                    if (objekti.periodicna[i].dan == novoZauzece.dan && objekti.periodicna[i].semestar == novoZauzece.semestar && objekti.periodicna[i].naziv == novoZauzece.naziv
                         && objekti.periodicna[i].pocetak < novoZauzece.kraj && novoZauzece.pocetak < objekti.periodicna[i].kraj) {
                         flag = true;
                         // preklapanje!

                         res.statusCode = 250;
                         objekti = ({periodicna: objekti.periodicna, vanredna: objekti.vanredna, predavac: objekti.periodicna[i].predavac });
                         break;

                    }
               }

               if (!flag) {
                    // vanredna preklapanja?
                    for (let i = 0; i < objekti.vanredna.length; i++) {

                         let nizDatum = objekti.vanredna[i].datum.split(".");
                         let dan = parseInt(nizDatum[0]);
                         let mjesec = parseInt(nizDatum[1]) - 1;
                         let godina = parseInt(nizDatum[2]);


                         let prviDan = (new Date(godina, mjesec, dan).getDay()) % 7;
                         if (prviDan == 0) prviDan = 7;
                         prviDan--;

                         let semestar = getSemestar(mjesec);

                         console.log(objekti.vanredna[i].naziv == novoZauzece.naziv, prviDan == novoZauzece.dan,
                              semestar == novoZauzece.semestar, objekti.vanredna[i].pocetak < novoZauzece.kra,
                              novoZauzece.pocetak < objekti.vanredna[i].kraj);

                         console.log("prvidan", prviDan);
                         console.log("semestar", semestar);

                         if (objekti.vanredna[i].naziv == novoZauzece.naziv && prviDan == novoZauzece.dan && semestar == novoZauzece.semestar &&
                              objekti.vanredna[i].pocetak < novoZauzece.kraj && novoZauzece.pocetak < objekti.vanredna[i].kraj) {
                              flag = true;

                              // preklapanje!
                              console.log("poklapanje u drugom");

                              res.statusCode = 250;
                              objekti = ({periodicna: objekti.periodicna, vanredna: objekti.vanredna, predavac: objekti.vanredna[i].predavac });
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
                         && objekti.vanredna[i].pocetak < novoZauzece.kraj && novoZauzece.pocetak < objekti.vanredna[i].kraj) {
                         flag = true;
                         // preklapanje!
                         res.statusCode = 270;
                         objekti = ({periodicna: objekti.periodicna, vanredna: objekti.vanredna, predavac: objekti.vanredna[i].predavac });
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
                              && objekti.periodicna[i].pocetak < novoZauzece.kraj && novoZauzece.pocetak < objekti.periodicna[i].kraj) {
                              // preklapanje!

                              console.log("preklop");
                              flag = true;
                              res.statusCode = 270;

                              objekti = ({periodicna: objekti.periodicna, vanredna: objekti.vanredna,predavac: objekti.periodicna[i].predavac });
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

               // upisujemo u bazu

               let redovni = novoZauzece.dan != null && novoZauzece.dan != undefined;

               db.termin.create({

                    redovni: redovni,
                    dan: novoZauzece.dan,
                    datum: novoZauzece.datum,
                    semestar: novoZauzece.semestar,
                    pocetak: novoZauzece.pocetak,
                    kraj: novoZauzece.kraj

               }).then(function (termin) {

                    let idSale;
                    let idOsoblja;
                    let idTermina = termin.id;


                    db.sala.findOne({
                         where: {
                              naziv: novoZauzece.naziv
                         }

                    }).then(function (sala) {


                         idSale = sala.id;
                         let pomocni = novoZauzece.predavac.split(" ");
                         let prezime = pomocni[1].substring(0, pomocni[1].length - 1);

                         db.osoblje.findOne({

                              where: {
                                   ime: pomocni[0],
                                   prezime: prezime,
                                   uloga: pomocni[2]
                              }

                         }).then(function (osoblje) {

                              idOsoblja = osoblje.id;

                              db.rezervacija.create({

                                   osoba: idOsoblja,
                                   sala: idSale,
                                   termin: idTermina

                              }).then(function (rezervacija) {

                              });

                         });
                    });

               });
          }
          res.send(JSON.stringify(objekti));
     });

});

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

                         if (objekti.vanredna[i].naziv == novoZauzece.naziv && prviDan == novoZauzece.dan && semestar == novoZauzece.semestar
                              && objekti.vanredna[i].pocetak < novoZauzece.kraj && novoZauzece.pocetak < objekti.vanredna[i].kraj) {
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
                         && objekti.vanredna[i].pocetak <= novoZauzece.kraj && novoZauzece.pocetak <= objekti.vanredna[i].kraj) {
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
                              && objekti.periodicna[i].pocetak <= novoZauzece.kraj && novoZauzece.pocetak <= objekti.periodicna[i].kraj) {
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
     res.sendFile(__dirname + "/zauzeca.json");
});

app.post("/http://localhost:8080/html/pocetna.html", function (req, res) {

     fs.readdir(__dirname + "/public/Galerija", function (err, files) {

          let tijeloZahtjeva = req.body;
          let brojSlika = files.length;
          let response = [];

          // sta je sa pocetnim slucajem? (svakako se dobavlja na pocetku...)

          for (var i = 0; i < brojSlika; i++) {
               if (!tijeloZahtjeva.lista.includes(files[i])) {
                    response.push(files[i]);
                    if (response.length == 3)
                         // najvise tri slike dobavljamo 
                         break;
               }
          }

          if (brojSlika - tijeloZahtjeva.lista.length <= 3) {
               response.push("kraj");
          }

          response.push(String(brojSlika));
          res.json(response);

     });

     res.sendFile(__dirname + "/public/Galerija");

});


const zimski = [9, 10, 11, 0];
const ljetni = [1, 2, 3, 4, 5];

// funckija pronalaska semestra
function getSemestar(mjesec) {

     if (zimski.includes(mjesec)) {
          return "zimski";
     }
     else if (ljetni.includes(mjesec)) {
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

function nastimajZauzeca(zauzeca) {

     let listaZauzeca = [];
     let periodicna = [];
     let vanredna = [];

     for (let i = 0; i < zauzeca.length; i++) {


          let trenutni = zauzeca[i];
          let pocetak = trenutni.terminRezervacija.pocetak;
          let kraj = trenutni.terminRezervacija.kraj;
          let predavac = trenutni.osobljeRezervacija.ime + " " + trenutni.osobljeRezervacija.prezime;
          let uloga = trenutni.osobljeRezervacija.uloga;
          let sala = trenutni.salaRezervacija.naziv;

          let datum = trenutni.terminRezervacija.datum;


          if (datum == null) {
               // u pitanju je periodicno zauzece

               let dan = trenutni.terminRezervacija.dan;
               let semestar = trenutni.terminRezervacija.semestar;
               let trenutno = { dan: dan, semestar: semestar, pocetak: pocetak, kraj: kraj, naziv: sala, predavac: predavac };
               periodicna.push(trenutno);

          }
          else {
               //  vanredno zauzece


               let trenutno = { datum: datum, pocetak: pocetak, kraj: kraj, naziv: sala, predavac: predavac };
               vanredna.push(trenutno);
          }

     }

     listaZauzeca = { periodicna: periodicna, vanredna: vanredna };

     return listaZauzeca;
}

app.get('/html/ucitajOsobe', function (req, res) {

     db.rezervacija.findAll({

          include: [{ model: db.termin, as: "terminRezervacija" },
          { model: db.sala, as: "salaRezervacija" },
          { model: db.osoblje, as: "osobljeRezervacija", required: false }
          ]

     }).then(function (zauzeca) {

          db.osoblje.findAll({

          }).then(function (osoblje) {
               zauzeca = nastimajZauzeca(zauzeca);
             
               let result = { zauzeca: zauzeca, osoblje: osoblje }
               res.send(JSON.stringify(result));
          });
     });

});

module.exports = app.listen(8080);