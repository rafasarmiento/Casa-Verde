const { model, Schema } = require('mongoose');

const newCliente = new Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required:false
    },
    telefono: {
        type: String,
        required: true
    },
    telefono_respaldo: {
        type: String,
        required:false
    },
    comentarios: {
        type: String,
        required:false
    }
});

module.exports = model("cliente", newCliente);