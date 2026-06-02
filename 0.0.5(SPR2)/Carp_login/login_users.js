
const user = 'root'
const password_root = 'root'

function button_iniciar(){
    event.preventDefault();
    
    let nombre = document.getElementById('Usuario').value;
    let password = document.getElementById('contrasena').value;

    if(nombre == user & password == password_root){
        window.location.href = "dashboard.html";
    }
    else{
        alert("Usuario no encontrado")
    }

}   
        

let button = document.getElementById("id_button");
button.addEventListener("click", button_iniciar);   