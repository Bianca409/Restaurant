const API_BASE = 'http://localhost:8081';

const state = {
    employees: [],
    products: [],
    activeSection: 'employees',
    pendingDelete: null,
    toastTimer: null
};

document.addEventListener('DOMContentLoaded', () => {
    guardManagerAccess();
    bindEvents();
    loadDashboard();
});

function guardManagerAccess() {
    const rawUser = localStorage.getItem('currentUser');

    if (!rawUser) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = JSON.parse(rawUser);
        const role = normalizeRole(user);

        if (role !== 'MANAGER') {
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('managerName').textContent = user.username || 'Manager';
    } catch {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

function bindEvents() {
    document.querySelectorAll('.side-tab').forEach((button) => {
        button.addEventListener('click', () => switchSection(button.dataset.section));
    });

    document.querySelectorAll('[data-modal-close]').forEach((button) => {
        button.addEventListener('click', () => closeModal(button.dataset.modalClose));
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('refreshEmployeesBtn').addEventListener('click', loadEmployees);
    document.getElementById('refreshProductsBtn').addEventListener('click', loadProducts);
    document.getElementById('employeeSearch').addEventListener('input', renderEmployees);
    document.getElementById('productSearch').addEventListener('input', renderProducts);
    document.getElementById('employeesTable').addEventListener('click', handleEmployeeAction);
    document.getElementById('productsTable').addEventListener('click', handleProductAction);
    document.getElementById('productEditForm').addEventListener('submit', saveProductEdit);
    document.getElementById('confirmActionBtn').addEventListener('click', runPendingDelete);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal('infoModal');
            closeModal('productEditModal');
            closeModal('confirmModal');
        }
    });
}

function normalizeRole(user) {
    return String(user.role || user.rol || '').toUpperCase();
}

function switchSection(section) {
    state.activeSection = section;

    document.querySelectorAll('.side-tab').forEach((button) => {
        button.classList.toggle('active', button.dataset.section === section);
    });

    document.getElementById('employeesPanel').hidden = section !== 'employees';
    document.getElementById('productsPanel').hidden = section !== 'products';
}

async function loadDashboard() {
    const results = await Promise.allSettled([loadEmployees(), loadProducts()]);
    const rejected = results.find((result) => result.status === 'rejected');

    if (rejected) {
        showToast(rejected.reason.message || 'Nu s-au putut incarca toate datele.', 'error');
    }
}

async function loadEmployees() {
    try {
        state.employees = await request('/api/manager/angajati');
        renderEmployees();
        updateStats();
    } catch (error) {
        setEmployeesEmpty(error.message || 'Eroare la incarcarea angajatilor.');
        throw error;
    }
}

async function loadProducts() {
    try {
        state.products = await request('/api/manager/meniu');
        renderProducts();
        updateStats();
    } catch (error) {
        setProductsEmpty(error.message || 'Eroare la incarcarea produselor.');
        throw error;
    }
}

async function request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Eroare server (${response.status}).`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

function updateStats() {
    const waiters = state.employees.filter((employee) => normalizeEmployeeRole(employee) === 'CHELNER').length;
    const available = state.products.filter((product) => Boolean(product.disponibil)).length;

    document.getElementById('statEmployees').textContent = state.employees.length;
    document.getElementById('statWaiters').textContent = waiters;
    document.getElementById('statProducts').textContent = state.products.length;
    document.getElementById('statAvailable').textContent = available;
}

function renderEmployees() {
    const tbody = document.querySelector('#employeesTable tbody');
    const query = document.getElementById('employeeSearch').value.trim().toLowerCase();
    const employees = state.employees.filter((employee) => {
        return [employee.id, employee.username, employee.email, employee.rol]
            .join(' ')
            .toLowerCase()
            .includes(query);
    });

    if (employees.length === 0) {
        setEmployeesEmpty(query ? 'Nu exista angajati pentru filtrul curent.' : 'Nu exista angajati inregistrati.');
        return;
    }

    tbody.innerHTML = employees.map((employee) => {
        const role = normalizeEmployeeRole(employee);
        const roleClass = role === 'CHELNER' ? 'waiter' : 'staff';

        return `
            <tr>
                <td><strong>#${escapeHtml(employee.id)}</strong></td>
                <td>
                    <div class="table-title">${escapeHtml(employee.username || 'Fara username')}</div>
                    <div class="table-subtitle">Cod angajat ${escapeHtml(employee.id)}</div>
                </td>
                <td>${escapeHtml(employee.email || 'Fara email')}</td>
                <td><span class="badge ${roleClass}">${formatRole(role)}</span></td>
                <td>
                    <div class="row-actions">
                        <button class="icon-btn success" type="button" data-action="info-employee" data-id="${escapeHtml(employee.id)}" title="Detalii angajat" aria-label="Detalii angajat">
                            <i class="fa-solid fa-circle-info"></i>
                        </button>
                        <button class="icon-btn danger" type="button" data-action="delete-employee" data-id="${escapeHtml(employee.id)}" title="Sterge angajat" aria-label="Sterge angajat">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderProducts() {
    const tbody = document.querySelector('#productsTable tbody');
    const query = document.getElementById('productSearch').value.trim().toLowerCase();
    const products = state.products.filter((product) => {
        return [product.id, product.nume, product.categorie, product.pret]
            .join(' ')
            .toLowerCase()
            .includes(query);
    });

    if (products.length === 0) {
        setProductsEmpty(query ? 'Nu exista produse pentru filtrul curent.' : 'Nu exista produse inregistrate.');
        return;
    }

    tbody.innerHTML = products.map((product) => {
        const statusClass = product.disponibil ? 'available' : 'unavailable';
        const statusText = product.disponibil ? 'Disponibil' : 'Indisponibil';

        return `
            <tr>
                <td><strong>#${escapeHtml(product.id)}</strong></td>
                <td>
                    <div class="table-title">${escapeHtml(product.nume || 'Produs fara nume')}</div>
                    <div class="table-subtitle">${formatIngredients(product.detalii, 3)}</div>
                </td>
                <td>${formatCategory(product)}</td>
                <td><strong>${formatPrice(product.pret)}</strong></td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="row-actions">
                        <button class="icon-btn success" type="button" data-action="info-product" data-id="${escapeHtml(product.id)}" title="Detalii produs" aria-label="Detalii produs">
                            <i class="fa-solid fa-circle-info"></i>
                        </button>
                        <button class="icon-btn" type="button" data-action="edit-product" data-id="${escapeHtml(product.id)}" title="Modifica produs" aria-label="Modifica produs">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="icon-btn danger" type="button" data-action="delete-product" data-id="${escapeHtml(product.id)}" title="Sterge produs" aria-label="Sterge produs">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setEmployeesEmpty(message) {
    document.querySelector('#employeesTable tbody').innerHTML = `
        <tr>
            <td colspan="5">
                <div class="empty-state">
                    <i class="fa-solid fa-user-slash"></i>
                    ${escapeHtml(message)}
                </div>
            </td>
        </tr>
    `;
}

function setProductsEmpty(message) {
    document.querySelector('#productsTable tbody').innerHTML = `
        <tr>
            <td colspan="6">
                <div class="empty-state">
                    <i class="fa-solid fa-box-open"></i>
                    ${escapeHtml(message)}
                </div>
            </td>
        </tr>
    `;
}

function handleEmployeeAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const employee = state.employees.find((item) => Number(item.id) === id);
    if (!employee) return;

    if (button.dataset.action === 'info-employee') {
        openEmployeeInfo(employee);
    }

    if (button.dataset.action === 'delete-employee') {
        state.pendingDelete = {
            type: 'employee',
            id,
            label: employee.username || `angajat #${id}`
        };
        openConfirm(`Stergi angajatul "${state.pendingDelete.label}"?`);
    }
}

function handleProductAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const product = state.products.find((item) => Number(item.id) === id);
    if (!product) return;

    if (button.dataset.action === 'info-product') {
        openProductInfo(product);
    }

    if (button.dataset.action === 'edit-product') {
        openProductEdit(product);
    }

    if (button.dataset.action === 'delete-product') {
        state.pendingDelete = {
            type: 'product',
            id,
            label: product.nume || `produs #${id}`
        };
        openConfirm(`Stergi produsul "${state.pendingDelete.label}"?`);
    }
}

