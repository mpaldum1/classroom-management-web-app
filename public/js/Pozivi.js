let Pozivi = (function () {
    {

        const zimski = [9, 10, 11, 0];
        const ljetni = [1, 2, 3, 4];
        var sedmica = ["Ponedjeljak", "Utorak", "Srijeda", "Cetvrtak", "Petak", "Subota", "Nedjelja"];

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

            // kako bi znali pritisnut datum na kalendaru za periodicno zauzece

            let datum = zauzece.datum;
            mjesec = trenutniMjesec + 1;
            let trenutnaGodina = new Date().getFullYear();

            let stringMjeseca = String(mjesec);
            if (mjesec < 10) {
                stringMjeseca = "0" + stringMjeseca;
            }


            if (datum != undefined) {

                // vanredno zauzece , ali trazi se drugi format datuma
                let tempNiz = datum.split(".");
                let stringDana = tempNiz[0];
                if (stringDana.lenght < 2) {
                    stringDana = "0" + stringDana;
                }
                datum = stringDana + "/" + stringMjeseca + "/" + tempNiz[2];

            }

            if (isZauzetTermin(zauzece, trenutniMjesec)) {

                // validacija klijentske strane 

                // dodati slucaj rezervacije za raspust
                window.alert("Nije moguće rezervisati salu " + zauzece.naziv + " za navedeni datum " + datum + " i termin od "
                    + zauzece.pocetak + " do " + zauzece.kraj + "!");
            }

            else {

                // mozemo rezervisati
                let ajax = new XMLHttpRequest();
                odobrenaRezervacija = true;


                ajax.onreadystatechange = function () {
                    if (this.readyState == 4 && (this.status == 200 || this.status == 250 || this.status == 270)) {
                        JSONzauzeca = JSON.parse(ajax.responseText);

                        console.log("status", this.status);

                        let sala = document.getElementById("sala").value;
                        let pocetak = document.getElementById("pocetak").value;
                        let kraj = document.getElementById("kraj").value;

                        Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
                        //              Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
                        Kalendar.obojiZauzeca(htmlRef, trenutniMjesec, sala, pocetak, kraj);
                        listaZauzeca = [];
                        prilagodiUcitavanje(listaZauzeca, JSONzauzeca.vanredna, JSONzauzeca.periodicna);

                        switch (this.status) {
                            case 270:
                                alert("Nije moguće rezervisati salu " + sala + " za navedeni datum " + datum +
                                    " i termin od " + pocetak + " do " + kraj + "!");
                                break;

                            case 250:

                                let prviDan = new Date(trenutnaGodina, trenutniMjesec - 1, zauzece.dan).getDay();
                                alert("Nije moguće rezervisati salu " + sala + " periodicno u " + sedmica[prviDan] + ", " +
                                    getSemestar(trenutniMjesec) + " semestar, u vrijeme od " + pocetak + " do " + kraj + "!");
                                break;
                        }
                    };

                }
                ajax.open("POST", "/http://localhost:8080/html/rezervacija.html", true);
                ajax.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                ajax.send(JSON.stringify(zauzece));

            }
        }

        function isZauzetTermin(zauzece, trenutniMjesec) {
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

        return {

            ucitaj: ucitajImpl,
            rezervisi: rezervisiImpl
        }

    }
}());






