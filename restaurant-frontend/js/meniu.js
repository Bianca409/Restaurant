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
    document.getElementById('produse-view').hidden = false;
    document.getElementById('titlu-categorie').textContent = numeCategorie;

    randeazaProduse(meniuGlobal[numeCategorie] || []);
}

function inapoiLaCategorii() {
    document.getElementById('produse-view').hidden = true;
    document.getElementById('categorii-view').style.display = 'grid';
}

function randeazaProduse(produse) {
    const grid = document.getElementById('produse-grid');
    grid.innerHTML = '';

    if (produse.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fa-solid fa-plate-wheat"></i>Nu există produse momentan.</div>';
        return;
    }

    produse.forEach(produs => {
        let tagsHTML = '';
        if (produs.detalii) {
            if (produs.detalii.vegetarian) {
                tagsHTML += `<span class="badge available"><i class="fa-solid fa-leaf"></i> Vegetarian</span>`;
            }
            if (produs.detalii.picant) {
                tagsHTML += `<span class="badge waiter"><i class="fa-solid fa-fire"></i> Picant</span>`;
            }
        }

        const produsString = JSON.stringify(produs).replace(/"/g, '&quot;');

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div>
                <div class="product-header">
                    <strong class="product-name" style="font-size:16px">${produs.nume}</strong>
                    <strong class="product-price" style="color:var(--primary); font-size:18px">${produs.pret} lei</strong>
                </div>
                <div class="tags" style="margin-top: 15px;">
                    ${tagsHTML}
                </div>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" style="flex: 1;" onclick="deschideModal('${produsString}')">
                    Detalii
                </button>
                <button class="btn btn-primary" style="flex: 1;" onclick="adaugaInCos(${produs.id})">
                    <i class="fa-solid fa-plus"></i>
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
        if (detalii.vegetarian) tagsHTML += `<span class="badge available"><i class="fa-solid fa-leaf"></i> Vegetarian</span>`;
        if (detalii.picant) tagsHTML += `<span class="badge waiter"><i class="fa-solid fa-fire"></i> Picant</span>`;
    }
    document.getElementById('modal-tags').innerHTML = tagsHTML;

    document.getElementById('detalii-modal').hidden = false;
}

function inchideModal() {
    document.getElementById('detalii-modal').hidden = true;
}

const COS_ID_CURENT = 1;

function adaugaInCos(produsId) {
    fetch('http://localhost:8081/api/cos/adauga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosId: COS_ID_CURENT, produsId: produsId, cantitate: 1 })
    }).then(response => {
        if(response.ok) alert('Produsul a fost adăugat în coș!');
    }).catch(error => console.error('Eroare:', error));
}