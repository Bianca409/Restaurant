let meniuGlobal = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:8081/api/meniu')
        .then(response => response.json())
        .then(data => {
            meniuGlobal = data;
            actualizeazaNumarProduse();
        })
        .catch(error => console.error('Eroare la preluarea meniului:', error));
});

function actualizeazaNumarProduse() {
    document.getElementById('count-Aperitive').textContent = `${meniuGlobal["Aperitive"]?.length || 0} produse disponibile`;
    document.getElementById('count-Feluri-Principale').textContent = `${meniuGlobal["Feluri Principale"]?.length || 0} produse disponibile`;
    document.getElementById('count-Bauturi-Spirtoase').textContent = `${meniuGlobal["Bauturi Spirtoase"]?.length || 0} produse disponibile`;
    document.getElementById('count-Bauturi-Nespirtoase').textContent = `${meniuGlobal["Bauturi Nespirtoase"]?.length || 0} produse disponibile`;
}

function deschideCategorie(numeCategorie) {
    document.getElementById('categorii-view').style.display = 'none';
    document.getElementById('produse-view').style.display = 'block';
    document.getElementById('titlu-categorie').textContent = numeCategorie;

    randeazaProduse(meniuGlobal[numeCategorie] || []);
}

function inapoiLaCategorii() {
    document.getElementById('produse-view').style.display = 'none';
    document.getElementById('categorii-view').style.display = 'block';
}

function randeazaProduse(produse) {
    const grid = document.getElementById('produse-grid');
    grid.innerHTML = '';

    if (produse.length === 0) {
        grid.innerHTML = '<p>Nu există produse momentan în această categorie.</p>';
        return;
    }

    produse.forEach(produs => {
        let tagsHTML = '';
        if (produs.detalii) {
            if (produs.detalii.vegetarian) {
                tagsHTML += `<span class="tag-veg"><i class="fa-solid fa-leaf"></i> Vegetarian</span>`;
            }
            if (produs.detalii.picant) {
                tagsHTML += `<span class="tag-picant"><i class="fa-solid fa-fire"></i> Picant</span>`;
            }
        }

        const produsString = JSON.stringify(produs).replace(/"/g, '&quot;');

        const card = document.createElement('div');
        card.className = 'produs-card';
        card.innerHTML = `
            <div>
                <div class="produs-header">
                    <div class="produs-nume">${produs.nume}</div>
                    <div class="produs-pret">${produs.pret} lei</div>
                </div>
                <div class="produs-tags">
                    ${tagsHTML}
                </div>
            </div>
            <div class="produs-actions">
                <button class="btn-detalii" onclick="deschideModal('${produsString}')">
                    <i class="fa-solid fa-circle-info"></i> Detalii
                </button>
                <button class="btn-adauga" onclick="adaugaInCos(${produs.id})">
                    <i class="fa-solid fa-cart-shopping"></i> Adaugă
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function deschideModal(produsDataStr) {
    const produs = JSON.parse(produsDataStr);

    document.getElementById('modal-titlu').textContent = produs.nume;

    const detalii = produs.detalii;
    let ingredienteText = "Fără ingrediente listate.";
    if (detalii && detalii.listaIngrediente && detalii.listaIngrediente.length > 0) {
        ingredienteText = detalii.listaIngrediente.join(', ');
    }
    document.getElementById('modal-ingrediente').textContent = ingredienteText;

    let tagsHTML = '';
    if (detalii) {
        if (detalii.vegetarian) tagsHTML += `<span class="tag-veg"><i class="fa-solid fa-leaf"></i> Vegetarian</span> &nbsp;`;
        if (detalii.picant) tagsHTML += `<span class="tag-picant"><i class="fa-solid fa-fire"></i> Picant</span>`;
    }
    document.getElementById('modal-tags').innerHTML = tagsHTML;

    document.getElementById('detalii-modal').style.display = 'flex';
}

function inchideModal() {
    document.getElementById('detalii-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('detalii-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function adaugaInCos(produsId) {
    console.log("S-a apăsat adaugă pentru produsul ID: ", produsId);
    alert('Produsul a fost adăugat (în curând va funcționa și cu baza de date!).');
}