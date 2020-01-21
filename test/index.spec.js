const supertest = require("supertest");
const assert = require('assert');
const app = require("../index");

var chai = require("chai");
var chaiHttp = require("chai-http");
chai.use(chaiHttp);

var expect = chai.expect;

describe('Testovi spirale 4', function () {

    describe('GET/osoblje', function () {

        it("GET/osoblje treba vraca status kod 200", function (done) {
            supertest(app).get('/html/osoblje')
                .end(function(err,res){
                    if(err) done(err);
                    var osoblje = res.body;
                    var test = ["Neko Nekić", "Drugi Neko", "Test Test"];
                    expect(res).to.have.status(200);
             //       expect(JSON.stringify(test) == JSON.stringify(osoblje)).to.be.true;
                    done();
                })
        });
    });
});

  