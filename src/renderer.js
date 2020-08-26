// import { Calendar } from "../node_modules/fullcalendar/main.js";
//para poder enviar los datos de los formularios de la vista se usa el "ipcRenderer"
const { ipcRenderer } = require('electron');
const e = require('express');
const moment = require('moment');
moment.locale("es");
//variables globales para almacenar las listas de datos de la App
var listaClientes = [];
var listaEventos = [];
var listaPagos = [];
var eventosCalendar = [];
var idCliente = '';
var calendar = new Calendar('.calendar', {
    language: 'es',
    style: 'background',
    enableRangeSelection: false,
    enableContextMenu: false
});
var tooltip = null;
var totales = document.querySelectorAll('input[type=number]');
//#region getters
//formularios de la app
const formEvento = document.getElementById('crearEvento');
const formNewCliente = document.getElementById('formNewCliente');
const formCliente = document.getElementById('formCliente');
const formUpdateCliente = document.getElementById('formUpdateCliente');
const formPagos = document.getElementById('formNewPayment');

//valores evento
let fechaEvento = document.querySelector('#fecha');
let clienteEvento = document.querySelector('#cliente');
let precioEvento = document.querySelector('#precio');
let adicionalEvento = document.querySelector('#adicional');
let totalEvento = document.querySelector('#total');
let tipoEvento = document.querySelector('#tipoEvento');
let statusEvento = document.querySelector('#statusEvento');
let comentariosEvento = document.querySelector('#comentarios');

//valores nuevo cliente modal
let nombrenuevoCliente = document.querySelector('#nombrenuevo');
let emailnuevoCliente = document.querySelector('#emailnuevo');
let tlfnuevoCliente = document.querySelector('#telefono1nuevo');
let tlf2nuevoCliente = document.querySelector('#telefono2nuevo');
let comentariosnuevoCliente = document.querySelector('#clientecomentariosnuevo');

//valores nuevo cliente Principal
let nombreCliente = document.querySelector('#nombre');
let emailCliente = document.querySelector('#email');
let tlfCliente = document.querySelector('#telefono1');
let tlf2Cliente = document.querySelector('#telefono2');
let comentariosCliente = document.querySelector('#comentarioscliente');

//valores modificar cliente
let updatenombreCliente = document.querySelector('#updatenombre');
let updateemailCliente = document.querySelector('#updateemail');
let updatetlfCliente = document.querySelector('#updatetelefono1');
let updatetlf2Cliente = document.querySelector('#updatetelefono2');
let updatecomentariosCliente = document.querySelector('#updatecomentarioscliente');
let updateIdCliente = document.querySelector('#idCliente');

//valores pagos
let eventoPay = document.querySelector('#paymentEvent');
let paymentDate = document.querySelector('#paymentDate');
let paymentType = document.querySelector('#paymentType');
let paymentClient = document.querySelector('#paymentClient');
let paymentMount = document.querySelector('#paymentMount');
let restanteHTML = document.querySelector("#paymentRemain");
//#endregion
//const modelCliente = require('./models/cliente');

//incializacion de los calendarios

    // new Calendar('.calendar', {
    //     style: 'background',
    //     language: 'es',
    //     dataSource: eventosCalendar
    //     });
//calendar.setStyle('background');

//document.querySelector('.calendar').addEventListener();

clienteEvento.addEventListener('change', e => {
    var seleccion = clienteEvento.value;
    console.log(seleccion);
    let formularionuevo = document.getElementById('nuevocliente');
    if (seleccion == "newCliente") {
        formularionuevo.style.display = "block";
        console.log("seccion cliente mostrada");
        M.toast({ html: "seccion cliente mostrada" });
    } else {
        if (formularionuevo.style.display === "none") {
            console.log("ya esta oculta la seccion");
            //M.toast({ html: "ya esta oculta la seccion" });
        } else {
            formularionuevo.style.display = "none";
            console.log("seccion cliente ocultada");
            //M.toast({ html: "seccion cliente ocultada" });
        }

    }
});

