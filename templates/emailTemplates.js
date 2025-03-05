require('dotenv').config();
let contactReceived = require("./html/contactReceived");
let contactReceivedResponse = require("./html/contactReceivedResponse");

let templates = {
    contactReceived: function (mensagem, motivo, email, nome) {
        let emailHtml = contactReceived.replace("{mensagem}", mensagem).replace("{motivo}", motivo).replace("{email}", email).replace("{nome}", nome);
        return emailHtml;
    },
    contactReceivedResponse: function (mensagem, motivo, email, nome) {
        let emailHtml = contactReceivedResponse.replace("{mensagem}", mensagem).replace("{motivo}", motivo).replace("{email}", email).replace("{nome}", nome);
        return emailHtml;
    }
}

module.exports = templates;