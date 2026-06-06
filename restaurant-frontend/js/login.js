const API_BASE = 'http://localhost:8081';

const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const errorBox = document.getElementById('loginError');
const loginButton = document.getElementById('loginButton');
const togglePassword = document.getElementById('togglePassword');

const roleRoutes = {
    MANAGER: 'dashboard-manager.html',
    CHELNER: 'dashboard-chelner.html',
    PERSONAL: 'dashboard-personal.html',
    CLIENT: 'dashboard-client.html'
};

togglePassword.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.innerHTML = isPassword
        ? '<i class="fa-solid fa-eye-slash"></i>'
        : '<i class="fa-solid fa-eye"></i>';
    togglePassword.setAttribute('aria-label', isPassword ? 'Ascunde parola' : 'Afiseaza parola');
});

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const parola = passwordInput.value;

    if (!username || !parola) {
        showError('Completeaza username-ul si parola.');
        return;
    }

    setLoading(true);
    showError('');

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, parola })
        });

        const data = await parseResponse(response);

        if (!response.ok) {
            throw new Error(data.eroare || data.message || 'Datele de autentificare sunt invalide.');
        }

        const role = String(data.rol || data.role || '').toUpperCase();
        const route = roleRoutes[role];

        if (!route) {
            throw new Error('Rolul utilizatorului nu este configurat in frontend.');
        }

        localStorage.setItem('currentUser', JSON.stringify({
            id: data.id,
            username: data.username || username,
            email: data.email || username,
            role,
            rol: role
        }));

        window.location.href = route;
    } catch (error) {
        showError(error.message || 'Server indisponibil.');
    } finally {
        setLoading(false);
    }
});

async function parseResponse(response) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        return response.json();
    }

    const text = await response.text();
    return { message: text };
}

function showError(message) {
    errorBox.textContent = message;
}

function setLoading(isLoading) {
    loginButton.disabled = isLoading;
    loginButton.querySelector('span').textContent = isLoading ? 'Se verifica...' : 'Login';
}
