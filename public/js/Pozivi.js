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

                let sala = document.getElementById("sala").value;
                let pocetak = document.getElementById("pocetak").value;
                let kraj = document.getElementById("kraj").value;
                let prviDan = new Date(trenutnaGodina, trenutniMjesec - 1, zauzece.dan).getDay();

                let ajax = new XMLHttpRequest();
                odobrenaRezervacija = true;

                ajax.onreadystatechange = function () {
                    if (this.readyState == 4 && (this.status == 200 || this.status == 250 || this.status == 270)) {
                        JSONzauzeca = JSON.parse(ajax.responseText);

                        console.log("status", this.status);


                        Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
                        Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
                        Kalendar.obojiZauzeca(htmlRef, trenutniMjesec, sala, pocetak, kraj);

                        listaZauzeca = [];
                        prilagodiUcitavanje(listaZauzeca, JSONzauzeca.vanredna, JSONzauzeca.periodicna);

                        switch (this.status) {
                            case 270:
                                alert("Nije moguće rezervisati salu " + sala + " za navedeni datum " + datum +
                                    " i termin od " + pocetak + " do " + kraj + "!");
                                break;

                            case 250:

                            console.log(trenutniMjesec);
                                alert("Nije moguće rezervisati salu " + sala + " periodicno u " + sedmica[prviDan] + ", " +
                                    getSemestar(trenutniMjesec) + " semestar, u vrijeme od " + pocetak + " do " + kraj + "!");
                                break;
                        }
                    };

                }
                ajax.open("POST", "/http://localhost:8080/html/rezervacija.html", true);
                ajax.setRequestHeader("Content-Type", "application/json; charset=utf-8");

                let trenutniSemestar = zauzece.semestar;
                if(zauzece.semestar !== "ljetni" && zauzece.semestar!== "zimski") {
                    trenutniSemestar = "";
                }
                console.log(trenutniSemestar);

                if (zauzece.dan != undefined && trenutniSemestar === "") {
                    alert("Nije moguće rezervisati salu " + sala + " periodicno za vrijeme raspusta sa pocetkom od " + pocetak + " do " + kraj + "!");
                    return;
                }

                ajax.send(JSON.stringify(zauzece));
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






