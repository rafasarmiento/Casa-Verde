// import { Calendar } from "fullcalendar";
function establecerVersion(idSelector, version) {
    let elemento = document.getElementById(idSelector);

    if (elemento) {
        elemento.innerText = version;
    }

}

window.addEventListener('DOMContentLoaded', () => {
    const componentes = ['Node', 'Chrome', 'Electron'];
    for (const componente of componentes) {
        establecerVersion(`version${componente}`, process.versions[componente.toLowerCase()]);
    }
    // por alguna extraña razon que desconozco en la linea 14 el primer parametro que se le pasa lo lee como debe ser al estar rodeada por esa tilde inversa (`) pero no funciona ni con comillas simples (') ni dobles (")

    var modales = document.querySelectorAll('.modal');
    let combos = document.querySelectorAll('.select');

    var instanciaModal = M.Modal.init(modales);
    let instanciaCombos = M.FormSelect.init(combos);

    var secciones = document.querySelectorAll('.tabs');
    let tabs = M.Tabs.init(secciones);

    var botonFlotante = document.querySelector('.fixed-action-btn');
    let botonFlotanteInst = M.FloatingActionButton.init(botonFlotante, {
        hoverEnabled: false
    });

    var textuales = document.querySelectorAll('input[type="text"], textarea');
    let contadores = M.CharacterCounter.init(textuales,);

    var camposFecha = document.querySelectorAll('.datepicker');
    let fechas = M.Datepicker.init(camposFecha,
        {
            autoClose: true,
            format: "dd/mm/yyyy"
        });

});