formEvento.addEventListener('submit', e => {
    e.preventDefault();
    console.log('entra en el evento submit para crear el objeto evento');
    const evento = {
        fecha: fechaEvento.value,
        cliente: clienteEvento.value,
        tipo: parseInt(tipoEvento.value),
        status: statusEvento.value,
        precio: parseInt(precioEvento.value),
        adicional: parseInt(adicionalEvento.value),
        total: parseInt(totalEvento.value),
        comentarios: comentariosEvento.value
    };
    console.log(evento);
    ipcRenderer.send('newEvento', evento);
});

formNewCliente.addEventListener('submit', e => {
    e.preventDefault();
    console.log("entro en el listener del formulario cliente");
    const newCliente = {
        nombre: nombrenuevoCliente.value,
        email: emailnuevoCliente.value,
        telefono: tlfnuevoCliente.value,
        telefono_respaldo: tlf2nuevoCliente.value,
        comentarios: clientecomentariosnuevo.value
    }
    ipcRenderer.send('newClienteModal', newCliente);
});

formCliente.addEventListener('submit', e => {
    e.preventDefault();
    const newCliente = {
        nombre: nombreCliente.value,
        email: emailCliente.value,
        telefono: tlfCliente.value,
        telefono_respaldo: tlf2Cliente.value,
        comentarios: comentarioscliente.value
    }
    ipcRenderer.send('newCliente', newCliente);
    M.toast({ html: "Registrando..." });
});

formUpdateCliente.addEventListener('submit', async e => {
    e.preventDefault();
    const dataCliente = {
        id: idCliente,
        nombre: updatenombreCliente.value,
        email: updateemailCliente.value,
        telefono: updatetlfCliente.value,
        telefono_respaldo: updatetlf2Cliente.value,
        comentarios: updatecomentariosCliente.value
    }
    console.log("editando el registro " + updateIdCliente.value);
    ipcRenderer.send('editar-cliente', dataCliente);
    M.toast({ html: "Actualizando cliente..." });
});

ipcRenderer.on('cliente-nuevo-creado', (e, args) => {
    console.log(args);
    formCliente.reset();
    listaClientes.push(JSON.parse(args));
    organizarClientes(listaClientes);
    M.toast({ html: "Cliente Registrado Exitosamente!" });
});
ipcRenderer.on("cliente-eliminado", (e, cliente) => {
    const id = JSON.parse(cliente);
    const resultList = listaClientes.filter(c => {
        return c._id !== id;
    });
    listaClientes = resultList;
    organizarClientes(listaClientes);
    M.toast({ html: "Eliminación exitosa" });
});

ipcRenderer.on("cliente-editado", (e, args) => {
    formUpdateCliente.reset();
    try {
        const clienteActualizado = JSON.parse(args);
        console.log(clienteActualizado);
        listaClientes.map(cliente => {
            if (cliente._id === clienteActualizado._id) {
                cliente.nombre = clienteActualizado.nombre;
                cliente.email = clienteActualizado.email;
                cliente.telefono = clienteActualizado.telefono;
                cliente.telefono_respaldo = clienteActualizado.telefono_respaldo;
                cliente.comentarios = clienteActualizado.comentarios;
            }
            return cliente;
        });
        organizarClientes(listaClientes);
        M.toast({ html: "Cliente actualizado!" });
    } catch (error) {
        console.log(error);
        M.toast({ html: error });
    }

});

ipcRenderer.on("error-proceso-cliente", (e, args) => {
    M.toast({ html: "se guardó el cliente pero ocurrió el siguiente error:" + args });
});

ipcRenderer.on("errores", (e, error) => {
    console.log(error);
    M.toast({ html: error });
});

// function cerrarModales(modal) {
//     for (let index = 0; index < modal.length; index++) {
//         const element = modal[index];
//         console.log(element);
//         //modal[element].reset();
//     }
// };

// const x = document.querySelectorAll('.modal-close');
// console.log(x);
// x.addEventListener('click', cerrarModales(x));

