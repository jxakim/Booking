// ------------------------------------------- Dato Konfigurering ------------------------------------------------- //

// Få tak i dagen i dag og sett den til dagen om 6 dager (fra i dag)
let currentDate = new Date();
currentDate.setDate(currentDate.getDate() + 6);

// Formater dem og sett max og min til 7 dager max og min til i dag
document.getElementById("datePicker").max = currentDate.toISOString().substr(0, 10);
document.getElementById("datePicker").min = new Date().toISOString().substr(0, 10);

// --------------------------------------------------------------------------------------------- //

const datePicker = document.getElementById("datePicker");

let valgtDato = document.getElementById("datePicker").value;

datePicker.addEventListener('change', function() {
    valgtDato = this.value;

    document.getElementById("kart").style.visibility = "hidden";

    UPDATE_Kart(valgtDato);
});



let valgtPlass = null;

// Lag plasser med egendefinert posisjon (x og y)
const plasser = [

    // Store rom //

    { id: 'Plass-1', x: 132, y: 6, width: 102, height: 77, opptatt: false },
    { id: 'Plass-2', x: 235, y: 6, width: 102, height: 77, opptatt: false },
    { id: 'Plass-3', x: 336, y: 6, width: 97, height: 77, opptatt: false },

    // RAD 1 // Mellomrom mellom hver (plassene i midten) (74x på store mellomrom og 59x på små)

    { id: 'Plass-4', x: 187, y: 151, width: 57, height: 44, opptatt: false },
    { id: 'Plass-5', x: 246, y: 151, width: 57, height: 44, opptatt: false },

    { id: 'Plass-6', x: 323, y: 151, width: 57, height: 44, opptatt: false },
    { id: 'Plass-7', x: 380, y: 151, width: 57, height: 44, opptatt: false },

    { id: 'Plass-8', x: 454, y: 151, width: 57, height: 44, opptatt: false },
    { id: 'Plass-9', x: 513, y: 151, width: 57, height: 44, opptatt: false },

    // RAD 2 //

    { id: 'Plass-10', x: 187, y: 195, width: 57, height: 44, opptatt: false },
    { id: 'Plass-11', x: 246, y: 195, width: 57, height: 44, opptatt: false },

    { id: 'Plass-12', x: 323, y: 195, width: 57, height: 44, opptatt: false },
    { id: 'Plass-13', x: 380, y: 195, width: 57, height: 44, opptatt: false },

    { id: 'Plass-14', x: 454, y: 195, width: 57, height: 44, opptatt: false },
    { id: 'Plass-15', x: 513, y: 195, width: 57, height: 44, opptatt: false },

    // RAD 3 //

    { id: 'Plass-16', x: 323, y: 269, width: 57, height: 44, opptatt: false },
    { id: 'Plass-17', x: 380, y: 269, width: 57, height: 44, opptatt: false },

    { id: 'Plass-18', x: 323, y: 310, width: 57, height: 44, opptatt: false },
    { id: 'Plass-19', x: 380, y: 310, width: 57, height: 44, opptatt: false },


];



document.addEventListener('DOMContentLoaded', function() {
    // Oppdater kartet
});


// Funksjon for å lage valgrutene
function CREATE_Valgrute (plass) {
    const kart = document.getElementById('kart');
    const valgText = document.getElementById('valgt-plass');

    // Lag div for valgrutene
    const valgRute = document.createElement('div');

    // Config for diven 
    valgRute.id = plass.id;
    valgRute.classList.add('plass');
    valgRute.style.left = plass.x + 'px';
    valgRute.style.top = plass.y + 'px';
    valgRute.style.width = plass.width + 'px';
    valgRute.style.height = plass.height + 'px';
    kart.parentNode.appendChild(valgRute);

    if (plass.opptatt) {
        document.getElementById(plass.id).classList.add('opptatt');
    } else {
        console.log("test");
        // Legg til lyttere så ruta reagerer når man hoverer over div elementet

        valgRute.addEventListener('mouseover', function() {
            valgRute.classList.add('hover');
            valgText.textContent = `Valgt plass: ${plass.id}`;
        });

        valgRute.addEventListener('mouseout', function() {
            valgRute.classList.remove('hover');

            if (valgtPlass) {
                valgText.textContent = 'Valgt plass: ' + valgtPlass;
            } else {
                valgText.textContent = 'Valgt plass: ingen';
            }
        });

        // Og her når man faktisk trykker
        valgRute.addEventListener('mousedown', function() {
            const valgruter = document.querySelectorAll('.plass');

            valgruter.forEach(function(element) {
                element.classList.remove('selected');
            });

            if (valgtPlass == plass.id) {
                valgtPlass = null;
            } else {
                valgtPlass = plass.id;
                valgRute.classList.add('selected');
                valgText.textContent = `Valgt plass: ${plass.id}`;
            }
        });
    }
}

function UPDATE_Kart(dato) {
    // connect med databasen for å sjekke alle ledige plasser
    fetch('/ledige-plasser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dato: dato })
    })
    .then(response => response.json())
    .then(data => {
        data.result.forEach((i) => {
            console.log(i.Navn);

            const entry = plasser.find(entry => entry.id === i.Navn);

            if (entry) {
                entry.opptatt = true;
            }
        });
    })
    .catch(error => console.error('Error:', error));

    // Her lager vi alle de valgrutene til kartet (logikken altså)
    plasser.forEach(plass => {
        CREATE_Valgrute(plass);
    });
}