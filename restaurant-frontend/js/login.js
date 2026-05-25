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

const response =
await fetch(
"http://localhost:8080/login",
{

method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:
JSON.stringify({

email:email,
password:password

})

}

);

if(response.ok){

window.location.href=
"dashboard-chelner.html";

}
else{

error.innerText=
"Email sau parola gresita";

}

}
catch{

error.innerText=
"Server indisponibil";

}

});