let valgtPlass = null;

// Lag plasser med egendefinert posisjon (x og y)
const plasser = [

    // Store rom //

    { id: 'Kontor-A', x: 132, y: 6, width: 102, height: 77, opptatt: true },
    { id: 'Kontor-B', x: 235, y: 6, width: 102, height: 77, opptatt: false },
    { id: 'Kontor-C', x: 336, y: 6, width: 97, height: 77, opptatt: false },

    // RAD 1 // Mellomrom mellom hver (plassene i midten) (74x på store mellomrom og 59x på små)

    { id: 'Kontor-1', x: 187, y: 151, width: 57, height: 44, opptatt: false },
    { id: 'Kontor-2', x: 246, y: 151, width: 57, height: 44, opptatt: false },

    { id: 'Kontor-3', x: 323, y: 151, width: 57, height: 44, opptatt: false },
    { id: 'Kontor-4', x: 380, y: 151, width: 57, height: 44, opptatt: false },

    { id: 'Kontor-5', x: 454, y: 151, width: 57, height: 44, opptatt: true },
    { id: 'Kontor-6', x: 513, y: 151, width: 57, height: 44, opptatt: false },

    // RAD 2 //

    { id: 'Kontor-7', x: 187, y: 195, width: 57, height: 44, opptatt: false },
    { id: 'Kontor-8', x: 246, y: 195, width: 57, height: 44, opptatt: false },

    { id: 'Kontor-9', x: 323, y: 195, width: 57, height: 44, opptatt: false },
    { id: 'Kontor-10', x: 380, y: 195, width: 57, height: 44, opptatt: false },

    { id: 'Kontor-11', x: 454, y: 195, width: 57, height: 44, opptatt: false },
    { id: 'Kontor-12', x: 513, y: 195, width: 57, height: 44, opptatt: false },

    // RAD 3 //

    { id: 'Kontor-13', x: 323, y: 269, width: 57, height: 44, opptatt: false },
    { id: 'Kontor-14', x: 380, y: 269, width: 57, height: 44, opptatt: true },

    { id: 'Kontor-15', x: 323, y: 310, width: 57, height: 44, opptatt: false },
    { id: 'Kontor-16', x: 380, y: 310, width: 57, height: 44, opptatt: false },


];

document.addEventListener('DOMContentLoaded', function() {
    // Her lager vi alle de valgrutene til kartet (logikken altså)
  
    plasser.forEach(plass => {
        CREATE_Valgrute(plass);
        // document.getElementById('Kontor-A').classList.add('opptatt');
    });
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