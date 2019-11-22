let assert = chai.assert;

describe('Kalendar', function () {

    describe('obojiZauzeca() &  ucitajPodatke()', function () {

        it('obojiZauzeca() - nemamo podataka', function () {

            Kalendar.ucitajPodatke([], []);
            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "12:00", "13:30");

            var djeca = document.querySelector(".datum").children;

            for (var i = 0; i < djeca.length; i++) {                     // kupimo sve datume iz kalendara
                var klasa = djeca[i].lastChild.className;

                assert.equal(klasa, "slobodna", 'Neispravno! - Sala mora biti slobodna');
            }

        });

        it('obojiZauzeca() - duple vrijednosti', function () {

            Kalendar.iscrtajKalendar(document.getElementById("kalendar"),10);
            Kalendar.ucitajPodatke([{dan:6, semestar:"zimski", pocetak: "10:30", kraj: "22:30", naziv: "0-01", predavac:"Dave"}],
                [{datum:"06.10.2019.", pocetak: "12:50", kraj: "17:30", naziv: "0-01", predavac:"James"},
                 {datum:"06.10.2019.", pocetak:"12:50", kraj:"17:30", naziv:"0-01", predavac:"Kirk"}]);
            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "12:00", "13:30");

            var djeca = document.querySelector(".datum").children;
            var brojZauzetih = 0;

            for (var i = 0; i < djeca.length; i++) {                     // kupimo sve datume iz kalendara
                var klasa = djeca[i].lastChild.className;
                if (klasa === "zauzeta") {
                    brojZauzetih++;
                }
                console.log(klasa);
            }
            assert.equal(brojZauzetih, 4, 'Neispravno! - Ukupno moraju biti 4 zauzeca');
        });

    });

    describe('iscrtajKalendar()', function () {


        it('Broj dana - septembar (30)', function () {


            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 8);
            var element = document.querySelector(".item:last-child");
            var prvi = element.firstChild;
            var vrijednost = prvi.innerText;
            assert.equal(vrijednost, 30, "Neispravno! - Mjesec im 30 dana");
        });

        it('Broj dana - juli (31)', function () {


            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 6);
            var element = document.querySelector(".item:last-child");
            var posljednji = element.firstChild;
            var vrijednost = posljednji.innerText;
            assert.equal(vrijednost, 31, "Neispravno! - Mjesec im 31 dan");
        });

        it('Broj dana - februar (28)', function () {


            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 1);
            var element = document.querySelector(".item:last-child");
            var prvi = element.firstChild;
            var vrijednost = prvi.innerText;
            assert.equal(vrijednost, 28, "Neispravno! - Mjesec im 28 dana (ove godine)");
            // test ce pasti za prestupne godine
        });

        it('Prvi dan trenutnog mjeseca - novembar', function () {


            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
            var element = document.querySelector(".datum div:first-child");
            var prviDan = element.style.gridColumn;
            var vrijednost = prviDan.split('/')[0] // offset koliko je prvi dan pomjeren, odnosno indeks prvog dana 1 - PON, ...
            assert.equal(vrijednost, 5, "Neispravno! - Prvi dan je u petak!");

        });

        it('30. dan trenutnog mjeseca - novembar', function () {


            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
            var element = document.querySelector(".datum div:first-child");
            var prviDan = element.style.gridColumn;
            var offset = parseInt(prviDan.split('/')[0]) - 1; // offset koliko je prvi dan pomjeren, odnosno indeks prvog dana 0 - PON, ...


            element = document.querySelector(".item:last-child");
            var posljednji = (element.firstChild).innerText;


            var vrijednost = posljednji % 7 + offset; // za koliko posljednji dan pomjeren na sedmicnoj bazi...

            assert.equal(vrijednost, 6, "Neispravno! - Prvi dan je u petak!");
            // subota je 6. dan u sedmici...

        });

        it('Prvi dan - maj', function () {


            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 4);
            var element = document.querySelector(".datum div:first-child");
            var prviDan = element.style.gridColumn;
            var vrijednost = prviDan.split('/')[0] // offset koliko je prvi dan pomjeren, odnosno indeks prvog dana 1 - PON, ...
            assert.equal(vrijednost, 3, "Neispravno! - Prvi dan je u petak!");
            // prvi dan pada u srijedu
        });

        it('Dani mjeseca i prvi dan - januar', function () {


            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 0);

            var element = document.querySelector(".datum div:first-child");
            var prviDan = element.style.gridColumn;
            var vrijednost = prviDan.split('/')[0] // offset koliko je prvi dan pomjeren, odnosno indeks prvog dana 1 - PON, ...
            assert.equal(vrijednost, 2, "Neispravno! - Prvi dan je u utorak!");
            // utorak je 2. dan u sedmici...

            var testnaLista = [];
            for (var i = 1; i <= 31; i++) {
                testnaLista.push(i);
            }

            var djeca = document.querySelector(".datum").children;
            var rezultatLista = [];
            for (var i = 0; i < djeca.length; i++) {                     // kupimo sve datume iz kalendara
                var broj = parseInt(djeca[i].firstChild.innerText);
                rezultatLista.push(broj);
            }

            for (var i = 0; i < 31; i++) {
                assert.equal(testnaLista[i], rezultatLista[i], "Neispravno! - Dani nisu dobro poredani")
            }

        });
    });
});
