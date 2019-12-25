var htmlRef;

let Pozivi = (function () {

   

    // privatni atributi

    function ucitajImpl(zauzeca) {

            let xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    JSONzauzeca = JSON.parse(xhttp.responseText);

                    console.log(JSONzauzeca);
                    Kalendar.ucitajPodatke(JSONzauzeca.periodicna, JSONzauzeca.vanredna);
                }
            };

            xhttp.open("GET", zauzeca , true);
            xhttp.send();
        }
    

    function iscrtajKalendarImpl(kalendarRef, mjesec) {

       
    }

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {


    }

    return {

        obojiZauzeca: obojiZauzecaImpl,
        ucitaj: ucitajImpl,
        iscrtajKalendar: iscrtajKalendarImpl,
    }


}());