function editarCliente(cliente) {
    idCliente = cliente;
    const dataCliente = listaClientes.find(x => x._id === cliente);
    //limpieza de formulario
    formUpdateCliente.reset();
    //relleno de formulario
    updateIdCliente.value = dataCliente._id;
    updatenombreCliente.value = dataCliente.nombre;
    updatetlfCliente.value = dataCliente.telefono;
    updatetlf2Cliente.value = dataCliente.telefono_respaldo;
    updateemailCliente.value = dataCliente.email;
    updatecomentariosCliente.value = dataCliente.comentarios;
    M.updateTextFields();
}
function eliminarCliente(cliente) {
    const response = confirm("Seguro que quiere proceder con la eliminacion?");
    if (response) {
        console.log("cliente a eliminar: " + cliente);
        // const elementos = [];
        // elementos.push(clientes);
        // if (elementos.length > 1) {
        //     M.toast({ html: "Eliminando" + elementos.length + "registros..." });
        // } else {
            M.toast({ html: "Eliminando a " + cliente + "..." });
        // }
        ipcRenderer.send("eliminar-cliente", cliente);
    } else {
        M.toast({ html: "Operacion cancelada" });
    }

}
function organizarClientes(clientes) {
    const lista = document.getElementById("listCliente");
    // console.log("metodo Organizar Clientes:\n" + clientes);
    lista.innerHTML = '';
    const newClienteOption = document.createElement("option");
    const defaultOption = document.createElement("option");
    newClienteOption.text = "Nuevo Cliente";
    newClienteOption.value = "newCliente";
    defaultOption.text = "Seleccione";
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    clienteEvento.append(defaultOption, newClienteOption);
    paymentClient.append(defaultOption.cloneNode(true));
    if (clientes.length > 0) {
    clientes.map(x => {

        lista.innerHTML += '<li class="collection-item">'
        + '<span class="title">' + x.nombre + '<br></span>'
        + x.telefono + '<br>'
        + x.comentarios
        + '<a class="secondary-content" href="#" '
        + 'onclick="eliminarCliente(\'' + x._id + '\')">'
        + '<i class="material-icons">delete</i></a>'
        + '<a class="secondary-content modal-trigger" '
        + 'href="#updateCliente" '
        + 'onclick="editarCliente(\'' + x._id + '\')">'
        + '<i class="material-icons">edit</i></a>'
        + '</li>';

        const option = document.createElement("option");
        option.value = x._id;
        option.text = x.nombre;
        clienteEvento.append(option);
        paymentClient.append(option.cloneNode(true));

        // clienteEvento.innerHTML += '<option value="'
        //     + x._id + '">'
        //     + x.nombre
        //     + '<p class="helper-text">' + x.telefono + '</p>'
        //     + '<p class="helper-text">' + x.comentarios + '</p>'
        //     + '</option>';
    });
        } else {
        lista.innerHTML += '<li class="collection-item">'
        + '<span class="title">De momento no hay clientes registrados en el sistema</span></li>';
    }
    //por ultimo vuelvo a iniciar los combobox de clientes
    let dropdownClienteEvento = M.FormSelect.getInstance(clienteEvento);
    let dropdownPagoCliente = M.FormSelect.getInstance(paymentClient);
    if (dropdownClienteEvento != null) {
        dropdownClienteEvento.destroy();
        M.FormSelect.init(clienteEvento);
    } else {
        M.FormSelect.init(clienteEvento);
    }

    if (dropdownPagoCliente != null) {
        dropdownPagoCliente.destroy();
        M.FormSelect.init(paymentClient);
    } else {
        M.FormSelect.init(paymentClient);
    }
}
ipcRenderer.send("get-clientes");

ipcRenderer.on('get-clientes', (e, args) => {
    // console.log("clientes retornados:\n" + args);
    listaClientes = JSON.parse(args);
    organizarClientes(listaClientes);
});

