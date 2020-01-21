const db = require('./db.js')
db.sequelize.sync({ force: true }).then(function () {
    inicializacija().then(function () {
        console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
        process.exit();
    });
});

function inicializacija() {

    var osobljeListaPromisea = [];
    var terminListaPromisea = [];
    var rezervacijaListaPromisea = [];
    var salaListaPromisea = [];

    return new Promise(function (resolve, reject) {

        osobljeListaPromisea.push(db.osoblje.create({ ime: 'Neko', prezime: 'Nekić', uloga: 'profesor' }));
        osobljeListaPromisea.push(db.osoblje.create({ ime: 'Drugi', prezime: 'Neko', uloga: 'asistent' }));
        osobljeListaPromisea.push(db.osoblje.create({ ime: 'Test', prezime: 'Test', uloga: 'asistent' }));

        Promise.all(osobljeListaPromisea).then(function (osoblje) {

            salaListaPromisea.push(db.sala.create({ naziv: '1-11', zaduzenaOsoba:1}));
            salaListaPromisea.push(db.sala.create({ naziv: '1-15', zaduzenaOsoba:2}));


            Promise.all(salaListaPromisea).then(function (sale) {

                terminListaPromisea.push(db.termin.create({ redovni: 'false', dan: null, datum: '01.01.2020', semestar: null, pocetak: '12:00', kraj: '13:00' }));
                terminListaPromisea.push(db.termin.create({ redovni: 'true', dan: 0, datum: null, semestar: 'zimski', pocetak: '13:00', kraj: '14:00' }));

                Promise.all(terminListaPromisea).then(function (termini) {

                    rezervacijaListaPromisea.push(db.rezervacija.create({ termin: 1, sala: 1, osoba: 1 }));
                    rezervacijaListaPromisea.push(db.rezervacija.create({ termin: 2, sala: 1, osoba: 3 }));
                    

                    Promise.all(rezervacijaListaPromisea).then(function (b) { resolve(b); }).catch(function (err) { console.log("Rezervacija greska " + err); });

                }).catch(function (err) { console.log("Termini greska " + err); });

            }).catch(function (err) { console.log("Sale greska " + err); });

        }).catch(function (err) { console.log("Osoblje greska " + err); });

    });
}
