const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const xlsx = require('xlsx'); 

// Configurar el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        // Guardar el archivo siempre como 'cotizador.xlsx'
        cb(null, 'cotizador.xlsx');
    }
});

// Inicializar multer
const upload = multer({ storage: storage });

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

// Añadir middleware para manejar JSON
app.use(express.json());

// Ruta para manejar la subida de archivos
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se subió ningún archivo.');
    }
    res.status(200).send('Archivo subido exitosamente.');
});


// Endpoint para cargar datos desde el archivo Excel
app.get('/destinos', (req, res) => {
    const workbook = xlsx.readFile(path.join(__dirname, '/uploads/cotizador.xlsx'));
    const sheet = workbook.Sheets['Cobertura']; // Nombre de la hoja que contiene los datos
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Cargar todos los datos como un array

    const destinosGenerales = new Set();
    const destinosEspecificos = {};

    // Asumiendo que los datos comienzan en la fila 3 (índice 2)
    for (let i = 2; i < data.length; i++) {
        const comuna = data[i][5]; // Columna F (índice 5)
        const localidad = data[i][6]; // Columna G (índice 6)

        if (comuna) {
            destinosGenerales.add(comuna);
            if (!destinosEspecificos[comuna]) {
                destinosEspecificos[comuna] = [];
            }
            if (localidad) {
                destinosEspecificos[comuna].push(localidad);
            }
        }
    }

    //Imprimir los destinos generales y específicos
    //console.log('Destinos generales:', Array.from(destinosGenerales));
    //console.log('Destinos específicos:', destinosEspecificos);

    res.json({
        destinosGenerales: Array.from(destinosGenerales),
        destinosEspecificos: destinosEspecificos
    });
});


// Endpoint para cotizar un envío
app.post('/cotizar' , (req, res) => {
    const workbook = xlsx.readFile(path.join(__dirname, '/uploads/cotizador.xlsx'));
    const sheet_cost = workbook.Sheets['Tarifa Gral']; // Nombre de la hoja que contiene los datos de los costos por id 
    const sheet_id = workbook.Sheets['Cobertura']; // Nombre de la hoja que contiene los datos de los id por comuna
    const data_cost = xlsx.utils.sheet_to_json(sheet_cost, { header: 1 }); // Cargar todos los datos como un array
    const data_id = xlsx.utils.sheet_to_json(sheet_id, { header: 1 }); // Cargar todos los datos como un array

    console.log(req.body);


    const { destinoEspecifico, destinoGeneral, height, length, weight, width } = req.body;

    console.log(destinoGeneral, destinoEspecifico, weight, height, length, width);


    /* const destino_general = req.body.destino-general;
    const destino_especifico = req.body.destino-especifico;
    const peso = parseFloat(req.body.weight);
    const alto = parseFloat(req.body.height);
    const largo = parseFloat(req.body.length);
    const ancho = parseFloat(req.body.width); */

    let id = 0;

    // Asumiendo que los datos comienzan en la fila 3 (índice 2)
    for (let i = 2; i < data_id.length; i++) {
        if (data_id[i][5] == destinoGeneral && data_id[i][6] == destinoEspecifico) {
            id = data_id[i][0];
            console.log(id);
            break;
        }
    }

    let min_cobrar = 0;
    let less_10kg = 0;
    let less_20kg = 0;
    let less_50kg = 0;
    let less_100kg = 0;
    let less_250kg = 0;
    let more_250kg = 0;
    let tiempo_entrega = 0;



    //Buscar la info del costo por id
    for (let i = 2; i < data_cost.length; i++) {
        if (data_cost[i][3] == id) {
            console.log(data_cost[i]);
            min_cobrar = data_cost[i][4];
            less_10kg = data_cost[i][5];
            less_20kg = data_cost[i][6];
            less_50kg = data_cost[i][7];
            less_100kg = data_cost[i][8];
            less_250kg = data_cost[i][9];
            more_250kg = data_cost[i][10];
            tiempo_entrega = data_cost[i][11];
        }
    }


    //Definir altura, largo y ancho maximos 
    const max_ancho = 100;
    const max_largo = 120;
    const max_alto = 180;


    if (height > max_alto || length > max_largo || width > max_ancho) {
        res.status(402).send('Las dimensiones del paquete exceden los límites permitidos.');
    }

    const peso_volumetrico = (height * length * width) / 4000;

    const peso_final = Math.max(weight, peso_volumetrico);

    let costo = 0;

    costo += min_cobrar;

    if (peso_final <= 10) {
        costo += (less_10kg * peso_final);
    } else if (peso_final <= 20) {
        costo += (less_20kg * peso_final);
    } else if (peso_final <= 50) {
        costo += (less_50kg * peso_final);
    } else if (peso_final <= 100) {
        costo += (less_100kg * peso_final);
    } else if (peso_final <= 250) {
        costo += (less_250kg * peso_final);
    } else {
        costo += (more_250kg * peso_final);
    }

    console.log(costo);

    res.json({
        destination_general: destinoGeneral,
        destination_especifico: destinoEspecifico,
        cost: costo,
        tiempo_entrega: tiempo_entrega
    });


});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
