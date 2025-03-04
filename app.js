
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cors = require('cors');

const usersRoute = require('./routes/users');
//const uploadMusics = require("./utils/uploadMusics");

/*setTimeout(() => {
    console.log("LOADING: Preparando para subir as músicas");
    uploadMusics.upload();
}, 1000)*/

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({
    origin: process.env.URL_SITE, // Remova a barra extra no final
    credentials: true // Permite envio de cookies/sessão
}));

require('dotenv').config();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.URL_SITE);
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).send({});
    }

    next();
});

app.use('/usuarios', usersRoute);

app.use('/public', express.static('public'));

app.use((req, res, next) => {
    const erro = new Error("Não encontrado");
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.send({
       mensagem: error.message
    });
});

module.exports = app;