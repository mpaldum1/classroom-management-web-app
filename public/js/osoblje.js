let trenutniDan = new Date().getDate();
let trenutniMjesec = new Date().getMonth() + 1;
let trenutnaGodina = new Date().getFullYear();

var trenutnoVrijeme = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds();
var trenutniDatum = "";

if (trenutniDan < 10) trenutniDatum += "0" + trenutniDan + ".";
else trenutniDatum += trenutniDan + ".";

if (trenutniMjesec < 10) trenutniDatum += "0" + trenutniMjesec + "." + trenutnaGodina;
else trenutniDatum += trenutniMjesec + "." + trenutnaGodina;


let prviDan = new Date().getDay() % 7;
if (prviDan == 0) prviDan = 7;
prviDan--;

var lista = [];

// pronasli smo datum, trenutno vrijeme i dan u sedmici sto ce nam biti potrebno za nasu pretragu

function iscrtajTabelu(lista) {

    const tijeloTabele = document.getElementById("tijelo");
    while (tijeloTabele.firstChild) {
        tijeloTabele.firstChild.remove();
    }
    
    for (var i = 0; i < lista.length; i++) {

        var red = document.createElement("tr");

        var osoba = document.createElement("td");
        osoba.setAttribute("class", "text-left");
        osoba.innerText = lista[i].osoba;

        var sala = document.createElement("td");
        sala.setAttribute("class", "text-left");
        sala.innerText = lista[i].sala;

        red.appendChild(osoba);
        red.appendChild(sala);

        tijeloTabele.appendChild(red);
    }
}

function ucitajOsobeIzBaze() {

    let ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            let result = JSON.parse(ajax.responseText);
            let JSONzauzeca = result.zauzeca;

            for (let i = 0; i < JSONzauzeca.vanredna.length; i++) {

                //vanredno
                if (trenutniDatum == JSONzauzeca.vanredna[i].datum &&
                    JSONzauzeca.vanredna[i].pocetak <= trenutnoVrijeme && trenutnoVrijeme <= JSONzauzeca.vanredna[i].kraj) {

                    lista.push({ osoba: JSONzauzeca.vanredna[i].predavac, sala: JSONzauzeca.vanredna[i].naziv });
                }
            }

            for (let i = 0; i < JSONzauzeca.periodicna.length; i++) {

                if (prviDan == JSONzauzeca.periodicna[i].dan && getSemestar(new Date().getMonth()) == JSONzauzeca.periodicna[i].semestar &&
                    JSONzauzeca.periodicna[i].pocetak <= trenutnoVrijeme && trenutnoVrijeme <= JSONzauzeca.periodicna[i].kraj) {

                    lista.push({ osoba: JSONzauzeca.periodicna[i].predavac, sala: JSONzauzeca.periodicna[i].naziv });
                }
                // periodicno
            }

            let osobe = result.osoblje;
            for (let i = 0; i < osobe.length; i++) {

                let kancelarija = true;

                for (let j = 0; j < lista.length; j++) {
                    if (osobe[i].ime + " " + osobe[i].prezime === lista[j].osoba)
                        kancelarija = false;
                }

                if (kancelarija) {
                    lista.push({ osoba: osobe[i].ime + " " + osobe[i].prezime, sala: "U kancelariji" });
                }
            }

            iscrtajTabelu(lista);
            lista = [];
        }
    }

    ajax.open("GET", "ucitajOsobe", true);
    ajax.send();

}

ucitajOsobeIzBaze();
setInterval(ucitajOsobeIzBaze, 30000);

// okidamo svakih 30 sekundi

const zimski = [9, 10, 11, 0];
const ljetni = [1, 2, 3, 4, 5];

// funckija pronalaska semestra
function getSemestar(mjesec) {

    if (zimski.includes(mjesec)) {
        return "zimski";
    }
    else if (ljetni.includes(mjesec)) {
        return "ljetni";
    }
    return "";
    // nemamo semestar
}
