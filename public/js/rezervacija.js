const mjeseci = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];
var selectOsoblje = document.getElementById("osoblje");
var selectSale = document.getElementById("sala");

function ucitajOsoblja() {

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
            osoblje = JSON.parse(xhttp.responseText);

            for (let i = 0; i < osoblje.length; i++) {

                var opcija = document.createElement("option");
                let text = osoblje[i].ime + " " + osoblje[i].prezime + ", " + osoblje[i].uloga;
                opcija.text = text;
                selectOsoblje.add(opcija, selectOsoblje[i])

            }
        }
    };

    xhttp.open("GET", "osoblje", true);
    xhttp.send();
}

function ucitajSale() {
    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
            sale = JSON.parse(xhttp.responseText);

            for (let i = 0; i < sale.length; i++) {

                var opcija = document.createElement("option");
                let text = sale[i].naziv;
                opcija.text = text;
                selectSale.add(opcija, selectSale[i])

            }
        }
    };

    xhttp.open("GET", "sale", true);
    xhttp.send();
}


function ucitajZauzecaIzBaze() {

    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {


            JSONzauzeca = JSON.parse(ajax.responseText);
            Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
              
        }
    };

    ajax.open("GET", "ucitajIzBaze", true);
    ajax.send();
}

function upisiUBazu(zauzece, trenutniMjesec) {

    // kako bi znali pritisnut datum na kalendaru za periodicno zauzece

    let datum = zauzece.datum;
    mjesec = trenutniMjesec + 1;
    let trenutnaGodina = new Date().getFullYear();

    let stringMjeseca = String(mjesec);
    if (mjesec < 10) {
        stringMjeseca = "0" + stringMjeseca;
    }

    if (datum != undefined && datum != null) {

        let pripremaDatum = datum.split(".");
        zauzece.datum = pripremaDatum[0] + ".0" + (parseInt(pripremaDatum[1])) + "." + pripremaDatum[2];
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

            console.log("status", this.status);
            
            JSONzauzeca = JSON.parse(ajax.responseText);

            console.log("json zauzeca", JSONzauzeca)

            Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), trenutniMjesec);
            Kalendar.obojiZauzeca(htmlRef, trenutniMjesec, sala, pocetak, kraj);
      

            switch (this.status) {
                case 270:
                    alert("Salu za navedeni termin je već rezervisao " + JSONzauzeca.predavac);
                    //  ucitajImpl("/json/zauzeca.json");
                    break;

                case 250:

                
                    alert("Salu za navedeni termin je već rezervisao " + JSONzauzeca.predavac);
                    //     ucitajImpl("/json/zauzeca.json");
                    break;                      
                   
            }
        };

    }

    ajax.open("POST", "upisiUBazu", true);
    ajax.setRequestHeader("Content-Type", "application/json; charset=utf-8");

    let trenutniSemestar = zauzece.semestar;
    if (zauzece.semestar !== "ljetni" && zauzece.semestar !== "zimski") {
        trenutniSemestar = "";
    }

    if (zauzece.dan != undefined && trenutniSemestar === "") {
        alert("Nije moguće rezervisati salu " + sala + " periodicno za vrijeme raspusta sa pocetkom od " + pocetak + " do " + kraj + "!");
        //   ucitajImpl("/json/zauzeca.json");
        return;
    }

    ajax.send(JSON.stringify(zauzece));

}

ucitajSale();
ucitajOsoblja();
ucitajZauzecaIzBaze();

window.onclick = e => {

    let element = e.target
    if (element.className === "broj") {


        if (window.confirm("Želite li rezervisati odabrani termin?")) {

            // rezervisemo          

            let sala = document.getElementById("sala").value;
            let periodicna = document.getElementById("periodicna").checked;
            let pocetak = document.getElementById("pocetak").value;
            let kraj = document.getElementById("kraj").value;
            let mjesec = document.querySelector(".mjesec").innerHTML;
            let predavac = document.getElementById("osoblje").value;
            let dan = parseInt(element.innerHTML);
            let brojMjeseca = mjeseci.indexOf(mjesec);
            let trenutnaGodina = new Date().getFullYear();

            let datum = dan + "/" + String(brojMjeseca + 1) + "/" + trenutnaGodina;

            if (element.parentElement.querySelector(":nth-child(2)").className == "zauzeta") {

                // provjera na osnovu odgovarajuce klase zauzeca

                window.alert("Nije moguće rezervisati salu " + sala + " za navedeni datum " + datum + " i termin od "
                    + pocetak + " do " + kraj + "!");
                //     Pozivi.ucitaj("/json/zauzeca.json");          provjeriti ovo
            }

            else {

                // podaci pokupljeni sa forme        
                // validirati podatke unesene sa forme

                if (periodicna) {

                    // periodicno zauzece
                    // semestar novog zauzeca

                    let brojMjeseca = mjeseci.indexOf(mjesec);

                    var semestar;
                    if (brojMjeseca < 1 || brojMjeseca > 8) {
                        semestar = "zimski";
                    }
                    else if (brojMjeseca > 0 && brojMjeseca < 5) {
                        semestar = "ljetni";
                    }

                    // sta ako nema semestar?

                    // provjeriti indeks ovdje da li ide od 1 il 

                    let prviDan = new Date(new Date().getFullYear(), brojMjeseca, 1).getDay();
                    if (prviDan == 0) prviDan = 7;
                    prviDan--;

                    dan = (dan + prviDan - 1) % 7;

                    let periodicnoZauzece = { "dan": dan, "semestar": semestar, "pocetak": pocetak, "kraj": kraj, "naziv": sala, "predavac": predavac };
                    //        Pozivi.rezervisi(periodicnoZauzece, brojMjeseca);
                    upisiUBazu(periodicnoZauzece, brojMjeseca);
                  
                }

                else {

                    // vanredno zauzece
                    let godina = new Date().getFullYear();
                    let stringDana = String(dan);
                    if (dan < 10) {
                        stringDana = "0" + stringDana;
                    }

                    let stringMjeseca = String(brojMjeseca + 1);
                    if (brojMjeseca < 10) {
                        stringMjeseca = "0" + stringMjeseca;
                    }
                    let datum = stringDana + "." + stringMjeseca + "." + String(godina) + ".";
                    let vanrednoZauzece = { "datum": datum, "pocetak": pocetak, "kraj": kraj, "naziv": sala, "predavac": predavac };

                 
                    upisiUBazu(vanrednoZauzece, brojMjeseca);

                 
                    //    Pozivi.rezervisi(vanrednoZauzece, brojMjeseca);
                }
            }
        }
    }

}   