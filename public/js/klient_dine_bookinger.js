// ------------------------------------------- Event Listeners ------------------------------------------------- //

document.addEventListener('DOMContentLoaded', async function() {
    const bookinger = (await GET_Bookinger()).bookinger;

    for (const key in bookinger) {
        const Raw_PlassID = bookinger[key].PlassID;


        const booking_element = document.createElement("div");
        booking_element.classList.add("booking-element");
        booking_element.id = Raw_PlassID;

        // Lag innhold til diven

        const overskrift = document.createElement("h2");
        overskrift.textContent = `Plass-${Raw_PlassID}`;
        booking_element.appendChild(overskrift);

        const id = document.createElement("p");
        id.textContent = `${(bookinger[key].Dato).split("T")[0]}`;
        booking_element.appendChild(id);

        const avbook = document.createElement("a");
        avbook.textContent = "Avbook";
        avbook.addEventListener("click", () => {
            Avbook(Raw_PlassID);
        });
        booking_element.appendChild(avbook);

        document.getElementById("bookinger-container").appendChild(booking_element);
    }
});


// ------------------------------------------- Funksjoner ------------------------------------------------- //


// Funksjon for å få tak i alle bookinger fra brukeren
async function GET_Bookinger() {
    return fetch('/get-alle-bookinger', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Avbooking funksjon

function Avbook(plass) {
    const plassID = plass;

    fetch('/avbook-plass', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ PlassID: plassID })
    })
    .then(response => {
        if (response.ok) {
            const i = document.getElementById(plassID);
            if (i) {
                document.getElementById("bookinger-container").removeChild(i);
            }
        } else {
            console.error('Feil under avbooking av plass.');
        }
    })
    .catch(error => console.error('Error:', error));
}
