let produseMeniu = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializeazaUtilizator();
    incarcaComenziActive();
    incarcaProduseMeniu();
    
    setInterval(() => {
        const activeTab = document.querySelector('.tab-btn.active').id;
        if (activeTab === 'tab-orders') {
            incarcaComenziActive();
        }
    }, 10000);
});

function inicializeazaUtilizator() {
    let currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        const mockUser = {
            username: "personal_bucatarie",
            role: "PERSONAL",
            email: "bucatarie@restaurant.com"
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        currentUser = JSON.stringify(mockUser);
        document.getElementById('mock-login-banner').style.display = 'block';
    }
    
    const user = JSON.parse(currentUser);
    let displayName = user.username;
    
    if (user && user.username === "personal_bucatarie") {
        document.getElementById('mock-login-banner').style.display = 'block';
    }
    
    document.getElementById('user-display-name').textContent = displayName;
}

function switchTab(tabName) {
    document.getElementById('tab-orders').classList.remove('active');
    document.getElementById('tab-menu').classList.remove('active');
    document.getElementById('section-orders').style.display = 'none';
    document.getElementById('section-menu').style.display = 'none';
    
    if (tabName === 'orders') {
        document.getElementById('tab-orders').classList.add('active');
        document.getElementById('section-orders').style.display = 'block';
        incarcaComenziActive();
    } else {
        document.getElementById('tab-menu').classList.add('active');
        document.getElementById('section-menu').style.display = 'block';
        incarcaProduseMeniu();
    }
}

function incarcaComenziActive() {
    const tableBody = document.querySelector('#kitchen-orders-table tbody');
    
    fetch('http://localhost:8081/api/comenzi/nefinalizate')
        .then(response => {
            if (!response.ok) throw new Error('Eroare la preluarea comenzilor active.');
            return response.json();
        })
        .then(comenzi => {
            if (comenzi.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: #a0aec0; padding: 40px;">
                            Nu există comenzi active în așteptare sau preparare!
                        </td>
                    </tr>
                `;
                return;
            }
            
            let html = '';
            comenzi.forEach(comanda => {
                let statusLabel = '';
                let statusClass = '';
                let actiuneButon = '';
                
                if (comanda.status === 'IN_ASTEPTARE') {
                    statusLabel = 'În Așteptare';
                    statusClass = 'badge-pending';
                    actiuneButon = `
                        <button class="btn btn-success" onclick="schimbaStatus(${comanda.id}, 'PREPARARE')">
                            <i class="fa-solid fa-play"></i> Începe Prepararea
                        </button>
                    `;
                } else if (comanda.status === 'PREPARARE') {
                    statusLabel = '<span class="pulse-dot"></span> În Preparare';
                    statusClass = 'badge-preparing';
                    actiuneButon = `
                        <button class="btn btn-primary" onclick="schimbaStatus(${comanda.id}, 'SERVITA')">
                            <i class="fa-solid fa-circle-check"></i> Finalizează preparatul
                        </button>
                    `;
                } else {
                    statusLabel = comanda.status;
                    statusClass = 'badge-pending';
                }
                
                const produseStr = formatareProduse(comanda.produse);
                
                html += `
                    <tr>
                        <td><strong>#${comanda.id}</strong></td>
                        <td>
                            <div style="font-weight: 700; color: #2d3748;">${produseStr}</div>
                        </td>
                        <td><strong>${comanda.total.toFixed(2)} lei</strong></td>
                        <td>
                            <div class="inline-input-group">
                                <input type="number" id="timp-${comanda.id}" value="${comanda.timpEstimat}" min="0" placeholder="min">
                                <button class="btn btn-secondary" style="padding: 6px 12px;" onclick="salveazaTimp(${comanda.id})">
                                    <i class="fa-solid fa-check"></i> Set
                                </button>
                            </div>
                        </td>
                        <td><span class="badge ${statusClass}">${statusLabel}</span></td>
                        <td style="text-align: center;">${actiuneButon}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = html;
        })
        .catch(error => {
            console.error(error);
            showToast('Eroare la conectarea cu serverul pentru comenzi.', 'error');
        });
}

function formatareProduse(produse) {
    if (!produse || produse.length === 0) return 'Fără produse';
    return produse.map(p => {
        const nume = p.produs ? p.produs.nume : 'Produs';
        return `${p.cantitate} x ${nume}`;
    }).join('<br>');
}

function salveazaTimp(comandaId) {
    const timpInput = document.getElementById(`timp-${comandaId}`);
    const timpVal = parseInt(timpInput.value);
    
    if (isNaN(timpVal) || timpVal < 0) {
        showToast('Introduceți un număr valid de minute!', 'error');
        return;
    }
    
    fetch(`http://localhost:8081/api/comenzi/${comandaId}/timp`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ timp: timpVal })
    })
    .then(response => {
        if (!response.ok) throw new Error();
        showToast(`Timpul estimat pentru comanda #${comandaId} a fost salvat la ${timpVal} min.`, 'success');
        incarcaComenziActive();
    })
    .catch(error => {
        showToast('Eroare la salvarea timpului estimat.', 'error');
    });
}