function openEmployeeInfo(employee) {
    const role = normalizeEmployeeRole(employee);
    document.getElementById('infoTitle').textContent = employee.username || 'Detalii angajat';
    document.getElementById('infoBody').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <span>ID</span>
                <strong>#${escapeHtml(employee.id)}</strong>
            </div>
            <div class="detail-item">
                <span>Rol</span>
                <strong>${formatRole(role)}</strong>
            </div>
            <div class="detail-item">
                <span>Username</span>
                <strong>${escapeHtml(employee.username || 'Fara username')}</strong>
            </div>
            <div class="detail-item">
                <span>Email</span>
                <strong>${escapeHtml(employee.email || 'Fara email')}</strong>
            </div>
        </div>
    `;
    openModal('infoModal');
}

function openProductInfo(product) {
    const tags = buildProductTags(product).join('');
    document.getElementById('infoTitle').textContent = product.nume || 'Detalii produs';
    document.getElementById('infoBody').innerHTML = `
        <div class="details-grid">
            <div class="detail-item">
                <span>ID</span>
                <strong>#${escapeHtml(product.id)}</strong>
            </div>
            <div class="detail-item">
                <span>Categorie</span>
                <strong>${formatCategory(product)}</strong>
            </div>
            <div class="detail-item">
                <span>Pret</span>
                <strong>${formatPrice(product.pret)}</strong>
            </div>
            <div class="detail-item">
                <span>Status</span>
                <strong>${product.disponibil ? 'Disponibil' : 'Indisponibil'}</strong>
            </div>
            <div class="detail-item">
                <span>Ingrediente</span>
                <strong>${formatIngredients(product.detalii)}</strong>
            </div>
            <div class="detail-item">
                <span>Marcaje</span>
                <div class="tags">${tags || '<strong>Fara marcaje</strong>'}</div>
            </div>
        </div>
    `;
    openModal('infoModal');
}

function openProductEdit(product) {
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.nume || '';
    document.getElementById('editProductPrice').value = Number(product.pret || 0).toFixed(2);
    document.getElementById('editProductIngredients').value = ingredientsArray(product.detalii).join(', ');
    document.getElementById('editProductAvailable').checked = Boolean(product.disponibil);
    document.getElementById('editProductVegetarian').checked = Boolean(product.detalii && product.detalii.vegetarian);
    document.getElementById('editProductSpicy').checked = Boolean(product.detalii && product.detalii.picant);
    document.getElementById('editProductAlcohol').checked = Boolean(product.spirtoasa);
    document.getElementById('editProductAlcoholWrap').hidden = product.categorie !== 'BAUTURA';

    openModal('productEditModal');
}

async function saveProductEdit(event) {
    event.preventDefault();

    const id = document.getElementById('editProductId').value;
    const body = {
        nume: document.getElementById('editProductName').value.trim(),
        pret: Number(document.getElementById('editProductPrice').value),
        ingrediente: document.getElementById('editProductIngredients').value.trim(),
        disponibil: document.getElementById('editProductAvailable').checked,
        vegetarian: document.getElementById('editProductVegetarian').checked,
        picant: document.getElementById('editProductSpicy').checked
    };

    const currentProduct = state.products.find((product) => String(product.id) === String(id));
    if (currentProduct && currentProduct.categorie === 'BAUTURA') {
        body.spirtoasa = document.getElementById('editProductAlcohol').checked;
    }

    try {
        await request(`/api/manager/meniu/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        closeModal('productEditModal');
        await loadProducts();
        showToast('Produsul a fost actualizat.', 'success');
    } catch (error) {
        showToast(error.message || 'Produsul nu a putut fi actualizat.', 'error');
    }
}

