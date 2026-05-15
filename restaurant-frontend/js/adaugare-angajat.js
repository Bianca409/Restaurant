const addEmployeeForm = document.getElementById('addEmployeeForm');
const mesajRaspuns = document.getElementById('mesajRaspuns');

addEmployeeForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const dateAngajat = {
        tip: document.getElementById('tip').value,
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        parola: document.getElementById('parola').value
    };

    // Apelăm endpoint-ul de manager pentru angajați
    fetch('http://localhost:8081/api/manager/angajati', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dateAngajat)
    })
    .then(response => response.text())
    .then(mesaj => {
        mesajRaspuns.textContent = mesaj;
        
        if (mesaj.includes("succes")) {
            mesajRaspuns.style.color = "green";
            addEmployeeForm.reset(); 
        } else {
            mesajRaspuns.style.color = "red";
        }
    })
    .catch(error => {
        console.error('Eroare:', error);
        mesajRaspuns.textContent = "Eroare de conexiune cu serverul backend.";
        mesajRaspuns.style.color = "red";
    });
});