const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
// importo el archivo de la conexion a la base de datos de mongodb
require('./dbconnect/db-connection');

//importo los modelos de la base de datos
const Cliente = require('./models/client');
const Evento = require('./models/event');
const Pago = require('./models/payment');

let ventanaPrincipal;
let menuAplicacionPlantilla = [
    {
        label: 'Aplicación',
        submenu: [
            {
                label: 'Acerca de',
                click: () => {
                    abrirVentanaAcercaDe();
                }
            }
        ]
    }
];

function createWindow() {
    // Crea la ventana del navegador.
    //el atributo "preload" indica el archivo Javascript que se debe cargar cuando se vaya a crear la ventana

    ventanaPrincipal = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true
        }
    });

    // y carga el  index.html de la aplicación.
    ventanaPrincipal.loadFile(path.join(__dirname, 'views/index.html'));

    // console.log("directorio donde se busca la ventana principal: " + __dirname + "/views/index.html");
}

// function abrirVentanaAcercaDe() {
//     let ventanaAcercaDe = new BrowserWindow({
//         parent: ventanaPrincipal,
//         modal: true,
//         show: false,
//         width: 400,
//         height: 250
//     });

//     ventanaAcercaDe.loadFile('acerca-de.html');
//     ventanaAcercaDe.setMenu(null);
//     ventanaAcercaDe.once('ready-to-show', () => {
//         ventanaAcercaDe.show();
//     });
// }

//inicializacion de la aplicacion Electron
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
        console.log("Cerrado exitosamente.");
    } else {
        console.log("No se cerró la app.");
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('newCliente', async (e, args) => {
    let valid = true;
    try {
        const newClient = new Cliente(args);
        var result = await newClient.save();
        if (valid) {
            console.log("Se ha guardado el cliente.");
        } //else {
            //M.toast({ html: "Error al Registrar Cliente!" });
        //}
        console.log("se prosigue al reply...");
        e.reply('cliente-nuevo-creado', JSON.stringify(result));
    } catch (error) {
        console.log("Ha ocurrido el siguiente error durante el proceso: " + error);
        e.reply('error-proceso-cliente', error);
    }

});

ipcMain.on("editar-cliente", async (e, args) => {
    console.log("actualizando...");
    try {
        let clienteModificado = await Cliente.findByIdAndUpdate(args.id, { nombre: args.nombre, email: args.email, telefono: args.telefono, telefono_respaldo: args.telefono_respaldo, comentarios: args.comentarios }, { new: true });
        //el "new" despues del objeto modificado es para indicar que cuando actualice, me devuelva el registro modificado en lugar del original que es el que recibe en los argumentos.
        e.reply('cliente-editado', JSON.stringify(clienteModificado));
    } catch (error) {
        e.reply('error-proceso-cliente', error);
    }


});

ipcMain.on('eliminar-clientes', async (e, args) => {
    try {
        // if (c.length > 1) {
        //     const resultList = [];
        //     args.forEach(c => {
        //         const result = await Cliente.findByIdAndDelete(c);
        //         resultList.push(result);
        //     });
        //     e.reply('clientes-eliminados', JSON.stringify(resultList));
        // } else {
            await Cliente.findByIdAndDelete(args[0]);
            e.reply('clientes-eliminados', JSON.stringify(args[0]));
        // }
    } catch (error) {
        const debug = "Eliminar clientes: " + error;
        console.log(debug);
        e.reply("errores", debug);
   }
});

ipcMain.on('newEvento', async (e, args) => {
    console.log("ipcMAINNewEvento \n" + JSON.stringify(args));
    let valid = true;
    try {
        const evento = new Evento(args);
        let result = await evento.save();
        e.reply("evento-creado", JSON.stringify(result));
    } catch (error) {
        e.reply("errores", error);
    }
});

ipcMain.on('newPayment', (e, args) => {
    console.log("ipcMainNewPayment \n" + args);
});

ipcMain.on('get-clientes', async (e, args) => {
    try {
        const clientes = await Cliente.find();
        e.reply('get-clientes', JSON.stringify(clientes));
    } catch (error) {
        console.log("catch: " + error);
    }

});
ipcMain.on('get-eventos', async (e, args) => {
    try {
        const eventos = await Evento.find();
        e.reply('get-eventos', JSON.stringify(eventos));
    } catch (error) {
        e.reply("errores", error);
    }
});
// ipcMain.on('get-pagos', (e, args) => {
//     Pago.find();
// });