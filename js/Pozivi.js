var htmlRef;

let Pozivi = (function () {

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

    }

    function iscrtajKalendarImpl(kalendarRef, mjesec) {

       
    }

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {


    }

    return {
        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl,
    }


}());




