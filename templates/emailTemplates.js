require('dotenv').config();
let requestToCompanyHtml = require("./html/request-to-company");

let templates = {
    requestToCompany: function (company_name, temporary_password, user_email) {
        let email = requestToCompanyHtml.replace(/{company}/g, company_name).replace("{temporary_password}", temporary_password).replace("{email}", user_email);
        return email;
    }
}

module.exports = templates;