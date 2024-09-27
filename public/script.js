// Función para cargar direcciones generales desde un archivo XLSX ../uploads/cotizador.xlsx
document.addEventListener('DOMContentLoaded', function() {
    // Cargar destinos generales desde el servidor
    fetch('/destinos')
        .then(response => response.json())
        .then(data => {
            const destinoGeneralSelect = document.getElementById('destino-general');
            const destinoEspecificoSelect = document.getElementById('destino-especifico');

            // Llenar el selector de destino general
            data.destinosGenerales.forEach(destino => {
                const option = document.createElement('option');
                option.value = destino;
                option.textContent = destino;
                destinoGeneralSelect.appendChild(option);
            });

            // Manejar cambio en el destino general
            destinoGeneralSelect.addEventListener('change', function() {
                const selectedGeneral = this.value;
                destinoEspecificoSelect.innerHTML = '<option value="">Seleccionar destino específico</option>'; // Reiniciar opciones

                if (selectedGeneral) {
                    const especificos = data.destinosEspecificos[selectedGeneral] || [];
                    especificos.forEach(localidad => {
                        const option = document.createElement('option');
                        option.value = localidad;
                        option.textContent = localidad;
                        destinoEspecificoSelect.appendChild(option);
                    });
                }
            });
        })
        .catch(error => console.error('Error al cargar los destinos:', error));
});

document.getElementById('quote-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita que el formulario se envíe de manera tradicional
    
    const formData = new FormData(this); // Captura los datos del formulario

    try {
        let new_data = {}
        for (const [key, value] of formData.entries()) {
            new_data[key] = value;
        }

        console.log(new_data);
        
        // Enviar el archivo al backend usando fetch
        const response = await fetch('/cotizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Indica que se envía JSON
            },
            body: JSON.stringify(new_data), // Convierte el objeto a JSON
        });

        const resultDiv = document.getElementById('result');

        if (response.ok) {
            // Si la subida fue exitosa, muestra el resultado
            const data = await response.json();
            const { destination_general, destination_especifico, cost, tiempo_entrega } = data;
            resultDiv.innerHTML = `<p>El costo estimado para enviar a ${destination_general}, ${destination_especifico} es: $${cost.toFixed(0)}</p>`;
        } else if (response.status === 402) {
            resultDiv.innerHTML = '<p>Las dimensiones del paquete exceden los límites permitidos</p>';
        }
        else {
            document.getElementById('result').innerHTML = '<p>Error no se pudo cotizar.</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerHTML = '<p>Error no se pudo cotizar catch</p>';
    }

});

// Agregar el evento para el botón Reset
document.getElementById('reset-button').addEventListener('click', function() {
    document.getElementById('quote-form').reset(); // Reinicia el formulario
    document.getElementById('result').innerHTML = ''; // Limpia el resultado mostrado
});








