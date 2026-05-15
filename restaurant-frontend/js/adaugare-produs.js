const addProductForm = document.getElementById('addProductForm');
const categorieSelect = document.getElementById('categorie');
const spirtoasaDiv = document.getElementById('spirtoasa-div');
const mesajRaspuns = document.getElementById('mesajRaspuns');

// Arătăm bifa de "Spirtoasă" doar dacă alegem categoria BAUTURA
categorieSelect.addEventListener('change', function() {
    if (this.value === 'BAUTURA') {
        spirtoasaDiv.style.display = 'flex';
    } else {
        spirtoasaDiv.style.display = 'none';
        document.getElementById('spirtoasa').checked = false;
    }
});

addProductForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Construim obiectul conform cerințelor ManagerController din backend
    const dateProdus = {
        categorie: document.getElementById('categorie').value,
        nume: document.getElementById('nume').value,
        pret: document.getElementById('pret').value,
        ingrediente: document.getElementById('ingrediente').value,
        vegetarian: document.getElementById('vegetarian').checked,
        picant: document.getElementById('picant').checked,
        spirtoasa: document.getElementById('spirtoasa').checked
    };

    fetch('http://localhost:8081/api/manager/meniu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dateProdus)
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Eroare la salvarea produsului.');
    })
    .then(data => {
        mesajRaspuns.textContent = "Produsul " + data.nume + " a fost adăugat cu succes!";
        mesajRaspuns.style.color = "green";
        addProductForm.reset();
        spirtoasaDiv.style.display = 'none';
    })
    .catch(error => {
        mesajRaspuns.textContent = error.message;
        mesajRaspuns.style.color = "red";
    });
});