function openConfirm(message) {
    document.getElementById('confirmMessage').textContent = message;
    openModal('confirmModal');
}

async function runPendingDelete() {
    if (!state.pendingDelete) return;

    const item = state.pendingDelete;
    const path = item.type === 'employee'
        ? `/api/manager/angajati/${item.id}`
        : `/api/manager/meniu/${item.id}`;

    try {
        const responseText = await request(path, { method: 'DELETE' });
        closeModal('confirmModal');
        state.pendingDelete = null;

        if (item.type === 'employee') {
            await loadEmployees();
        } else {
            await loadProducts();
        }

        showToast(responseText || 'Elementul a fost sters.', 'success');
    } catch (error) {
        showToast(error.message || 'Stergerea nu a reusit.', 'error');
    }
}

function openModal(id) {
    document.getElementById(id).hidden = false;
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.hidden = true;
    }
}

function normalizeEmployeeRole(employee) {
    return String(employee.rol || employee.role || 'PERSONAL').toUpperCase();
}

function formatRole(role) {
    if (role === 'CHELNER') return 'Chelner';
    if (role === 'PERSONAL') return 'Personal bucatarie';
    return role || 'Personal';
}

function formatCategory(product) {
    if (product.categorie === 'BAUTURA') {
        return product.spirtoasa ? 'Bautura spirtoasa' : 'Bautura';
    }

    if (product.categorie === 'APERITIV') return 'Aperitiv';
    if (product.categorie === 'PRINCIPAL') return 'Fel principal';
    return 'Produs';
}

