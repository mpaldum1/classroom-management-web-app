var htmlRef;
var pocetnaPeriodicna;
var pocetnaVanredna;

let Kalendar = (function () {

    const brojDana = 7;
    const mjeseci = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];
    const dani = ["PON", "UTO", "SRI", "ČET", "PET", "SUB", "NED"];
    const zimski = [9, 10, 11, 0];
    const ljetni = [1, 2, 3, 4];

    trenutniDatum = new Date();
    trenutniMjesec = trenutniDatum.getMonth();
    var listaZauzeca = [];
    var filterLista = [];


    pocetakPretrage = "09:00";
    krajPretrage = "13:00";
    nazivSale = "1-11";

    function periodicnaZauzeca(dan, semestar, pocetak, kraj, naziv, predavac) {
        this.dan = dan;
        this.semestar = semestar;
        this.pocetak = pocetak;
        this.kraj = kraj;
        this.naziv = naziv;
        this.predavac = predavac;
    }

    function vanrednaZauzeca(datum, pocetak, kraj, naziv, predavac) {
        this.datum = datum;
        this.pocetak = pocetak;
        this.kraj = kraj;
        this.naziv = naziv;
        this.predavac = predavac;
    }


    // privatni atributi

    function ucitajPodatkeImpl(periodicna, vanredna) {

        listaZauzeca = [];
        pocetnaPeriodicna = periodicna;
        pocetnaVanredna = vanredna;

        var trenutnaGodina = new Date().getFullYear();
        let prviDan = new Date(trenutnaGodina, trenutniMjesec, 1).getDay();
        if (prviDan == 0) prviDan = 7;
        prviDan--;

        vanredna = vanredna.filter(element => {

            //filtriranje neregularnih parametara - vanredna

            var datum = element.datum;
            var result = datum.includes(".") && parseInt(datum.substring(0, 2)) != NaN
                && parseInt(datum.substring(3, 5)) != NaN && parseInt(datum.substring(7, 11)) != NaN;

            var vrijeme = element.pocetak;
            result = result && vrijeme.includes(":") && parseInt(vrijeme.substring(0, 2)) != NaN
                && parseInt(vrijeme.substring(3, 5)) != NaN;

            vrijeme = element.kraj;
            result = result && vrijeme.includes(":") && parseInt(vrijeme.substring(0, 2)) != NaN
                && parseInt(vrijeme.substring(3, 5)) != NaN;

            return result;
        });

        vanredna.forEach(element => {
            listaZauzeca.push(new vanrednaZauzeca(element.datum, element.pocetak, element.kraj, element.naziv, element.predavac));
        });


        periodicna = periodicna.filter(element => {
            return (isRegularnoRedovnoZauzece(element));
        });


        periodicna.forEach(element => {
            var i;
            if (element.dan >= prviDan) {
                i = element.dan - prviDan + 1;
            }
            else {
                i = element.dan + 8 - prviDan;
            }

            for (; i <= 31; i += 7) {        // ukoliko je broj dana manji, ignorise se ostatak

                var trenutna = new periodicnaZauzeca(i, element.semestar, element.pocetak, element.kraj, element.naziv, element.predavac);
                listaZauzeca.push(trenutna);
            }
        });

    }

    function filtriraj() {



        filterLista = listaZauzeca.filter(function (element) {
            console.log("sala", element.naziv, nazivSale);
            var result = pocetakPretrage < krajPretrage &&
            element.pocetak < krajPretrage && pocetakPretrage < element.kraj
                && element.naziv == nazivSale;

            return result;
        });
    }

    function iscrtajKalendarImpl(kalendarRef, mjesec) {

        if (kalendarRef.firstChild)
            ocisti(kalendarRef);

        trenutniMjesec = mjesec;
        var nazivMjeseca = document.createElement("div");
        nazivMjeseca.setAttribute("class", "mjesec");
        nazivMjeseca.innerText = mjeseci[mjesec];
        kalendarRef.appendChild(nazivMjeseca);

        var nazivDana = document.createElement("div");
        nazivDana.setAttribute("class", "danSedmice");
        kalendarRef.appendChild(nazivDana);

        for (var i = 0; i < brojDana; i++) {
            var trenutniDan = document.createElement("div");
            trenutniDan.innerText = dani[i];
            document.querySelector(".danSedmice").appendChild(trenutniDan);
        }

        var trenutnaGodina = new Date().getFullYear();
        var brojDanaMjeseca = new Date(trenutnaGodina, mjesec + 1, 0).getDate();
        var prviDan = new Date(trenutnaGodina, mjesec, 1).getDay();
        if (prviDan == 0) prviDan = 7;

        var datum = document.createElement("div");
        datum.setAttribute("class", "datum");
        kalendarRef.appendChild(datum);

        for (var i = 0; i < brojDanaMjeseca; i++) {

            var dan = document.createElement("div");
            dan.setAttribute("class", "item");
            document.querySelector(".datum").appendChild(dan);


            var broj = document.createElement("div");
            broj.setAttribute("class", "broj");
            broj.innerText = i + 1;
            var boja = document.createElement("div");
            boja.setAttribute("class", "slobodna");

            document.querySelector(".item:last-child").appendChild(broj);
            document.querySelector(".item:last-child").appendChild(boja);

        }

        datum = document.querySelector(".datum div:first-child");
        datum.style.gridColumn = prviDan;

    }

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {


        trenutniMjesec = mjesec
        nazivSale = sala;
        pocetakPretrage = pocetak;
        krajPretrage = kraj;
        htmlRef = kalendarRef;


        filterLista = listaZauzeca;                                       // vrsimo pretragu
        filtriraj();


        if (kalendarRef.firstChild) {                                     // ako je kalendar vec iscrtan
            ocisti(kalendarRef);
            iscrtajKalendarImpl(kalendarRef, trenutniMjesec);
        }

        var brojDanaMjeseca = new Date(trenutniDatum.getFullYear(), trenutniMjesec + 1, 0).getDate();

        filterLista.forEach(element => {

            var trenutni;
            var vanredniMjesec;

            if (element.datum != undefined) {                                 // u pitanju je vanredno zauzece
                vanredniMjesec = parseInt(element.datum.split(".")[1] - 1);


                if (vanredniMjesec != null && trenutniMjesec == vanredniMjesec) {
                    var dan = parseInt(element.datum.split(".")[0]);

                    if (dan > brojDanaMjeseca) return;
                    var selekcija = ".item:nth-child(" + dan + ") :nth-child(2)";
                    trenutni = document.querySelector(selekcija);
                    trenutni.setAttribute("class", "zauzeta");
                }
            }

            else {


                if (element.dan == undefined) return;                   // dodatni uslov - mogu zalutati vanredne drugih mjeseci...

                var semestar = zimski;
                if (element.semestar == "ljetni") semestar = ljetni;


                if (semestar.indexOf(trenutniMjesec) >= 0) {

                    if (element.dan > brojDanaMjeseca) return;
                    var selekcija = ".item:nth-child(" + String(element.dan) + ") :nth-child(2)";

                    trenutni = document.querySelector(selekcija);
                    trenutni.setAttribute("class", "zauzeta");
                }
            }

        });

    }

    // funkcija za poredjenje vremena
    function porediVrijeme(prvo, drugo) {

        var elementiPrvog = prvo.split(":");
        var elementiDrugog = drugo.split(":");

        var prviDatum = new Date("01/01/2000");                 // proizvoljne vrijednosti
        var drugiDatum = new Date("01/01/2000");

        prviDatum.setHours(elementiPrvog[0]);
        prviDatum.setMinutes(elementiPrvog[1]);
        drugiDatum.setHours(elementiDrugog[0]);
        drugiDatum.setMinutes(elementiDrugog[1]);

        if (prviDatum < drugiDatum) {
            return -1;
        }
        else if (prviDatum == drugiDatum) {
            return 0;
        }
        else {
            return 1;
        }
    }

    function isRegularnoRedovnoZauzece(element) {

        var result = element.dan >= 0;                             //filtriranje neregularnih parametara - periodicna
        result = result && (element.semestar == "zimski" || element.semestar == "ljetni");
        var vrijeme = element.pocetak;
        result = result && vrijeme.includes(":") && parseInt(vrijeme.substring(0, 2)) != undefined
            && parseInt(vrijeme.substring(3, 5)) != undefined;

        vrijeme = element.kraj;
        result = result && vrijeme.includes(":") && parseInt(vrijeme.substring(0, 2)) != undefined
            && parseInt(vrijeme.substring(3, 5)) != undefined;

        return result;
    }

    function init() {

        var element = document.getElementById("kalendar");
        htmlRef = element;
        iscrtajKalendarImpl(element, new Date().getMonth());

        // hardkodirane pocetne vrijednosti
        /* 
               ucitajPodatkeImpl([{ dan: 6, semestar: "zimski", pocetak: "17:30", kraj: "22:30", naziv: "0-01", predavac: "Jason" },
               { dan: 2, semestar: "zimski", pocetak: "12:50", kraj: "17:30", naziv: "0-01", predavac: "Keiko" },
               { dan: 3, semestar: "ljetni", pocetak: "09:30", kraj: "22:30", naziv: "EE1", predavac: "Phil" }],
                [{ datum: "05.10.2019.", pocetak: "12:50", kraj: "17:30", naziv: "0-01", predavac: "Kirk" },
                { datum: "17.10.2019.", pocetak: "13:50", kraj: "18:30", naziv: "0-01", predavac: "James" },
                { datum: "05.09.2019.", pocetak: "12:50", kraj: "17:30", naziv: "0-01", predavac: "Lars" },
                { datum: "20.10.2019.", pocetak: "11:50", kraj: "21:30", naziv: "0-01", predavac: "Serj" },
                { datum: "21.10.2019.", pocetak: "11:30", kraj: "20:30", naziv: "EE1", predavac: "Roberto" }]); */

        obojiZauzecaImpl(element, trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);
    }

    return {

        inicijalizuj: init,
        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl,
        porediVrijeme: porediVrijeme,
        periodicnaZauzeca: periodicnaZauzeca,
        vanrednaZauzeca: vanrednaZauzeca,
        isRegularnoRedovnoZauzece: isRegularnoRedovnoZauzece
    }


}());

