// import { Calendar } from "../node_modules/fullcalendar/main.js";
//para poder enviar los datos de los formularios de la vista se usa el "ipcRenderer"
const { ipcRenderer } = require('electron');
const e = require('express');
const moment = require('moment');
//variables globales para almacenar las listas de datos de la App
var listaClientes = [];
var listaEventos = [];
var listaPagos = [];
var eventosCalendar = [];
var idCliente = '';
var calendar = new Calendar('.calendar', {
    language: 'es',
    enableRangeSelection: false,
    enableContextMenu: false
});
var tooltip = null;

//formularios de la app
const formEvento = document.getElementById('crearEvento');
const formNewCliente = document.getElementById('formNewCliente');
const formCliente = document.getElementById('formCliente');
const formUpdateCliente = document.getElementById('formUpdateCliente');

//valores evento
const fechaEvento = document.querySelector('#fecha');
const clienteEvento = document.querySelector('#cliente');
const precioEvento = document.querySelector('#precio');
const adicionalEvento = document.querySelector('#adicional');
const tipoEvento = document.querySelector('#tipoEvento');
const statusEvento = document.querySelector('#statusEvento');
const comentariosEvento = document.querySelector('#comentarios');

//valores nuevo cliente modal
const nombrenuevoCliente = document.querySelector('#nombrenuevo');
const emailnuevoCliente = document.querySelector('#emailnuevo');
const tlfnuevoCliente = document.querySelector('#telefono1nuevo');
const tlf2nuevoCliente = document.querySelector('#telefono2nuevo');
const comentariosnuevoCliente = document.querySelector('#clientecomentariosnuevo');

//valores nuevo cliente Principal
const nombreCliente = document.querySelector('#nombre');
const emailCliente = document.querySelector('#email');
const tlfCliente = document.querySelector('#telefono1');
const tlf2Cliente = document.querySelector('#telefono2');
const comentariosCliente = document.querySelector('#comentarioscliente');

//valores modificar cliente
const updatenombreCliente = document.querySelector('#updatenombre');
const updateemailCliente = document.querySelector('#updateemail');
const updatetlfCliente = document.querySelector('#updatetelefono1');
const updatetlf2Cliente = document.querySelector('#updatetelefono2');
const updatecomentariosCliente = document.querySelector('#updatecomentarioscliente');
const updateIdCliente = document.querySelector('#idCliente');

//const modelCliente = require('./models/cliente');

//incializacion de los calendarios

    // new Calendar('.calendar', {
    //     style: 'background',
    //     language: 'es',
    //     dataSource: eventosCalendar
    //     });
