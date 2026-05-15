const registerForm = document.getElementById('registerForm');
const mesajRaspuns = document.getElementById('mesajRaspuns');

registerForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const usernameValue = document.getElementById('username').value;
    const emailValue = document.getElementById('email').value;
    const parolaValue = document.getElementById('parola').value;

    const dateClient = {
        username: usernameValue,
        email: emailValue,
        parola: parolaValue
    };

    fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dateClient)
    })
    .then(response => response.text()) 
    .then(mesaj => {
        mesajRaspuns.textContent = mesaj;
        
        if (mesaj.includes("succes")) {
            mesajRaspuns.style.color = "green";
            registerForm.reset(); 
        } else {
            mesajRaspuns.style.color = "red";
        }
    })
    .catch(error => {
        console.error('Eroare:', error);
        mesajRaspuns.textContent = "A apărut o eroare la conectarea cu serverul. Asigură-te că backend-ul este pornit.";
        mesajRaspuns.style.color = "red";
    });
});