function schimbaStatus(comandaId, noulStatus) {
    fetch(`http://localhost:8081/api/comenzi/${comandaId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: noulStatus })
    })
    .then(response => {
        if (!response.ok) throw new Error();
        showToast(`Statusul comenzii #${comandaId} a fost schimbat în ${noulStatus}.`, 'success');
        incarcaComenziActive();
    })
    .catch(error => {
        showToast('Eroare la modificarea statusului comenzii.', 'error');
    });
}

function incarcaProduseMeniu() {
    const tableBody = document.querySelector('#kitchen-menu-table tbody');
    
    fetch('http://localhost:8081/api/meniu/toate')
        .then(response => {
            if (!response.ok) throw new Error();
            return response.json();
        })
        .then(produse => {
            produseMeniu = produse;
            randeazaProduseMeniu(produse);
        })
        .catch(error => {
            console.error(error);
            showToast('Eroare la încărcarea produselor din meniu.', 'error');
        });
}

function randeazaProduseMeniu(produse) {
    const tableBody = document.querySelector('#kitchen-menu-table tbody');
    if (produse.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #a0aec0; padding: 40px;">
                    Nu s-a găsit niciun produs în meniu.
                </td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    produse.forEach(produs => {
        let taguriHTML = '';
        if (produs.detalii) {
            if (produs.detalii.vegetarian) taguriHTML += `<span class="tag-veg" style="margin-right: 8px;"><i class="fa-solid fa-leaf"></i> Veg</span>`;
            if (produs.detalii.picant) taguriHTML += `<span class="tag-picant"><i class="fa-solid fa-fire"></i> Picant</span>`;
        }
        
        let tipProdus = 'Fel Principal';
        let detaliiSpecifice = '-';
        
        if (produs.esteSpirtoasa !== undefined || (produs.detalii && produs.hasOwnProperty('esteSpirtoasa'))) {
            tipProdus = 'Băutură';
            detaliiSpecifice = produs.esteSpirtoasa ? 'Spirtoasă' : 'Non-spirtoasă';
        } else if (produs.hasOwnProperty('picant') || produs.hasOwnProperty('vegetarian') || (produs.detalii && !produs.hasOwnProperty('esteSpirtoasa'))) {
            if (produs.nume && produs.nume.toLowerCase().includes('bruschet')) {
                tipProdus = 'Aperitiv';
            }
        }
        
        if (produs.hasOwnProperty('esteSpirtoasa')) {
            tipProdus = 'Băutură';
        }
        
        html += `
            <tr>
                <td>#${produs.id}</td>
                <td><strong>${produs.nume}</strong></td>
                <td>${tipProdus}</td>
                <td><strong>${produs.pret.toFixed(2)} lei</strong></td>
                <td>${taguriHTML !== '' ? taguriHTML : detaliiSpecifice}</td>
                <td style="text-align: center;">
                    <label class="switch">
                        <input type="checkbox" ${produs.disponibil ? 'checked' : ''} onchange="schimbaDisponibilitate(${produs.id}, this.checked)">
                        <span class="slider"></span>
                    </label>
                </td>
            </tr>
        `;
    });
    tableBody.innerHTML = html;
}

function schimbaDisponibilitate(produsId, disponibil) {
    fetch(`http://localhost:8081/api/meniu/${produsId}/disponibilitate`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disponibil: disponibil })
    })
    .then(response => {
        if (!response.ok) throw new Error();
        const msg = disponibil ? 'activat și afișat în meniu.' : 'dezactivat din meniul clienților.';
        showToast(`Produsul #${produsId} a fost ${msg}`, 'success');
    })
    .catch(error => {
        showToast('Eroare la schimbarea disponibilității produsului.', 'error');
        incarcaProduseMeniu();
    });
}

function filtreazaMeniu() {
    const query = document.getElementById('menu-search').value.toLowerCase().trim();
    if (query === '') {
        randeazaProduseMeniu(produseMeniu);
        return;
    }
    
    const filtrate = produseMeniu.filter(p => p.nume.toLowerCase().includes(query));
    randeazaProduseMeniu(filtrate);
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
