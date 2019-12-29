
var index = 1;

var galerija = document.querySelector(".galerija");
var nizElemenataSlika = [];
var maxIndex = 10

// niz koristimo prilikom cache-iranja

if (index == 1) {
    document.getElementById("prethodni").disabled = true;
}

for (let i = 0; i < 3; i++) {

    nizElemenataSlika.push(galerija.children[i].alt + ".jpg");
}

console.log(nizElemenataSlika);
// pocetno ucitavnanje  

function eventPrethodni() {
    Pozivi.pritisnutPrethodni();

}

function eventSljedeci() {

    Pozivi.dobaviSliku(nizElemenataSlika);
   console.log(index);

}