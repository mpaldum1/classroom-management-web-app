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

                            //  ucitajImpl("/json/zauzeca.json");
                            break;

                        case 250:

                            console.log(trenutniMjesec);
                            alert("Nije moguće rezervisati salu " + sala + " periodicno u " + sedmica[prviDan] + ", " +
                                getSemestar(trenutniMjesec) + " semestar, u vrijeme od " + pocetak + " do " + kraj + "!");
                            //     ucitajImpl("/json/zauzeca.json");
                            break;
                    }
                };

            }
            ajax.open("POST", "/http://localhost:8080/html/rezervacija.html", true);
            ajax.setRequestHeader("Content-Type", "application/json; charset=utf-8");

            let trenutniSemestar = zauzece.semestar;
            if (zauzece.semestar !== "ljetni" && zauzece.semestar !== "zimski") {
                trenutniSemestar = "";
            }
            console.log(trenutniSemestar);

            if (zauzece.dan != undefined && trenutniSemestar === "") {
                alert("Nije moguće rezervisati salu " + sala + " periodicno za vrijeme raspusta sa pocetkom od " + pocetak + " do " + kraj + "!");
                //   ucitajImpl("/json/zauzeca.json");
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

        var index = 1;
        var maxIndex = 10
        var brojacSlika = 0;

        function dobaviSliku(nizElemenataSlika) {

            var url = '/http://localhost:8080/html/pocetna.html';

            if (brojacSlika <= maxIndex) {

                $.ajax({
                    url: url,
                    type: "POST",
                    data: { lista: nizElemenataSlika },
                    dataType: "json",

                    success: function (response_data_json) {



                        nizElemenataSlika.filter(element => undefined);

                        // pokupili smo potrebne slike
                        view_data = response_data_json;

                        nizElemenataSlika.push(view_data[0], view_data[1], view_data[2]);
                        console.log(view_data);
                        if (view_data.lenght > 3)
                            maxIndex = view_data[3];

                        index += 3;
                        if(brojacSlika == maxIndex)
                        brojacSlika  -= 3;

                        document.getElementById("prethodni").disabled = false;


                        let djecaGalerije = document.querySelector(".galerija").children

                        if (index > maxIndex)
                            index = maxIndex;


                        for (let i = 0; i < 3; i++) {

                            djecaGalerije[i].src = "/Galerija/" + nizElemenataSlika[index + i - 1];
                            console.log("/Galerija/" + nizElemenataSlika[index + i - 1]);

                            djecaGalerije[i].alt = "slika" + String(index + i);
                            if (i + index == maxIndex) {
                                document.getElementById("sljedeci").disabled = true;
                            }
                        }
                        console.log("slike", nizElemenataSlika);

                        console.log("INDEX", index);
                        console.log("maxIndex", maxIndex);

                        if (view_data.includes("kraj") && index > maxIndex) {
                            document.getElementById("sljedeci").disabled = true;
                            //  trenutniIndexZandnjePrikazaneSlike += view_data.length - 1;
                        }
                        console.log(view_data);
                        //   prikaziSlike(view_data); //Proslijedimo podatke funkciji
                    },

                    failure: function (response_data_json) {
                          index += 3;
                    }
                });
            }


        }

        function pritisnutPrethodni() {
            // ne dobavljamo slike - imamo ih vec na raspolaganju

            document.getElementById("sljedeci").disabled = false;

            let djecaGalerije = galerija.children;

            if (index < 4) {
                index = 4;
            }

            console.log(index);

            for (let i = 0; i < 3; i++) {


                djecaGalerije[i].src = "/Galerija/slika" + String(index - 3 + i) + ".jpg";
                djecaGalerije[i].alt = "slika" + String(index - 3 + i);

                if (index - 3 + i == 1)
                    document.getElementById("prethodni").disabled = true;
            }

            index -= 3;
            console.log("index", index);

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
            rezervisi: rezervisiImpl,
            dobaviSliku: dobaviSliku,
            pritisnutPrethodni: pritisnutPrethodni,
            prilagodi: prilagodiUcitavanje,
        }

    }
}());