function formatPrice(value) {
    const number = Number(value || 0);
    return `${number.toFixed(2)} lei`;
}

function ingredientsArray(detalii) {
    if (!detalii || !Array.isArray(detalii.listaIngrediente)) {
        return [];
    }

    return detalii.listaIngrediente.filter(Boolean);
}

function formatIngredients(detalii, limit) {
    const ingredients = ingredientsArray(detalii);
    if (ingredients.length === 0) return 'Fara ingrediente listate';

    const shown = typeof limit === 'number' ? ingredients.slice(0, limit) : ingredients;
    const suffix = limit && ingredients.length > limit ? ` +${ingredients.length - limit}` : '';
    return `${shown.map(escapeHtml).join(', ')}${suffix}`;
}

function buildProductTags(product) {
    const tags = [];

    if (product.detalii && product.detalii.vegetarian) {
        tags.push('<span class="badge available"><i class="fa-solid fa-leaf"></i> Vegetarian</span>');
    }

    if (product.detalii && product.detalii.picant) {
        tags.push('<span class="badge waiter"><i class="fa-solid fa-pepper-hot"></i> Picant</span>');
    }

    if (product.categorie === 'BAUTURA') {
        tags.push(`<span class="badge manager"><i class="fa-solid fa-wine-glass"></i> ${product.spirtoasa ? 'Spirtoasa' : 'Nespirtoasa'}</span>`);
    }

    return tags;
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastIcon = document.getElementById('toastIcon');
    const toastMessage = document.getElementById('toastMessage');

    window.clearTimeout(state.toastTimer);
    toast.className = `toast show ${type}`;
    toastMessage.textContent = message;

    if (type === 'success') {
        toastIcon.className = 'fa-solid fa-circle-check';
    } else if (type === 'error') {
        toastIcon.className = 'fa-solid fa-circle-xmark';
    } else {
        toastIcon.className = 'fa-solid fa-circle-info';
    }

    state.toastTimer = window.setTimeout(() => {
        toast.classList.remove('show');
    }, 3600);
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
