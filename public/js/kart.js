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

// ------------------------------------------- Event Listeners ------------------------------------------------- //


book_knapp.addEventListener('click', function() {
    plassid = document.getElementById("valgt-plass").textContent.split(" ")[2];
    if (plassid != "ingen") {
        BOOK_Plass(plassid, valgtDato);
    }
});

datePicker.addEventListener('change', function() {
    valgtDato = this.value;

    UPDATE_Kart(valgtDato, "");
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("melding").style.color = "orange";
    document.getElementById("melding").textContent = "Velg en dato for å booke.";
    document.getElementById("kart").style.visibility = "hidden";
});

// ------------------------------------------- Funskjoner ------------------------------------------------- //

// Funksjon som resetter valgrutene sine dataer (klasser)
function RESET_plasser() {
    document.getElementById('valgt-plass').textContent = "Valgt plass: ingen";
    document.getElementById("melding").textContent = "";
    document.getElementById("melding").style.color = "red";

    plasser.forEach(plass => {
        plass.opptatt = false;
    });

    const valgruter = document.querySelectorAll('.plass');
    valgruter.forEach(rute => {
        rute.remove();
    });
}

// Funksjon for laging av en valgrute
function CREATE_Valgrute(plass) {
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

// Funksjon for å løkke igjennom og lage alle rutene
function CREATE_Valgruter() {
    // Her lager vi alle de valgrutene til kartet (logikken altså)
    plasser.forEach(plass => {
        CREATE_Valgrute(plass);
    });
}

// Denne funksjonen oppdaterer kartet basert på dato knyttet opp mot databasen
async function UPDATE_Kart(dato, positive_response) {
    const har_booket = await GET_Bruker_Booket(dato);

    if (har_booket) {
        RESET_plasser();
        document.getElementById("kart").style.visibility = "hidden";

        if (positive_response == "") {
            document.getElementById("melding").textContent = "Du har allerede booket en plass for denne dagen. Sjekk dine bookinger siden for å avbooke.";
        } else {
            document.getElementById("melding").style.color = "lightgreen";
            document.getElementById("melding").textContent = positive_response;
        }
    } else {
        document.getElementById("melding").textContent = "";
        document.getElementById("kart").style.visibility = "visible";

        RESET_plasser();

        // connect med databasen for å sjekke alle ledige plasser
        fetch('/get-ledige-plasser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dato: dato })
        })
        .then(response => response.json())
        .then(data => {
            data.result.forEach((i) => {
                const index = plasser.findIndex(entry => entry.id === i.Navn);

                if (index !== -1) {
                    plasser[index].opptatt = true;
                }
            });

            CREATE_Valgruter();
        })
        .catch(error => console.error('Error:', error));
    }
}

// Funksjon for å registrere en booking opp mot databasen
function BOOK_Plass(plassid, dato) {
    fetch('/book-plass', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ PlassID: plassid.split("-")[1], dato: dato })
    })
    .then(response => {
        if (response.ok) {
            UPDATE_Kart(dato, "Plass booket! Se dine bookinger for å administrere.");
        } else {
            console.error('Feil under booking av plass.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Funksjon for å sjekke opp med database om brukeren har allerede booket for en dato
function GET_Bruker_Booket(dato) {
    return new Promise((resolve, reject) => {
        fetch('/sjekk-bruker-booket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ Dato: dato })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            resolve(data.har_booket); // Resolve with true or false
        })
        .catch(error => {
            console.error('Error:', error);
            reject(error); // Reject the promise in case of error
        });
    });
}