//#region Eventos
function organizarEventos(eventos) {
    const lista = document.getElementById('listEvento');
    let cliente = {};
    lista.innerHTML = '';
    if (eventos.length > 0) {
        eventosCalendar = [];
        eventos.map(e => {
            cliente = listaClientes.find(x => x._id === e.cliente);
            const fecha = moment(e.fecha, 'YYYY-MM-DD');
            let tipo = "";
            const listItem = document.createElement("li");
            const eventItem = document.createElement("div");
            const payOption = document.createElement("a");
            let deleteOption = document.createElement("a");
            const payIcon = document.createElement("i");
            const deleteIcon = document.createElement("i");
            switch (e.tipo) {
                case 1:
                tipo = "Cumpleaños";
                break;
                case 2:
                tipo = "Aniversario";
                break;
                case 3:
                tipo = "Boda";
                break;
                case 4:
                tipo = "Bautizo";
                break;
                case 5:
                tipo = "Reunion";
                break;
                case 6:
                tipo = "Otro";
                break;
            }
            eventItem.textContent = fecha.format("dddd Do MMMM YYYY") + ": " + cliente.nombre;
            // listItem.setAttribute("onclick", 'alert(\'' + e._id + '\\n' + fecha.format("YYYY-MM-DD") + '\\n' + cliente.nombre + '\\n' + e.total + '\\n' + e.comentarios + '\')');
            listItem.classList.add("collection-item");

            payOption.classList.add("secondary-content", "modal-trigger");
            payOption.setAttribute("href", "#newPayment");
            payOption.setAttribute("onclick", "pagarEvento(\'" + e._id + "\')");
            deleteOption.classList.add("secondary-content");
            deleteOption.setAttribute("href", "#");
            deleteOption.setAttribute("onclick", "eliminarEvento(\'" + e._id + "\')");
            //este de abajo no funciona
            // deleteOption.addEventListener("click", eliminarEvento(e._id));

            payIcon.classList.add("material-icons");
            deleteIcon.classList.add("material-icons");
            payIcon.textContent = "credit_card";
            deleteIcon.textContent = "delete";
            deleteOption.appendChild(deleteIcon);
            payOption.appendChild(payIcon);
            eventItem.append(deleteOption, payOption);
            listItem.appendChild(eventItem);
            lista.appendChild(listItem);
            // console.log("lista justo despues del appendChild:\n" + lista.innerHTML);
            const evCalendar = {
                id: e._id,
                startDate: new Date(moment(e.fecha, 'YYYY-MM-DD')),
                endDate: new Date(moment(e.fecha,'YYYY-MM-DD')),
                name: tipo,
                details: e.comentarios
            }
            eventosCalendar.push(evCalendar);
        });
        //se agregan los eventos al calendario
        calendar.setDataSource(eventosCalendar);
    } else {
        const listItem = document.createElement("li");
        const eventItem = document.createElement("div");
        listItem.classList.add("collection-item");
        eventItem.textContent = "De momento no hay fechas ocupadas.";
        listItem.appendChild(eventItem);
        lista.appendChild(listItem);
    }

}
ipcRenderer.send("get-eventos");

ipcRenderer.on("get-eventos", (e, args) => {
    // console.log("Eventos retornados:\n" + args);
    listaEventos = JSON.parse(args);
    organizarEventos(listaEventos);
});

ipcRenderer.on('evento-creado', (e, args) => {
    let evento = JSON.parse(args);
    console.log("evento sin parsear:\n" + args);
    formEvento.reset();
    listaEventos.push(evento);
    organizarEventos(listaEventos);
    M.toast({ html: "Evento registrado exitosamente!" });
});

function eliminarEvento(id) {
    const response = confirm("Seguro que quiere borrar el evento?");
    if (response) {
        console.log("eliminando evento de id= " + id + " ...");
        M.toast({ html: "Eliminando evento..." });ipcRenderer.send("eliminar-evento", id);
    } else {
        M.toast({ html: "Operacion cancelada" });
    }
}

ipcRenderer.on("evento-eliminado", (e, args) => {
    const id = JSON.parse(args);
    console.log("lista de pagos del evento: " + JSON.stringify(id.pagos) + "tamaño lista=" + id.pagos.length);
    let result = listaEventos.filter(evento => { return evento._id !== id._id });
    if (id.pagos.length > 0) {
        // e.sender.send('eliminar-pagos-evento', id.pagos);
        e.sender.send('eliminar-pagos-evento', id._id);
    }
    // console.log("eventos restantes (no debe aparecer el id: " + JSON.stringify(id) + "):\n" + JSON.stringify(result));
    // console.log("Ahora la lista de eventos antes de ser reemplazada por la lista nueva: " + listaEventos);
    listaEventos = result;
    organizarEventos(listaEventos);
    M.toast({ html: "Evento eliminado exitosamente" });
});

