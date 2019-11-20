const datumFormat = "dd.mm.yyyy";
const brojDana = 7;

const mjeseci = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];
const dani = ["PON", "UTO", "SRI", "ČET", "PET", "SUB", "NED"];
const zimski = [9, 10, 11, 0];
const ljetni = [1, 2, 3, 4];

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

let Kalendar = (function () {

    var trenutniDatum = new Date();
    var trenutniMjesec = trenutniDatum.getMonth();
    var listaZauzeca = [];
    var filterLista = [];

    var nazivForma = document.getElementById("sala");
    var periodicnaForma = document.getElementById("periodicna");
    var pocetakForma = document.getElementById("pocetak");
    var krajForma = document.getElementById("kraj");

    var pocetakPretrage = "09:00";
    var krajPretrage = "15:00";
    var htmlRef = "kalendar";
    var periodicna = true;
    var nazivSale = "0-01";
    var mjesec = trenutniMjesec;


    // privatni atributi

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {



        filterLista = listaZauzeca;
        filtriraj();

        console.log("zauzeca", listaZauzeca);
        console.log("filter", filterLista);

        this.mjesec = mjesec;
        htmlRef = kalendarRef;

       
        if (document.querySelector("." + kalendarRef).firstChild){
            ocisti(kalendarRef);
            Kalendar.iscrtajKalendar(htmlRef, trenutniMjesec);
        }
            
        

        filterLista.forEach(element => {
            var trenutni;
            var vanredniMjesec;
            if (element.datum != undefined) {
                vanredniMjesec = parseInt(element.datum.split(".")[1]);

                if (vanredniMjesec != null && trenutniMjesec == vanredniMjesec) {
                    // u pitanju je vanredno zauzece
                    var dan = parseInt(element.datum.split(".")[0]);

                    var selekcija = ".item:nth-child(" + dan + ") :nth-child(2)";
                    trenutni = document.querySelector(selekcija);
                    trenutni.setAttribute("class", "zauzeta");
                }
            }

            else {

                if (element.dan == undefined) return;                   // uslov moramo navesti jer mogu zalutati vanredni drugih mjeseci...

                var semestar = zimski;
                if (element.semestar == "ljetni") semestar = ljetni;


                if (semestar.indexOf(trenutniMjesec) >= 0) {

                    var selekcija = ".item:nth-child(" + element.dan + ") :nth-child(2)";

                    trenutni = document.querySelector(selekcija);
                    trenutni.setAttribute("class", "zauzeta");
                }
            }

        });

    }

    function ucitajPodatkeImpl(periodicna, vanredna) {


        listaZauzeca = [];
        vanredna.forEach(element => {
            listaZauzeca.push(element);
        });

        periodicna.forEach(element => {

            var brojDanaMjeseca = new Date(trenutniDatum.getFullYear(), trenutniMjesec + 1, 0).getDate();
            for (var i = element.dan; i <= brojDanaMjeseca; i += 7) {

                var trenutna = new periodicnaZauzeca(i, element.semestar, element.pocetak, element.kraj, element.naziv, element.kraj);
                listaZauzeca.push(trenutna);
            }
        });

    }

    // funkcija za brisanje djece
    function ocisti(element) {

        const roditelj = document.querySelector("." + element);
        while (roditelj.firstChild) {
            roditelj.removeChild(roditelj.firstChild);
        }

    }

    function prilagodiVrijeme(vrijeme) {

        var elementiVrmena = vrijeme.split(":");
        var noviSati = elementiVrmena[0];

        if (elementiVrmena[2] == "PM") {
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

    nazivForma.addEventListener("change", function () {

        nazivSale = nazivForma.value;

        Kalendar.obojiZauzeca(htmlRef, mjesec, nazivSale, pocetakPretrage, krajPretrage);
    });


    periodicnaForma.addEventListener("change", function () {

        periodicna = periodicnaForma.checked;
        Kalendar.obojiZauzeca(htmlRef, mjesec, nazivSale, pocetakPretrage, krajPretrage);
    });

    // kupimo vrijednosti vremena za pretragu rezervacija
    pocetakForma.addEventListener("change", function () {
        pocetakPretrage = prilagodiVrijeme(pocetakForma.value);
        Kalendar.obojiZauzeca(htmlRef, mjesec, nazivSale, pocetakPretrage, krajPretrage);

    });

    krajForma.addEventListener("change", function () {
        krajPretrage = prilagodiVrijeme(krajForma.value);
        Kalendar.obojiZauzeca(htmlRef, mjesec, nazivSale, pocetakPretrage, krajPretrage);
    });

    function filtriraj() {


        filterLista = listaZauzeca.filter(function (element) {
            
            var result = porediVrijeme(element.pocetak, krajPretrage) <= 0 && porediVrijeme(pocetakPretrage, element.kraj) <= 0
                && element.naziv == nazivForma.value;

        /*    if (periodicnaForma.checked) {                                  // trazimo li periodicne
                result = result && element.dan != undefined;                // moraju imati definisan pocetni dan
            }
            else {
                result = result && element.dan == undefined;
            }

            */                      // ukoliko koristimo i checkbox za pretragu...
            return result;
        });
    }

    // Prethodni i sljedeci button

    document.getElementById("prethodni").addEventListener("click", function () {
        if (trenutniMjesec > 0) {
            trenutniMjesec--;
            ocisti("kalendar");
            Kalendar.iscrtajKalendar("kalendar", trenutniMjesec);

            Kalendar.obojiZauzeca(htmlRef, mjesec, nazivSale, pocetakPretrage, krajPretrage);
        }

    });

    document.getElementById("sljedeci").addEventListener("click",
        function () {
            if (trenutniMjesec < 11) {
                trenutniMjesec++;
                ocisti("kalendar");
                Kalendar.iscrtajKalendar("kalendar", trenutniMjesec);
                Kalendar.obojiZauzeca(htmlRef, mjesec, nazivSale, pocetakPretrage, krajPretrage);
            }

        });

    function iscrtajKalendarImpl(kalendarRef, mjesec) {
     
        var nazivMjeseca = document.createElement("div");
        nazivMjeseca.setAttribute("class", "mjesec");
        nazivMjeseca.innerText = mjeseci[mjesec];
        document.querySelector("." + kalendarRef).appendChild(nazivMjeseca);

        var nazivDana = document.createElement("div");
        nazivDana.setAttribute("class", "danSedmice");
        document.querySelector("." + kalendarRef).appendChild(nazivDana);

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
        document.querySelector("." + kalendarRef).appendChild(datum);

        for (var i = 0; i < brojDanaMjeseca; i++) {

            var dan = document.createElement("div");
            dan.setAttribute("class", "item");
            document.querySelector(".datum").appendChild(dan);


            var broj = document.createElement("div");
            broj.innerText = i + 1;
            var boja = document.createElement("div");
            boja.setAttribute("class", "slobodna");

            document.querySelector(".item:last-child").appendChild(broj);
            document.querySelector(".item:last-child").appendChild(boja);

        }

        datum = document.querySelector(".datum div:first-child");
        datum.style.gridColumn = prviDan;

    }

    return {

        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl
    }


}());


Kalendar.iscrtajKalendar("kalendar", new Date().getMonth());
Kalendar.ucitajPodatke([new periodicnaZauzeca(6, "zimski", "17:30", "22:30", "0-01", "Arslan"), new periodicnaZauzeca(2, "zimski", "12:50", "17:30", "0-01", "Arslan")],
    [new vanrednaZauzeca("05.10.2019.", "12:50", "17:30", "0-01", "Lol"), new vanrednaZauzeca("17.10.2019.", "12:50", "17:30", "0-01", "Lol"), new vanrednaZauzeca("05.09.2019.", "12:50", "17:30", "0-01", "Lol"), new vanrednaZauzeca("05.10.2019.", "12:50", "17:30", "0-01", "Lol")]);
Kalendar.obojiZauzeca("kalendar", 10, "0-01", "11:00", "23:30");