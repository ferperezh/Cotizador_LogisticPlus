document.getElementById('admin-login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Verificar usuario y contraseña
    if (username === 'admin' && password === '1234') {
        window.location.href = 'admin_excel.html'; // Redirigir si es correcto
    } else {
        document.getElementById('admin-login-result').textContent = 'Usuario o contraseña incorrectos';
    }
});



