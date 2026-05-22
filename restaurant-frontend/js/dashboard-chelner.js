document.addEventListener('DOMContentLoaded', () => {
    inicializeazaUtilizator();
    incarcaComenziActive();
    
    setInterval(incarcaComenziActive, 10000);
});

function inicializeazaUtilizator() {
    let currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    if (user.role !== 'CHELNER') {
        window.location.href = 'login.html';
        return;
    }
    
    let displayName = user.username;
    let displayEmail = user.email;
    
    if (displayName && (displayName.toLowerCase().includes('bianca') || displayName.toLowerCase().includes('lincă') || displayName.toLowerCase().includes('linca'))) {
        displayName = 'Andrei Popescu';
        displayEmail = 'andrei.popescu@restaurant.com';
    }
    
    document.getElementById('user-display-name').textContent = displayName;
    document.getElementById('profile-username').textContent = displayName;
    document.getElementById('profile-email').textContent = displayEmail;
}

function incarcaComenziActive() {
    const tableBody = document.querySelector('#waiter-active-orders-table tbody');
    
    fetch('http://localhost:8081/api/comenzi/nefinalizate')
        .then(response => {
            if (!response.ok) throw new Error('Eroare la preluarea comenzilor active.');
            return response.json();
        })
        .then(comenzi => {
            document.getElementById('stat-active-waiter-count').textContent = comenzi.length;
            
            if (comenzi.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: #a0aec0; padding: 30px;">
                            Nu există comenzi active în așteptare sau preparare.
                        </td>
                    </tr>
                `;
                return;
            }
            
            let html = '';
            comenzi.forEach(comanda => {
                let statusLabel = '';
                let statusClass = '';
                if (comanda.status === 'IN_ASTEPTARE') {
                    statusLabel = 'În Așteptare';
                    statusClass = 'badge-pending';
                } else if (comanda.status === 'PREPARARE') {
                    statusLabel = '<span class="pulse-dot"></span> În Preparare';
                    statusClass = 'badge-preparing';
                } else {
                    statusLabel = comanda.status;
                    statusClass = 'badge-pending';
                }
                
                const produseStr = formatareProduse(comanda.produse);
                const plataStatus = comanda.nrChitanta ? `<span class="badge badge-served">Plătit #${comanda.nrChitanta}</span>` : `<span class="badge badge-pending">Neplătit</span>`;
                
                html += `
                    <tr>
                        <td><strong>#${comanda.id}</strong></td>
                        <td>
                            <div style="font-weight: 600; color: #2d3748;">${produseStr}</div>
                        </td>
                        <td><strong>${comanda.total.toFixed(2)} lei</strong></td>
                        <td><i class="fa-solid fa-hourglass-half"></i> ${comanda.timpEstimat > 0 ? comanda.timpEstimat + ' min' : 'Nesetat'}</td>
                        <td><span class="badge ${statusClass}">${statusLabel}</span> ${plataStatus}</td>
                        <td style="text-align: center;">
                            <button class="btn btn-secondary" style="padding: 6px 12px;" onclick="incarcaComandaInCautare(${comanda.id})">
                                <i class="fa-solid fa-hand-holding-dollar"></i> Încasează
                            </button>
                        </td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
        })
        .catch(error => {
            console.error(error);
            showToast('Eroare la preluarea comenzilor active de pe server.', 'error');
        });
}

function formatareProduse(produse) {
    if (!produse || produse.length === 0) return 'Meniu personalizat';
    return produse.map(p => {
        const nume = p.produs ? p.produs.nume : 'Produs';
        return `${p.cantitate}x ${nume}`;
    }).join(', ');
}

function incarcaComandaInCautare(id) {
    document.getElementById('search-order-id').value = id;
    cautaComanda();
    document.getElementById('search-order-id').scrollIntoView({ behavior: 'smooth' });
}

function cautaComanda() {
    const idInput = document.getElementById('search-order-id');
    const idVal = parseInt(idInput.value);
    
    if (isNaN(idVal) || idVal <= 0) {
        showToast('Introduceți un ID valid pentru comandă!', 'error');
        return;
    }
    
    fetch(`http://localhost:8081/api/comenzi/${idVal}`)
        .then(response => {
            if (response.status === 404) {
                throw new Error(`Comanda #${idVal} nu a fost găsită.`);
            }
            if (!response.ok) throw new Error('Eroare la preluarea comenzii.');
            return response.json();
        })
        .then(comanda => {
            document.getElementById('res-order-id').textContent = comanda.id;
            
            const statusBadge = document.getElementById('res-order-status');
            statusBadge.textContent = comanda.status;
            statusBadge.className = 'badge';
            if (comanda.status === 'IN_ASTEPTARE') statusBadge.classList.add('badge-pending');
            else if (comanda.status === 'PREPARARE') statusBadge.classList.add('badge-preparing');
            else if (comanda.status === 'SERVITA') statusBadge.classList.add('badge-served');
            
            // Produse list
            const productsList = document.getElementById('res-products-list');
            productsList.innerHTML = '';
            if (comanda.produse && comanda.produse.length > 0) {
                comanda.produse.forEach(p => {
                    const nume = p.produs ? p.produs.nume : 'Produs';
                    const li = document.createElement('li');
                    li.textContent = `${p.cantitate} x ${nume} (${p.produs ? p.produs.pret.toFixed(2) : 0} lei/buc)`;
                    productsList.appendChild(li);
                });
            } else {
                productsList.innerHTML = '<li>Fără preparate asociate.</li>';
            }
            
            // Total price
            document.getElementById('res-total-price').textContent = `${comanda.total.toFixed(2)} lei`;
            
            const receiptP = document.getElementById('res-receipt-p');
            const receiptNr = document.getElementById('res-receipt-nr');
            const paymentBox = document.getElementById('payment-processing-box');
            const paidBox = document.getElementById('already-paid-box');
            
            if (comanda.nrChitanta) {
                receiptP.style.display = 'block';
                receiptNr.textContent = `#${comanda.nrChitanta}`;
                paymentBox.style.display = 'none';
                paidBox.style.display = 'flex';
            } else {
                receiptP.style.display = 'none';
                paymentBox.style.display = 'block';
                paidBox.style.display = 'none';
            }
            
            document.getElementById('search-result-box').style.display = 'block';
            showToast(`Comanda #${comanda.id} a fost încărcată.`, 'info');
        })
        .catch(error => {
            console.error(error);
            document.getElementById('search-result-box').style.display = 'none';
            showToast(error.message || 'Eroare la căutarea comenzii.', 'error');
        });
}

function proceseazaPlata() {
    const idVal = parseInt(document.getElementById('res-order-id').textContent);
    const metodaRadio = document.querySelector('input[name="payment-method"]:checked');
    
    if (isNaN(idVal) || idVal <= 0) {
        showToast('Eroare: Comandă invalidă selectată.', 'error');
        return;
    }
    
    const metoda = metodaRadio.value;
    
    fetch(`http://localhost:8081/api/comenzi/${idVal}/plata`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metodaPlata: metoda })
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text); });
        }
        return response.text();
    })
    .then(responseText => {
        showToast(responseText, 'success');
        
        cautaComanda();
        incarcaComenziActive();
    })
    .catch(error => {
        console.error(error);
        showToast(error.message || 'Eroare la procesarea plății.', 'error');
    });
}

/* Toast Utilities */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    toastMessage.textContent = message;
    toast.className = 'toast show';
    
    if (type === 'success') {
        toast.classList.add('toast-success');
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    } else if (type === 'error') {
        toast.classList.add('toast-error');
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-xmark"></i>';
    } else {
        toast.classList.add('toast-info');
        toastIcon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
    }
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}
