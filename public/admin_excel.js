 // Escucha el evento submit del formulario
 document.getElementById('upload-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita que el formulario se envíe de manera tradicional

    const formData = new FormData(this); // Captura los datos del formulario

    try {
        // Enviar el archivo al backend usando fetch
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            // Si la subida fue exitosa, muestra el resultado
            window.location.href = 'exito.html';
        } else {
            document.getElementById('upload-result').innerHTML = '<p>Error al subir el archivo.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('upload-result').innerHTML = '<p>Error al subir el archivo.</p>';
    }

    // Después de subir el archivo, limpiar el formulario si es necesario
    this.reset();
});