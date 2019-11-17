const datumFormat = "dd.mm.yyyy";
const trenutniDatum = new Date();
const brojDana = 7;

const mjeseci = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];
const dani = ["PON", "UTO", "SRI", "ĆET", "PET", "SUB", "NED"];

function periodicnsZauzeca(dan, semestar, pocetak, kraj, naziv, predavac) {

}

function vanrednaZauzeca(datum, pocetak, kraj, naziv, predavac) {

}

let Kalendar = (function () {
    //
    //ovdje idu privatni atributi
    //
    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {
        //implementacija ide ovdje
    }
    function ucitajPodatkeImpl(periodicna, redovna) {
        //implementacija ide ovdje
    }

    (function iscrtajKalendar(kalendarRef, mjesec) {

        var nazivMjeseca = document.createElement("div");
        nazivMjeseca.setAttribute("class", "mjesec");
        nazivMjeseca.innerText = mjeseci[mjesec];
        document.querySelector("."+ kalendarRef).appendChild(nazivMjeseca);

        var nazivDana = document.createElement("div");
        nazivDana.setAttribute("class", "danSedmice");
        document.querySelector("."+ kalendarRef).appendChild(nazivDana);

        for(var i = 0; i < brojDana; i++){
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
            // ovdje popunjavati ovisno o stanju sale na datum
            
            document.querySelector(".item:last-child").appendChild(broj);
            document.querySelector(".item:last-child").appendChild(boja);

        }
     
        datum  = document.querySelector(".datum div:first-child");
        datum.style.gridColumn = prviDan;

    })("kalendar", 0);
    return {

        //  obojiZauzeca: obojiZauzecaImpl,
        //  ucitajPodatke: ucitajPodatkeImpl,
        //  iscrtajKalendar: iscrtajKalendarImpl
    }

}());