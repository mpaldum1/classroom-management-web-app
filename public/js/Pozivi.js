let Pozivi = (function () {

    var htmlRef;
    var listaZauzeca = [];

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

    function ucitajImpl(zauzeca) {

        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                JSONzauzeca = JSON.parse(xhttp.responseText);

                Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
            }
        };

        xhttp.open("GET", zauzeca, true);
        xhttp.send();
    }


    function rezervisiImpl(zauzece, trenutniMjesec) {

        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {

                JSONzauzeca = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
                prilagodiUcitavanje(listaZauzeca, JSONzauzeca.vanredna, JSONzauzeca.periodicna);

                // kupimo aktuelno stanje iz zauzecea.json

                if (isZauzetTermin(zauzece)) {

                    let datum = zauzece.datum;
                    trenutniMjesec = trenutniMjesec + 1;

                    if (datum == undefined) {
                        // periodicno je zauzece - pronalazimo datum

                        let godina = new Date().getFullYear();
                        datum = zauzece.dan + "/" + trenutniMjesec + "/" + godina;

                    }

                    else {

                        // vanredno zauzece , ali trazi se drugi format datuma
                        let tempNiz = datum.split(".");
                        datum = tempNiz[0] + "/" + trenutniMjesec + "/" + tempNiz[2];

                    }

                    window.alert("Nije moguće rezervisati salu " + zauzece.naziv + " za navedeni datum " + datum + " i termin od "
                        + zauzece.pocetak + " do " + zauzece.kraj + "!");
                }

                else {

                    // mozemo rezervisati
                }


            }
        };

        xhttp.open("GET", "/json/zauzeca.json", true);
        xhttp.send();

    }

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {


    }


    function isZauzetTermin(zauzece) {

        // provjera da li je vec termin zauzet

        let prilagodjenaPeriodicna = [];

        if (zauzece.dan != null) {

            // u pitanju je redovno zauzece
            // prilagođavamo zauzece

            if (!isRegularnoRedovnoZauzece(zauzece)) {
                // nije regularno zauzece
                return;
            }

            for (var i = zauzece.dan; i <= 31; i += 7) {        // ukoliko je broj dana manji, ignorise se ostatak

                // popunjavamo listu zauzeca za svaku sedmicu u navedenom terminu

                var trenutna = new periodicnaZauzeca(i, zauzece.semestar, zauzece.pocetak, zauzece.kraj, zauzece.naziv, zauzece.predavac);
                prilagodjenaPeriodicna.push(trenutna);
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

            listaZauzeca.forEach(element => {

                // ubaciti provjeru zauzeca prije trenutnog datuma... 

                // formiramo datume za provjeru prilikom poredjenja

                let datumElementa = new Date(trenutnaGodina, trenutniMjesec, element.dan);
                if (element.datum != undefined) {

                    let datumNiz = element.datum.split(".");
                    datumElementa = new Date(datumNiz[2], datumNiz[1], datumNiz[0]);
                }

                let datumElementaZauzeca = new Date(trenutnaGodina, trenutniMjesec, elementZauzeca.dan);

                if (elementZauzeca.dan == undefined) {
                    let datumNiz = elementZauzeca.datum.split(".");
                    datumElementaZauzeca = new Date(datumNiz[2], datumNiz[1], datumNiz[0]);
                }

                let result = datumElementaZauzeca.getTime() == datumElementa.getTime() && porediVrijeme(element.pocetak, elementZauzeca.kraj) <= 0 &&
                    porediVrijeme(elementZauzeca.pocetak, element.kraj) <= 0 && element.naziv == elementZauzeca.naziv;

                if (result) {
                    flag = true;
                    console.log("preklapanje!");
                    // imamo preklapanje;
                    // return ne radi u situaciji foreach petlje - mozda optimizovati kasnije...
                }

            });

        });

        return flag;
    }

    function prilagodiUcitavanje(listaZauzeca, vanredna, periodicna) {

        vanredna.forEach(element => {
            listaZauzeca.push(new vanrednaZauzeca(element.datum, element.pocetak, element.kraj, element.naziv, element.predavac));
        });

        periodicna = periodicna.filter(element => {                   
            return isRegularnoRedovnoZauzece(element);
        });

        periodicna.forEach(element => {
            for (var i = element.dan; i <= 31; i += 7) {        // ukoliko je broj dana manji, ignorise se 
                
                 // popunjavamo listu zauzeca za svaku sedmicu u navedenom terminu 

                 // provjeriti radi li za svaki mjesec u navedenom semestru...

                var trenutna = new periodicnaZauzeca(i, element.semestar, element.pocetak, element.kraj, element.naziv, element.predavac);
                listaZauzeca.push(trenutna);
            }
        });
    }

    function isRegularnoRedovnoZauzece(element) {

        var result = element.dan >= 0;                             //da li je regularno periodicno zauzece - validacija
        result = result && (element.semestar == "zimski" || element.semestar == "ljetni");
        var vrijeme = element.pocetak;
        result = result && vrijeme.includes(":") && parseInt(vrijeme.substring(0, 2)) != undefined
            && parseInt(vrijeme.substring(3, 5)) != undefined;

        vrijeme = element.kraj;
        result = result && vrijeme.includes(":") && parseInt(vrijeme.substring(0, 2)) != undefined
            && parseInt(vrijeme.substring(3, 5)) != undefined;

        return result;
    }



    return {

        obojiZauzeca: obojiZauzecaImpl,
        ucitaj: ucitajImpl,
        rezervisi: rezervisiImpl
    }


}());

// funkcija za poredjenje vremena - ispraviti DRY mozda
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




