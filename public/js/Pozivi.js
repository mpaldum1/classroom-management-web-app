let Pozivi = (function () {

    const zimski = [9, 10, 11, 0];
    const ljetni = [1, 2, 3, 4];

    var listaZauzeca = [];
    // privatni atributi

    function ucitajImpl(zauzeca) {

        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {

                JSONzauzeca = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
                listaZauzeca = [];
                prilagodiUcitavanje(listaZauzeca, JSONzauzeca.vanredna, JSONzauzeca.periodicna);
            }
        };

        xhttp.open("GET", zauzeca, true);
        xhttp.send();
    }


    function rezervisiImpl(zauzece, trenutniMjesec) {

        // kupimo aktuelno stanje iz zauzecea.json
        var danPeriodicnog;
        if (zauzece.dan != null) {
            danPeriodicnog = zauzece.dan;
            zauzece.dan = zauzece.dan % 7;
        }

        // kako bi znali pritisnut datum na kalendaru za periodicno zauzece 
        // provjeriti indeks ovdje da li ide od 1 il 0

        if (isZauzetTermin(zauzece, trenutniMjesec)) {

            let datum = zauzece.datum;
            trenutniMjesec = trenutniMjesec + 1;

            let stringMjeseca = String(trenutniMjesec);
            if (trenutniMjesec < 10) {
                stringMjeseca = "0" + stringMjeseca;
            }

            // provjeriti indeks ovdje da li ide od 1 il 0
            if (datum == undefined) {
                // periodicno je zauzece - pronalazimo datum

                let stringDana = danPeriodicnog;
                if (danPeriodicnog < 10) {
                    stringDana = "0" + stringDana;
                }

                let godina = new Date().getFullYear();
                datum = stringDana + "/" + stringMjeseca + "/" + godina;
            }

            else {

                // vanredno zauzece , ali trazi se drugi format datuma
                let tempNiz = datum.split(".");
                let stringDana = tempNiz[0];
                if (stringDana.lenght < 2) {
                    stringDana = "0" + stringDana;
                }
                datum = stringDana + "/" + stringMjeseca + "/" + tempNiz[2];

            }

            window.alert("Nije moguće rezervisati salu " + zauzece.naziv + " za navedeni datum " + datum + " i termin od "
                + zauzece.pocetak + " do " + zauzece.kraj + "!");
        }

        else {

            // mozemo rezervisati
            let ajax = new XMLHttpRequest();
            odobrenaRezervacija = true;

            ajax.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    JSONzauzeca = JSON.parse(ajax.responseText);

                    let sala = document.getElementById("sala").value;
                    let pocetak = document.getElementById("pocetak").value;
                    let kraj = document.getElementById("kraj").value;

                    Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
                    //  Kalendar.iscrtajKalendar(document.getElementById("kalendar"),trenutniMjesec);
                    Kalendar.obojiZauzeca(htmlRef, trenutniMjesec, sala, pocetak, kraj);
                    listaZauzeca = [];
                    prilagodiUcitavanje(listaZauzeca, JSONzauzeca.vanredna, JSONzauzeca.periodicna);
                }
            };

            ajax.open("POST", "/http://localhost:8080/html/rezervacija.html", true);
            ajax.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            ajax.send(JSON.stringify(zauzece));
        }

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

    return {

        ucitaj: ucitajImpl,
        rezervisi: rezervisiImpl
    }


}());





