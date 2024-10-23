document.getElementById('login-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Captura los valores del formulario
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Verifica las credenciales
    if (username === 'admin' && password === '123456') {
       // window.location.href = 'admin.html'; //! Redirige a admin.html
        window.location.href = 'menuArchivos.html'; // Redirige a admin.html
    } else {
        document.getElementById('error-message').style.display = 'block'; // Muestra mensaje de error
    }
});