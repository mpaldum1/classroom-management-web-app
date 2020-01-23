const supertest = require("supertest");
const assert = require('assert');
const app = require("../index");

var chai = require("chai");
var chaiHttp = require("chai-http");
chai.use(chaiHttp);

const db = require('../Database/db.js');

var expect = chai.expect;

before(function (done) {
    setTimeout(function () {
        done();
    }, 1700);
});

// dovoljno vremena da se baza ucita 

describe('Testovi spirale 4', function () {

    let data1 = {
        datum: "02.01.2020.",
        pocetak: "09:00:00",
        kraj: "21:00:00",
        naziv: "1-11",
        predavac: "Test Test, asistent",
    }

    let data2 = {
        datum: "04.01.2020.",
        pocetak: "09:00:00",
        kraj: "20:00:00",
        naziv: "1-15",
        predavac: "Neko Nekić, profesor",
    }

    let data3 = {
        datum: "22.01.2020.",
        pocetak: "08:00:00",
        kraj: "21:00:00",
        naziv: "1-11",
        predavac: "Drugi Neko, asistent",
    }

    let data4 = {
        dan: 2,
        semestar: "zimski",
        pocetak: "08:00:00",
        kraj: "21:00:00",
        naziv: "1-11",
        predavac: "Drugi Neko, asistent",
    }

    describe('GET/osoblje', function () {

        it("GET/osoblje vraca status code OK - 200", function (done) {
            supertest(app).get('/html/osoblje')
                .end(function (err, res) {

                    if (err) done(err);
                    expect(res).to.have.status(200);
                    done();
                })

        });

        it("GET/osoblje vraca dobre pocetne podatke o osoblju", function (done) {
            supertest(app).get('/html/osoblje')
                .end(function (err, res) {

                    if (err) done(err);
                    var osoblje = JSON.parse(res.text);

                    var objekat1 = { ime: "Neko", prezime: "Nekić", uloga: "profesor" };
                    var objekat2 = { ime: "Drugi", prezime: "Neko", uloga: "asistent" };
                    var objekat3 = { ime: "Test", prezime: "Test", uloga: "asistent" };

                    var test = [];
                    test.push(objekat1);
                    test.push(objekat2);
                    test.push(objekat3);

                    for (let i = 0; i < 3; i++) {
                        flag = false;
                        for (let j = 0; j < 3; j++) {
                            if (JSON.stringify(test[i]) == JSON.stringify(osoblje[j])) // imamo li objekat unutar baze 
                                flag = true;
                        }

                        expect(flag).to.be.true;
                    }

                    done();
                })

        });


    });

    describe('Dohvatanje svih zauzeća', function () {

        it("Učitavanje iz zauzeća vraća statu code OK - 200", function (done) {
            supertest(app).get('/html/ucitajIzBaze')
                .end(function (err, res) {

                    if (err) done(err);
                    expect(res).to.have.status(200);
                    done();
                })


        });

        it("/ucitajIzBaze vraca dobre pocetne podatke o zauzećima", function (done) {
            supertest(app).get('/html/ucitajIzBaze')
                .end(function (err, res) {

                    if (err) done(err);
                    var zauzeca = JSON.parse(res.text);
                    // na osnovu date pocetne baze, imamo 2 zauzeca, vanredno i periodicno

                    var vanredno = { dan: 0, semestar: "zimski", pocetak: "13:00:00", kraj: "14:00:00", naziv: "1-11", predavac: "Test Test" };
                    var periodicno = { datum: "01.01.2020", pocetak: "12:00:00", kraj: "13:00:00", naziv: "1-11", predavac: "Test Test" };

                    var test = { periodicno: periodicno, vanredno: vanredno };
                    expect(JSON.stringify(test) == JSON.stringify(zauzeca));

                    done();

                });

        });

        it("/ucitajIzBaze vraca dobre podatke o zauzećima nakon nove rezervacije", function (done) {

            supertest(app).post('/html/upisiUBazu')
                .send(data1)
                .set('Accept', 'application/json')
                .end(function (err, res) {

                    if (err) done(err);
                    expect(res).to.have.status(200);


                    supertest(app).get('/html/ucitajIzBaze')
                        .end(function (err, res) {

                            if (err) done(err);
                            var zauzeca = JSON.parse(res.text);

                            // na osnovu date pocetne baze, imamo 2 zauzeca, vanredno i periodicno

                            var vanredno = { dan: 0, semestar: "zimski", pocetak: "13:00:00", kraj: "14:00:00", naziv: "1-11", predavac: "Test Test" };
                            var periodicno = { datum: "01.01.2020", pocetak: "12:00:00", kraj: "13:00:00", naziv: "1-11", predavac: "Test Test" };

                            var test = { periodicno: periodicno, vanredno: [vanredno, data1] };
                            expect(JSON.stringify(test) == JSON.stringify(zauzeca));

                            done();

                        });
                });


        });


    });

    describe('Dohvatanje svih sala', function () {

        it("Dohvatanje svih sala vraća status code OK - 200", function (done) {

            supertest(app).get('/html/sale')
                .end(function (err, res) {

                    if (err) done(err);
                    expect(res).to.have.status(200);
                    done();
                })

        });

        it("GET/sale vraca dobre pocetne podatke o salama", function (done) {
            supertest(app).get('/html/sale')
                .end(function (err, res) {

                    if (err) done(err);
                    var sale = JSON.parse(res.text);

                    var objekat1 = { naziv: "1-15" };
                    var objekat2 = { naziv: "1-11" };

                    var test = [];
                    test.push(objekat1);
                    test.push(objekat2);

                    for (let i = 0; i < 2; i++) {
                        flag = false;
                        for (let j = 0; j < 2; j++) {
                            if (JSON.stringify(test[i]) == JSON.stringify(sale[j])) // imamo li objekat unutar baze 
                                flag = true;
                        }

                        expect(flag).to.be.true;
                    }

                    done();
                })

        });


    });


    describe('Kreiranje nove rezervacije', function () {

        it("Kreiranje nove rezervacije vraca status code OK - 200", function (done) {

            supertest(app).post('/html/upisiUBazu')
                .send(data3)
                .set('Accept', 'application/json')

                .end(function (err, res) {
                    if (err) done(err);
                    expect(res).to.have.status(200);
                    done();
                })

        });

        it("Kreiranje nove rezervacije upisuje dobre podatke", function (done) {

            supertest(app).post('/html/upisiUBazu')
                .send(data2)
                .set('Accept', 'application/json')
                .end(function (err, res) {

                    if (err) done(err);
                    expect(res).to.have.status(200);

                    db.termin.findAll({ where: { datum: '04.01.2020.' } }).then(termin => {
                        let flag = false;
                        if (termin.length != 0) {
                            // imamo samo jednu rezervaciju na ovaj datum, onu koju smo poslali - data2
                            flag = true;
                        }
                        expect(flag).to.be.true;
                        done();
                    });
                });

        });

        it("Kreiranje nove rezervacije koja se preklapa - vanredno", function (done) {

            supertest(app).post('/html/upisiUBazu')
                .send(data3)
                .set('Accept', 'application/json')
                .end(function (err, res) {

                    if (err) done(err);
                    expect(res).to.have.status(270);
                    // vlasito definisani statusni kod - 270 simbolizuje preklapanja

                    done();
                });
        });

        it("Kreiranje nove rezervacije koja se preklapa - periodicno", function (done) {

            supertest(app).post('/html/upisiUBazu')
                .send(data4)
                .set('Accept', 'application/json')
                .end(function (err, res) {

                    if (err) done(err);
                    expect(res).to.have.status(250);
                    // vlasito definisani statusni kod - 270 simbolizuje preklapanja

                    done();
                });
        });

    });


});