ipcRenderer.on("evento-actualizado", (e, args) => {
    const evento = JSON.parse(args);
    console.log("evento actualizado: " + evento);
    let result = listaEventos.filter(ev => { return ev._id !== evento._id });
    console.log("reemplazo el evento viejo por el actualizado...");
    result.push(evento);
    console.log("lista final (result): " + JSON.stringify(result));
    listaEventos = result;
    console.log("reemplazo la variable listaEventos por esta: " + JSON.stringify(listaEventos));
    organizarEventos(listaEventos);
    M.toast({ html: "Evento editado exitosamente" });
})
//#endregion
//#region Pagos
function organizarPagos(pagos) {
    const lista = document.getElementById('listPago');
    lista.innerHTML = '';
    pagos.map(p => {

    });
}

formPagos.addEventListener('submit', async e => {
    e.preventDefault();
    let ev = listaEventos.find(e => e.fecha.substring(0, 10) === eventoPay.value);
    console.log("evento que se paga: " + JSON.stringify(ev));
    const cli = listaClientes.find(c => c._id === paymentClient.value);
    const monto = parseInt(paymentMount.value);
    const deuda = parseInt(restanteHTML.value);
    const restante = deuda - monto;
    let pago = null;
    if (restante < 0) {
        M.toast({ html: "Operacion inválida: se está haciendo un pago mayor al monto adeudado" });
        console.log("Operacion inválida: se está haciendo un pago mayor al monto adeudado");
    } else if (restante == 0) {
        ev.status = "Pagado";
        pago = {
            evento: ev,
            tipo: parseInt(paymentType.value),
            cliente: cli,
            monto: monto,
            fecha: paymentDate.value
        }
        ipcRenderer.send('nuevo-pago', pago);
        console.log("pago...\n" + JSON.stringify(pago));
        M.toast({html:"creando pago..."});
    } else {
        pago = {
            evento: ev,
            tipo: parseInt(paymentType.value),
            cliente: cli,
            monto: monto,
            fecha: paymentDate.value
        }
        ipcRenderer.send('nuevo-pago', pago);
        console.log("pago...\n" + JSON.stringify(pago));
        M.toast({html:"creando pago..."});
    }

});

ipcRenderer.on("pago-nuevo-creado", (e, args) => {
    const result = JSON.parse(args);
    const pagoNuevo = result.pago;
    let eventoaEditar = result.evento;
    listaPagos.push(pagoNuevo);
    console.log("lista de pagos del evento a editar sin el pago nuevo: " + eventoaEditar.pagos);
    eventoaEditar.pagos.push(pagoNuevo._id);
    console.log("lista de pagos de evento a editar con el pago nuevo: " + eventoaEditar.pagos);
    // let eventos = listaEventos.filter(ev => ev._id !== eventoEditado._id);
    //tipos de pago: 1=Efectivo, 2=Tarjeta, 3=Deposito/Transferencia
    // let eventos = listaEventos.map(ev => {
    //     return ev._id !== eventoEditado._id;
    // });
    // eventos.push(eventoEditado);
    // organizarEventos(eventos);
    //organizarPagos(listaPagos);
    M.toast({ html: "Pago realizado" });
    e.sender.send("editar-evento", eventoaEditar);
});

