const { model, Schema } = require('mongoose');
//const evento = require('mongoose').model("pago");
const evento = require('./event');
const cliente = require('mongoose').model("cliente");

const newPayment = new Schema({
    evento: {
        type: Schema.Types.ObjectId,
        ref: "evento",
        required: true
    },
    tipo: {
        type: Number,
        required: true
    },
    cliente: {
        type: Schema.Types.ObjectId,
        ref: "cliente",
        required: true
    },
    monto: {
        type: Number,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    }
});

module.exports = model("pago", newPayment);