calendar.setStyle('background');

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
    const totalEvento = parseInt(precioEvento.value) + parseInt(adicionalEvento.value);
    console.log('entra en el evento submit para crear el objeto evento');
    const evento = {
        fecha: fechaEvento.value,
        cliente: clienteEvento.value,
        tipo: tipoEvento.value,
        status: statusEvento.value,
        precio: precioEvento.value,
        adicional: adicionalEvento.value,
        total: totalEvento,
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
ipcRenderer.on("clientes-eliminados", (e, clientes) => {
    const lista = JSON.parse(clientes);
    if (clientes.length > 1) {
        //en construcción...
        listaClientes.forEach()
    } else {
        const resultList = listaClientes.filter(c => {
            return c._id !== clientes[0]._id;
        });
    }
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
function eliminarClientes(clientes) {
    const response = confirm("Seguro que quiere proceder con la eliminacion?");
    if (response) {
        console.log("elementos a eliminar:\n" + clientes);
        const elementos = [];
        elementos.push(clientes);
        if (elementos.length > 1) {
            M.toast({ html: "Eliminando" + elementos.length + "registros..." });
        } else {
            M.toast({ html: "Eliminando a " + elementos[0].nombre + "..." });
        }
        ipcRenderer.send("eliminar-clientes", elementos);
    }

}
function organizarClientes(clientes) {
    const lista = document.getElementById("listCliente");
    console.log("metodo Organizar Clientes:\n" + clientes);
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
    // clienteEvento.appendChild(newClienteOption);
    // clienteEvento.innerHTML = '<option value="" disabled selected>'
    //     + 'Seleccione</option>';
    clientes.map(x => {
        const parrafo = document.createElement("p");
        lista.innerHTML += '<a class="collection-item modal-trigger" href="#updateCliente" '
        + 'onclick="editarCliente(\'' + x._id + '\')">'
        + '<span class="title">' + x.nombre + '</span>'
        + '<p>' + x.telefono + '</p>'
        + '<p>' + x.comentarios + '</p>'
        + '</a>';

        const option = document.createElement("option");
        option.value = x._id;
        option.text = x.nombre;
        clienteEvento.appendChild(option);
        // clienteEvento.innerHTML += '<option value="'
        //     + x._id + '">'
        //     + x.nombre
        //     + '<p class="helper-text">' + x.telefono + '</p>'
        //     + '<p class="helper-text">' + x.comentarios + '</p>'
        //     + '</option>';
    });
    M.FormSelect.init(clienteEvento);
}
ipcRenderer.send("get-clientes");

ipcRenderer.on('get-clientes', (e, args) => {
    console.log("clientes retornados:\n" + args);
    listaClientes = JSON.parse(args);
    organizarClientes(JSON.parse(args));
});

function organizarEventos(eventos) {
    const lista = document.getElementById('listEvento');
    let cliente = {};
    lista.innerHTML = '';
    eventosCalendar = [];
    eventos.map(e => {
        cliente = listaClientes.find(x => x._id == e.cliente);
        const listItem = document.createElement("li");
        const eventItem = document.createElement("div");
        const payOption = document.createElement("a");
        const deleteOption = document.createElement("a");
        const payIcon = document.createElement("i");
        const deleteIcon = document.createElement("i");
        eventItem.textContent = e.fecha + " a nombre de: " + cliente.nombre;
        listItem.setAttribute("onclick", 'alert(\'' + e._id + '\\n' + e.fecha + '\\n' + cliente.nombre + '\\n' + e.total + '\\n' + e.comentarios +'\')');
        listItem.setAttribute("class", "collection-item");
        payOption.setAttribute("class", "secondary-content");
        deleteOption.setAttribute("class", "secondary-content");
        payIcon.setAttribute("class", "material-icons");
        deleteIcon.setAttribute("class", "material-icons");
        payIcon.textContent = "payment";
        deleteIcon.textContent = "delete";
        deleteOption.appendChild(deleteIcon);
        payOption.appendChild(payIcon);
        eventItem.append(deleteOption);
        eventItem.append(payOption);
        listItem.appendChild(eventItem);
        lista.append(listItem);
        const evCalendar = {
            id: e._id,
            startDate: new Date(e.fecha),
            endDate: new Date(e.fecha),
            name: e.tipo,
            details: e.comentarios
        }
        eventosCalendar.push(evCalendar);
    });
    console.log("eventos calendario: " + JSON.stringify(eventosCalendar));
    //se agregan los eventos al calendario
    calendar.setDataSource(eventosCalendar);
}
ipcRenderer.send("get-eventos");

ipcRenderer.on("get-eventos", (e, args) => {
    console.log("Eventos retornados:\n" + args);
    organizarEventos(JSON.parse(args));
});

ipcRenderer.on('evento-creado', (e, args) => {
    let evento = JSON.parse(args);
    console.log("evento parseado:\n" + evento);
    formEvento.reset();
    listaEventos.push(evento);
    organizarEventos(listaEventos);
    M.toast({ html: "Evento creado exitosamente!" });
});

function organizarPagos(pagos) {
    const lista = document.getElementById('listPago');
    lista.innerHTML = '';
    pagos.map(p => {

    });
}
ipcRenderer.send("get.pagos");

// var calendario = document.getElementById("calendar");
//     let instanciaCalendar = new Calendar(calendario);
//     instanciaCalendar.render();

document.querySelector('.calendar').addEventListener('clickDay', (e) => {
        let elem = document.getElementById('modaltest');
        let modal = M.Modal.getInstance(elem);
        modal.open();
        fechaEvento.value = moment(e.date).format('yyyy-MM-DD');
});

document.querySelector('.calendar').addEventListener('mouseOnDay', (e) => {
    if(e.events.length > 0) {
        var content = '';

        for (var i in e.events) {
            console.log("for events: " + JSON.stringify(e.events[i]));
            content += '<div class="event-tooltip-content">'
            + '<div class="event-name" style="color:' + e.events[i].color + '">' + e.events[i].name + '</div>'
            + '<div class="event-location">' + e.events[i].details + '</div>'
            + '</div>';
        }
        if (tooltip !== null) {
            tooltip.destroy();
            tooltip = null;
        }
        tooltip = tippy(e.element, {
            placement: 'right',
            content: content,
            animateFill: false,
            animation: 'shift-away',
            arrow: true
        });
        tooltip.show();
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
        // let elements = document.querySelector('.event-tooltip-content');
        if (tooltip!==null) {
            tooltip.destroy();
            tooltip = null;
        }
        // let instance = M.Tooltip.getInstance(elements[0]);
        // if (instance.isOpen() && instance.isHovered()) {
        //     instance.destroy();
        // }

    }
});