function pagarEvento(id) {
    formPagos.reset();
    console.log("parametro de pagarEvento = " + id);
    const evento = listaEventos.find(e => e._id === id);
    const cliente = listaClientes.find(c => c._id === evento.cliente);
    // for (let x = 0; x < paymentClient.options.length; x++) {
    //     const option = paymentClient.options[x];
    //     if (option.value == cliente._id) {
    //         option.setAttribute("selected", true);
    //         //break;
    //     } else {
    //         option.setAttribute("selected", false);
    //         continue;
    //     }
    // }
    paymentClient.nodeValue = cliente._id;
    // paymentClient.children.item(cliente.nombre).setAttribute("selected", true);
    console.log("Evento:\n" + JSON.stringify(evento) + "\n\nCliente:\n" + JSON.stringify(cliente));
    console.log("Evento a pagar:\n" + JSON.stringify(evento));
    const totalEvento = evento.total;
    if (evento.pagos.length > 0) {
        let pago = null;
        console.log("bucle pagos... (evento.pagos)= " + evento.pagos);
        let pagos = 0;
        for (let x = 0; x < evento.pagos.length; x++) {
            pago = listaPagos.find(p => p._id === evento.pagos[x]);
            pagos = pagos + pago.monto;
            console.log("pago (" + pagos + ") + pagos de evento= " + pagos);
        }
        const restante = totalEvento - pagos;
        restanteHTML.value = restante;
        console.log("restante= " + restante);
    } else {
        restanteHTML.value = totalEvento;
    }

    console.log("evento.fecha: " + evento.fecha + "\nevento.fecha moment: " + moment(evento.fecha) + "\nevento.fecha moment formateado: " + moment(evento.fecha).format("YYYY-MM-DD") + "\nevento.fecha por new Date: " + new Date(evento.fecha));

    let fechaEvento = evento.fecha.substring(0,10); console.log("FechaEvento=" + fechaEvento);
    paymentEvent.value = fechaEvento;
    paymentClient.value = cliente.nombre;
    // paymentDate.value = new Date();
}
ipcRenderer.send("get-pagos");
ipcRenderer.on("get-pagos", (e, args) => {
    listaPagos = JSON.parse(args);
    organizarPagos(listaPagos);
});
ipcRenderer.on("pagos-eliminados", (e, args) => {
    const registros = JSON.parse(args);
    console.log("Registros eliminados:\n" + JSON.stringify(registros));
    let listanueva = [];
    listaPagos.forEach(pago => {
       for (let x = 0; x < registros.length; x++) {
           const p = registros[x];
           if (pago._id !== p._id) {
               listanueva.push(pago);
           }
       }
    });
    listaPagos = listanueva;
    organizarPagos(listaPagos);
});
//#endregion

document.querySelector('.calendar').addEventListener('clickDay', (e) => {
    if (e.events.length > 0) {
        alert("Fecha ocupada");
    } else {
        let elem = document.getElementById('modaltest');
        let modal = M.Modal.getInstance(elem);
        modal.open();
        fechaEvento.value = moment(e.date).format('yyyy-MM-DD');
    }

});

document.querySelector('.calendar').addEventListener('mouseOnDay', (e) => {
    if(e.events.length > 0) {
        var content = '';
        tooltip = null;
        tooltip = e.element;
        for (var i in e.events) {
            console.log("for events: " + JSON.stringify(e.events[i]));
            content += '<div class="">'
            + '<div class="event-name" style="color:' + e.events[i].color + '">' + e.events[i].name + '</div>'
            + '<div class="event-location">' + e.events[i].details + '</div>'
            + '</div>';
        }
        M.Tooltip.init(tooltip, {
            html: content
        });
        const instance = M.Tooltip.getInstance(tooltip);
        instance.open();
        // if (tooltip !== null) {
            // tooltip.destroy();
            // tooltip = null;
        // }
        // tooltip = tippy(e.element, {
        //     placement: 'right',
        //     content: content,
        //     animateFill: false,
        //     animation: 'shift-away',
        //     arrow: true
        // });
        // tooltip.show();
        // let elements = document.querySelector('.event-tooltip-content');
        // M.Tooltip.init(elements);
        // $(e.element).popover({
        //     trigger: 'manual',
        //     container: 'body',
        //     html:true,
        //     content: content
        // });

        // $(e.element).popover('show');
    }
});
document.querySelector('.calendar').addEventListener('mouseOutDay', (e) => {
    if (e.events.length > 0) {
        if (tooltip !== null) {
            let instance = M.Tooltip.getInstance(tooltip);
            instance.destroy();
            tooltip = null;
            console.log("tooltip destruido");
        }
        // let instance = M.Tooltip.getInstance(elements[0]);
        // if (instance.isOpen() && instance.isHovered()) {
        //     instance.destroy();
        // }

    }
});

const sumarTotal = () => {
    let precio = precioEvento.value;
    let adicional = adicionalEvento.value;
    let total = totalEvento;

    precio = (precio == null || precio == "" || precio == undefined) ? 0 : precio;

    adicional = (adicional == null || adicional == "" || adicional == undefined) ? 0 : adicional;

    total.value = parseInt(precio) + parseInt(adicional);
}

totales.forEach((campo) => {
    campo.addEventListener('keyup', sumarTotal);
});