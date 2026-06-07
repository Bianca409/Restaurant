const COS_ID_CURENT = 1;

document.addEventListener('DOMContentLoaded', () => {
    incarcaCos();
});

function incarcaCos() {
    fetch(`http://localhost:8081/api/cos/${COS_ID_CURENT}`)
        .then(response => {
            if (!response.ok) throw new Error('Eroare la preluarea coșului');
            return response.json();
        })
        .then(cos => {
            randeazaCos(cos.produse || []);
        })
        .catch(error => {
            console.error(error);
            document.getElementById('cart-items-container').innerHTML = `
                <tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-basket-shopping"></i>Cosul tau este gol momentan.</div></td></tr>
            `;
            document.getElementById('cart-summary').style.display = 'none';
        });
}

function randeazaCos(produseItem) {
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    const totalSpan = document.getElementById('cart-total');

    container.innerHTML = '';
    let totalSuma = 0;

    if (produseItem.length === 0) {
        container.innerHTML = `
            <tr><td colspan="5"><div class="empty-state"><i class="fa-solid fa-basket-shopping"></i>Cosul tau este gol momentan.</div></td></tr>
        `;
        summary.style.display = 'none';
        return;
    }

    produseItem.forEach(item => {
        const produs = item.produs;
        const subtotal = produs.pret * item.cantitate;
        totalSuma += subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${produs.nume}</strong></td>
            <td>${produs.pret} lei</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button class="icon-btn" style="width: 28px; height: 28px;" onclick="modificaCantitate(${produs.id}, -1)"><i class="fa-solid fa-minus"></i></button>
                    <strong>${item.cantitate}</strong>
                    <button class="icon-btn" style="width: 28px; height: 28px;" onclick="modificaCantitate(${produs.id}, 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
            </td>
            <td><strong style="color: var(--ink);">${subtotal} lei</strong></td>
            <td style="text-align: right;">
                <button class="icon-btn danger" onclick="stergeProdus(${produs.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        container.appendChild(tr);
    });

    totalSpan.textContent = totalSuma + ' lei';
    summary.style.display = 'flex';
}

function modificaCantitate(produsId, schimbare) {
    fetch('http://localhost:8081/api/cos/adauga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosId: COS_ID_CURENT, produsId: produsId, cantitate: schimbare })
    }).then(response => {
        if(response.ok) incarcaCos();
    });
}

function stergeProdus(produsId) {
    fetch(`http://localhost:8081/api/cos/${COS_ID_CURENT}/produs/${produsId}`, {
        method: 'DELETE'
    }).then(response => {
        if(response.ok) {
            incarcaCos();
        } else {
            alert('A apărut o eroare la ștergerea produsului.');
        }
    });
}

function plaseazaComanda() {
    fetch('http://localhost:8081/api/comenzi/plaseaza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cosId: COS_ID_CURENT })
    }).then(response => {
        if (!response.ok) throw new Error('Eroare');
        return response.json();
    }).then(() => {
        alert('Comanda a fost plasată cu succes!');
        incarcaCos();
    });
}