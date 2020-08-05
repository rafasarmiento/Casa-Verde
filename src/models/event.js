const { model, Schema } = require('mongoose');
//importo la clase "autor" y la clase "pago" ya que las demas clases estan relacionadas a ésta
const cliente = require('mongoose').model("cliente");
//const pago = require('mongoose').model("pago");
const pago = require('./payment');

const newEvento = new Schema({
    fecha: {
        type: Date,
        required: true
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: "cliente",
        required: true
    },
    tipo: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    adicional: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    comentarios: {
        type: String,
        required: false
    },
    pagos: [{
        type: Schema.Types.ObjectId,
        ref: pago,
        required: false
    }]
});

module.exports = model("evento", newEvento);