var htmlRef;

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
    nazivSale = "0-01";

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

        vanredna.forEach(element => {
            listaZauzeca.push(new vanrednaZauzeca(element.datum, element.pocetak, element.kraj, element.naziv, element.predavac));
        });

        periodicna.forEach(element => {
            return element.dan <= 0;                //zabrana unosa nedozvoljenih parametara
        });

        periodicna.forEach(element => {
            for (var i = element.dan; i <= 31; i += 7) {        // ukoliko je broj dana manji, ignorise se ostatak

                var trenutna = new periodicnaZauzeca(i, element.semestar, element.pocetak, element.kraj, element.naziv, element.predavac);
                listaZauzeca.push(trenutna);
            }
        });

    }

    function filtriraj() {

        filterLista = listaZauzeca.filter(function (element) {
        
            var result = pocetakPretrage < krajPretrage
                && porediVrijeme(element.pocetak, krajPretrage) <= 0 && porediVrijeme(pocetakPretrage, element.kraj) <= 0
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

            if (element.datum != undefined) {                        // u pitanju je vanredno zauzece
                vanredniMjesec = parseInt(element.datum.split(".")[1]);

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
                    var selekcija = ".item:nth-child(" + element.dan + ") :nth-child(2)";

                    trenutni = document.querySelector(selekcija);
                    trenutni.setAttribute("class", "zauzeta");
                }
            }

        });

    }

    function init() {

        // hardkodirane pocetne vrijednosti

        var element = document.getElementById("kalendar");
        htmlRef = element;
        iscrtajKalendarImpl(element, new Date().getMonth());

        ucitajPodatkeImpl([{ dan: 6, semestar: "zimski", pocetak: "17:30", kraj: "22:30", naziv: "0-01", predavac: "Jason" },
        { dan: 2, semestar: "zimski", pocetak: "12:50", kraj: "17:30", naziv: "0-01", predavac: "Keiko" },
        { dan: 3, semestar: "ljetni", pocetak: "09:30", kraj: "22:30", naziv: "EE1", predavac: "Phil" }],
            [{ datum: "05.10.2019.", pocetak: "12:50", kraj: "17:30", naziv: "0-01", predavac: "Kirk" },
            { datum: "17.10.2019.", pocetak: "13:50", kraj: "18:30", naziv: "0-01", predavac: "James" },
            { datum: "05.09.2019.", pocetak: "12:50", kraj: "17:30", naziv: "0-01", predavac: "Lars" },
            { datum: "05.10.2019.", pocetak: "11:50", kraj: "21:30", sala: "0-01", predavac: "Serj" },
            { datum: "21.10.2019.", pocetak: "12:30", kraj: "20:30", naziv: "EE1", predavac: "Roberto" }]);

        obojiZauzecaImpl(element, trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);
    }

    return {

        inicijalizuj: init,
        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl,

    }


}());

Kalendar.inicijalizuj();

function eventPrethodni() {
    console.log("pozvan sam");
    if (trenutniMjesec > 0) {
        trenutniMjesec--;
        console.log("trenutniMjesec", trenutniMjesec);
        Kalendar.obojiZauzeca(document.getElementById("kalendar"), trenutniMjesec, nazivSale, pocetakPretrage, krajPretrage);
    }

}

function eventSljedeci() {
    if (trenutniMjesec < 11) {
        trenutniMjesec++;
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


