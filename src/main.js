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

    try {
        const newClient = new Cliente(args);
        var result = await newClient.save();
        console.log("Se ha guardado el cliente, se prosigue al reply...");
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

ipcMain.on('eliminar-cliente', async (e, args) => {
    try {
        await Cliente.findByIdAndDelete(args);
        e.reply('cliente-eliminado', JSON.stringify(args));
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

ipcMain.on('nuevo-pago', async (e, args) => {
    console.log("ipcMainNewPayment \n" + JSON.stringify(args));
    let eventoUpdated = null;
    try {
        const p = {
            evento: args.evento._id,
            tipo: args.tipo,
            cliente: args.cliente,
            monto: args.monto,
            fecha: args.fecha
        }
        console.log("acomodo el objeto pago y lo guardo...");
        const pago = new Pago(p);
        let result = await pago.save()

        console.log("pago creado: " + result + "\nse procede a actualizar el evento: " + args.evento);
        const finalResult = {
            "pago": result,
            "evento": args.evento
        };
        console.log("los guardo en un objeto a ambos y procedo a mandarlo al renderizador...");
        e.reply('pago-nuevo-creado', JSON.stringify(finalResult));
    } catch (error) {
        console.log(error);
        e.reply('errores', error);
    }
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
ipcMain.on('eliminar-evento', async (e, args) => {
   try {
       const evento = await Evento.findByIdAndDelete(args);
       e.reply("evento-eliminado", JSON.stringify(evento));
   } catch (error) {
       e.reply("errores", error);
   }
});
ipcMain.on('editar-evento', async (e, eventoAEditar) => {
    try {
        const result = await Evento.findByIdAndUpdate(eventoAEditar._id, {
            pagos: eventoAEditar.pagos,
            status: eventoAEditar.status
        }, { new: true });
        e.reply("evento-actualizado", JSON.stringify(result));
    } catch (error) {
        console.log(error);
        e.reply("errores", error);
    }
});
ipcMain.on('get-pagos', async (e, args) => {
    try {
        const pagos = await Pago.find();
        e.reply('get-pagos', JSON.stringify(pagos));
    } catch (error) {
        e.reply('errores', error);
    }
});
ipcMain.on("eliminar-pagos-evento", async (e, args) => {
    try {
        const pagos = await Pago.deleteMany({ evento: args }).then((operationStats) => {
            const mensaje = "Registros encontrados=" + operationStats.n + "\nStatus=" + (operationStats.ok == 1 ? "OK" : "error") + "\nRegistros eliminados=" + operationStats.deletedCount;
            console.log(mensaje);
            e.reply('pagos-eliminados', JSON.stringify(pagos));
        });
    } catch (error) {
        console.log(error);
        e.reply('errores', error);
    }
})