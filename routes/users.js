const express = require('express');
const router = express.Router();
const login = require("../middleware/login");
const _usersService = require("../services/usersService");
const functions = require("../utils/functions");

router.post("/register", (req, res, next) => {
    _usersService.register(req.body.email, req.body.name, req.body.password, req.body.company_id, req.body.token, req.body.temporary_password, req.body.salary, req.body.role, req.body.company_name).then((results) => {
        let response = functions.createResponse("Usuário criado com sucesso", results, "POST", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
});

router.post("/login", (req, res, next) => {
    _usersService.login(req.body.email, req.body.password).then((results) => {
        let returnObj = {
            jwtToken: results
        }
        let response = functions.createResponse("Usuario autenticado com sucesso", returnObj, "POST", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
});

router.post("/check_jwt", (req, res, next) => {
    _usersService.checkJwt(req.body.token).then((results) => {
        let returnObj = {
            newToken: results
        }
        let response = functions.createResponse("Token válido e foi renovado", returnObj, "POST", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
});

router.get("/return_user", login, (req, res, next) => {
    _usersService.returnUser(req.usuario.id).then((results) => {
        let response = functions.createResponse("Retorno do usuário", results, "GET", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
});

router.post("/edit_user/:user_id", login, (req, res, next) => {
    _usersService.editUser(req.body.name, req.body.salary, req.body.role, req.params.user_id).then((results) => {
        let response = functions.createResponse("Usuário alterado com sucesso", results, "POST", 200);
        return res.status(200).send(response);
    }).catch((error2) => {
        return res.status(500).send(error2);
    })
    
});

module.exports = router;