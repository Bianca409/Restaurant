document
.getElementById("loginForm")
.addEventListener(
"submit",
async function(e){

e.preventDefault();

const email =
document
.getElementById("email")
.value;

const password =
document
.getElementById("password")
.value;

const error =
document
.getElementById("error");

error.innerText="";

try{

        const response = await fetch("http://localhost:8081/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: email,
                parola: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("currentUser", JSON.stringify(data));
            
            if (data.rol === "MANAGER") {
                window.location.href = "adaugare-angajat.html";
            } else if (data.rol === "CHELNER") {
                window.location.href = "dashboard-chelner.html";
            } else if (data.rol === "PERSONAL") {
                window.location.href = "dashboard-personal.html";
            } else if (data.rol === "CLIENT") {
                window.location.href = "dashboard-client.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            error.innerText = data.eroare || "Email/username sau parolă greșită";
        }
    } catch (err) {
        console.error(err);
        error.innerText = "Server indisponibil";
    }
});