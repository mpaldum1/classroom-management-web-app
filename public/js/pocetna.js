nizElemenataSlika = [];
var index = 1;
var galerija = document.querySelector(".galerija");

if (index == 1) {
    document.getElementById("prethodni").disabled = true;
}

function eventPrethodni() {
 
    
    document.getElementById("sljedeci").disabled = false;
    
    Pozivi.dobaviSlike(false, index);

    let djecaGalerije = galerija.children;

    if (index < 4) {
        index = 4;
    }

    for (let i = 0; i < 3; i++) {
        djecaGalerije[i].src = "/Galerija/slika" + String(index - 3 + i) + ".jpg";
        djecaGalerije[i].alt = "slika" + String(index - 3 + i);

        if(index - 3 + i == 1)
        document.getElementById("prethodni").disabled = true;
    }

    index -= 3;   

}

function eventSljedeci() {

    index += 3;
    document.getElementById("prethodni").disabled = false;

    Pozivi.dobaviSlike(true, index);
    let djecaGalerije = galerija.children

    if (index > 8) 
        index = 8;

    for (let i = 0; i < 3; i++) {
        djecaGalerije[i].src = "/Galerija/slika" + String(index + i) + ".jpg";
        djecaGalerije[i].alt = "slika" + String(index + i);
        if(i + index == 10) {
            document.getElementById("sljedeci").disabled = true;
        }
    }
   
}