Kalendar.inicijalizuj();

function eventPrethodni() {

    if (trenutniMjesec > 0) {
        trenutniMjesec--;
        Kalendar.ucitajPodatke(pocetnaPeriodicna, pocetnaVanredna);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);
    }

}

function eventSljedeci() {
    if (trenutniMjesec < 11) {
        trenutniMjesec++;
        Kalendar.ucitajPodatke(pocetnaPeriodicna, pocetnaVanredna);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);
    }

}

function eventSala(vrijednost) {
    nazivSale = vrijednost;
    Kalendar.obojiZauzeca(htmlRef, trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);
}


function eventPeriodicna(vrijednost) {

    periodicna = vrijednost;
    Kalendar.obojiZauzeca(htmlRef, trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);
}

// kupimo vrijednosti vremena za pretragu rezervacija
function eventPocetak(vrijednost) {
    pocetakPretrage = prilagodiVrijeme(vrijednost);
    Kalendar.obojiZauzeca(htmlRef, trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);

}

function eventKraj(vrijednost) {
    krajPretrage = prilagodiVrijeme(vrijednost);
    Kalendar.obojiZauzeca(htmlRef, trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);
}

// funkcija za brisanje djece
function ocisti(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }

}

// vrijeme predstavljamo u formatu 0-24
function prilagodiVrijeme(vrijeme) {

    var elementiVrmena = vrijeme.split(":");
    var noviSati = elementiVrmena[0];

    if (elementiVrmena[2] == "PM" && noviSati > 12) {
        noviSati = toString(parseInt(noviSati) + 12)
    }
    return noviSati + ":" + elementiVrmena[1];

}




