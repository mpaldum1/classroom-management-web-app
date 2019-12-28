
const mjeseci = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];

Pozivi.ucitaj("/json/zauzeca.json");

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
            let dan = parseInt(element.innerHTML);
            let brojMjeseca = mjeseci.indexOf(mjesec);
            let trenutnaGodina = new Date().getFullYear();

            let datum = dan + "/" + String(brojMjeseca + 1) + "/" + trenutnaGodina;

            if (element.parentElement.querySelector(":nth-child(2)").className == "zauzeta") {

                // provjera na osnovu odgovarajuce klase zauzeca

                window.alert("Nije moguće rezervisati salu " + sala + " za navedeni datum " + datum + " i termin od "
                    + pocetak + " do " + kraj + "!");
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
                    else if (brojMjeseca > 0 && brojMjeseca < 6) {
                        semestar = "ljetni";
                    }
                    // sta ako nema semestar?

                    // provjeriti indeks ovdje da li ide od 1 il 

                    let prviDan = new Date(new Date().getFullYear(), brojMjeseca, 1).getDay();
                    if (prviDan == 0) prviDan = 7;
                    prviDan--;

                    dan = (dan + prviDan - 1) % 7;

                    let periodicnoZauzece = { "dan": dan, "semestar": semestar, "pocetak": pocetak, "kraj": kraj, "naziv": sala, "predavac": "Mano" };
                    Pozivi.rezervisi(periodicnoZauzece, brojMjeseca);
                }

                else {

                    // vanredno zauzece
                    let godina = new Date().getFullYear();
                    let stringDana = String(dan);
                    if (dan < 10) {
                        stringDana = "0" + stringDana;
                    }

                    let stringMjeseca = String(brojMjeseca);
                    if (brojMjeseca < 10) {
                        stringMjeseca = "0" + stringMjeseca;
                    }
                    let datum = stringDana + "." + stringMjeseca + "." + String(godina) + ".";
                    let vanrednoZauzece = { "datum": datum, "pocetak": pocetak, "kraj": kraj, "naziv": sala, "predavac": "Mano" };


                    Pozivi.rezervisi(vanrednoZauzece, brojMjeseca);
                }
            }
        }
    }

}   