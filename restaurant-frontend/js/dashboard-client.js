document.addEventListener('DOMContentLoaded', () => {
    inicializeazaUtilizator();
    incarcaComenzi();
    
    setInterval(incarcaComenzi, 10000);
});

function inicializeazaUtilizator() {
    let currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser || JSON.parse(currentUser).role !== 'CLIENT') {
        const mockUser = {
            id: 99,
            username: "Maria",
            email: "maria@client.com",
            role: "CLIENT"
        };
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        currentUser = JSON.stringify(mockUser);
        
        document.getElementById('mock-login-banner').style.display = 'block';
    }
    
    const user = JSON.parse(currentUser);
    let displayName = user.username;
    let displayEmail = user.email;
    
    if (displayName && (displayName.toLowerCase().includes('bianca') || displayName.toLowerCase().includes('lincă') || displayName.toLowerCase().includes('linca') || displayName.toLowerCase().includes('chelner'))) {
        displayName = 'Maria';
        displayEmail = 'maria@client.com';
    }
    
    document.getElementById('user-display-name').textContent = displayName;
    document.getElementById('profile-username').textContent = displayName;
    document.getElementById('profile-email').textContent = displayEmail;
    document.getElementById('welcome-message').innerHTML = `<i class="fa-solid fa-circle-user"></i> Salutare, ${displayName}!`;
    
    let clientOrderIds = localStorage.getItem('clientOrderIds');
    if (!clientOrderIds) {
        const initialIds = [101, 102];
        localStorage.setItem('clientOrderIds', JSON.stringify(initialIds));
        
        const mockOrdersDetails = {
            "101": {
                id: 101,
                total: 45.0,
                status: "SERVITA",
                timpEstimat: 0,
                nrChitanta: 5042,
                produse: [
                    { cantitate: 2, produs: { nume: "Bruschete cu roșii", pret: 15.0 } },
                    { cantitate: 1, produs: { nume: "Limonadă", pret: 15.0 } }
                ]
            },
            "102": {
                id: 102,
                total: 80.0,
                status: "SERVITA",
                timpEstimat: 0,
                nrChitanta: 5043,
                produse: [
                    { cantitate: 1, produs: { nume: "Supă cremă de ciuperci", pret: 25.0 } },
                    { cantitate: 1, produs: { nume: "Pulpă de pui la grătar", pret: 35.0 } },
                    { cantitate: 2, produs: { nume: "Apă plată", pret: 10.0 } }
                ]
            }
        };
        localStorage.setItem('cachedOrdersDetails', JSON.stringify(mockOrdersDetails));
    }
}

function incarcaComenzi() {
    const activeTableBody = document.querySelector('#active-orders-table tbody');
    const historyTableBody = document.querySelector('#history-orders-table tbody');
    
    const clientOrderIds = JSON.parse(localStorage.getItem('clientOrderIds') || '[]');
    let cachedOrdersDetails = JSON.parse(localStorage.getItem('cachedOrdersDetails') || '{}');
    
    fetch('http://localhost:8081/api/comenzi/nefinalizate')
        .then(response => {
            if (!response.ok) throw new Error('Eroare la preluarea comenzilor nefinalizate.');
            return response.json();
        })
        .then(comenziNefinalizate => {
            let activeHTML = '';
            let historyHTML = '';
            let activeCount = 0;
            let totalCount = clientOrderIds.length;
            
            const nefinalizateMap = {};
            comenziNefinalizate.forEach(c => {
                nefinalizateMap[c.id] = c;
            });
            
            clientOrderIds.forEach(orderId => {
                if (nefinalizateMap[orderId]) {
                    const comanda = nefinalizateMap[orderId];
                    activeCount++;
                    
                    cachedOrdersDetails[orderId] = comanda;
                    
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
                    
                    activeHTML += `
                        <tr>
                            <td><strong>#${comanda.id}</strong></td>
                            <td>
                                <div>${produseStr}</div>
                            </td>
                            <td><strong>${comanda.total.toFixed(2)} lei</strong></td>
                            <td><i class="fa-solid fa-hourglass-half"></i> ${comanda.timpEstimat > 0 ? comanda.timpEstimat + ' min' : 'Nesetat'}</td>
                            <td><span class="badge ${statusClass}">${statusLabel}</span></td>
                        </tr>
                    `;
                } 
                else {
                    let comanda = cachedOrdersDetails[orderId];
                    
                    if (comanda) {
                        if (comanda.status !== 'SERVITA') {
                            comanda.status = 'SERVITA';
                            cachedOrdersDetails[orderId] = comanda;
                            showToast(`Comanda #${orderId} a fost servită! Poftă bună!`, 'success');
                        }
                    } else {
                        comanda = {
                            id: orderId,
                            total: 0,
                            status: 'SERVITA',
                            produse: [],
                            nrChitanta: null
                        };
                    }
                    
                    const produseStr = formatareProduse(comanda.produse) || 'Meniu personalizat';
                    const chitantaStr = comanda.nrChitanta ? `#${comanda.nrChitanta}` : 'Plată în curs';
                    
                    historyHTML += `
                        <tr>
                            <td>#${comanda.id}</td>
                            <td>${new Date().toLocaleDateString('ro-RO')}</td>
                            <td>${produseStr}</td>
                            <td>${comanda.total.toFixed(2)} lei</td>
                            <td><span class="badge badge-cash">${chitantaStr}</span></td>
                            <td><span class="badge badge-served"><i class="fa-solid fa-circle-check"></i> Servită</span></td>
                        </tr>
                    `;
                }
            });
            
            localStorage.setItem('cachedOrdersDetails', JSON.stringify(cachedOrdersDetails));
            
            if (activeHTML !== '') {
                activeTableBody.innerHTML = activeHTML;
            } else {
                activeTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: #a0aec0; padding: 30px;">
                            Nu ai nicio comandă activă în acest moment.
                        </td>
                    </tr>
                `;
            }
            
            if (historyHTML !== '') {
                historyTableBody.innerHTML = historyHTML;
            } else {
                historyTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: #a0aec0; padding: 30px;">
                            Nu s-au găsit comenzi finalizate în istoric.
                        </td>
                    </tr>
                `;
            }
            
            document.getElementById('stat-active-count').textContent = activeCount;
            document.getElementById('stat-total-count').textContent = totalCount;
        })
        .catch(error => {
            console.error(error);
            showToast('Eroare la preluarea datelor de pe server.', 'error');
        });
}

function formatareProduse(produse) {
    if (!produse || produse.length === 0) return '';
    return produse.map(p => {
        const nume = p.produs ? p.produs.nume : 'Produs';
        return `${p.cantitate}x ${nume}`;
    }).join(', ');
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
