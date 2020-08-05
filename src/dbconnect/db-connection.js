const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/casaVerde', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
})
    .then(db => console.log('conectade'))
    .catch(error => console.log(error));
