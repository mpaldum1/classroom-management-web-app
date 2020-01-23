let assert = chai.assert;
chai.should();

describe('Testovi spirale 4', function () {

    describe('GET/osoblje', function () {

        it("GET /osoblje treba vratiti status 200 - OK", function (done) {

            // piseamo /html jer je fajl testoviS4 unutar public/html direktorija
            api.get('/html/osoblje')
                .set('Accept', 'application/json')
                .expect(200)
                .expect('Content-Type', /json/)
                .then(response => {
                    done();
                }).catch(err => {
                    done(err);
                })
        });
    });
});