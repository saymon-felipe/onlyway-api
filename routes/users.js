const express = require('express');
const router = express.Router();
const login = require("../middleware/login");
const _usersService = require("../services/usersService");
const functions = require("../utils/functions");
const axios = require("axios");
const jwt = require('jsonwebtoken');

function returnUserId(req) {
    let token = req.headers.authorization?.split(" ")[1];

    let decode = {
        id: 0
    }

    if (token) {
        decode = jwt.verify(token, process.env.JWT_KEY);
    }

    const idUsuario = decode.id || 0;

    return idUsuario;
}

router.post("/google-login", async (req, res) => {
    const { token } = req.body;

    try {
        // 🔹 Pegando o Token de Acesso do Google
        const { data } = await axios.post("https://oauth2.googleapis.com/token", null, {
            params: {
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.URL_SITE,
                grant_type: "authorization_code",
                code: token
            }
        });

        const accessToken = data.access_token;

        const { data: userInfo } = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const results = await functions.executeSql(
            `
                SELECT
                    *
                FROM
                    usuarios
                WHERE
                    codigo = ?
            `, [userInfo.id]
        )

        let userId = results[0]?.id;

        if (results.length == 0) {
            let insertedUser = await functions.executeSql(
                `
                    INSERT INTO
                        usuarios
                        (codigo, nome, email, url_foto_perfil)
                    VALUES
                        (?, ?, ?, ?)
                `, [userInfo.id, userInfo.given_name, userInfo.email, userInfo.picture]
            )

            userId = insertedUser.insertId;
        }

        _usersService.login(userId).then((jwtToken) => {
            let returnObj = {
                user: userInfo,
                token: jwtToken
            }
            
            let response = functions.createResponse("Usuário autenticado com sucesso", returnObj, "POST", 200);
            return res.status(200).send(response);
        })        
    } catch (error) {
        return res.status(500).send(error);
    }
});

router.post("/toggle-star-music", login, (req, res, next) => {
    _usersService.toggleStarMusic(req.body.music.author + " - " + req.body.music.title, req.usuario.id || 0).then(() => {
        let response = functions.createResponse("Ação realizada com sucesso", null, "POST", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
})

router.get("/get-favorited-musics", (req, res, next) => {
    _usersService.getFavoritedMusics(returnUserId(req)).then((results) => {
        let response = functions.createResponse("Retorno das músicas favoritadas", results, "GET", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
})

router.get("/get-musics", (req, res, next) => {
    _usersService.getMusics(returnUserId(req)).then((results) => {
        let response = functions.createResponse("Retorno das músicas", results, "GET", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
})

router.post("/contact", (req, res, next) => {
    _usersService.insertContact(req.body.mensagem, req.body.motivo, req.body.email, req.body.nome).then((results) => {
        let response = functions.createResponse("Retorno das músicas", results, "GET", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
})

router.post("/check_jwt", (req, res, next) => {
    _usersService.checkJwt(req.body.token).then((results) => {
        let response = functions.createResponse("Token válido e foi renovado", results, "POST", 200);
        return res.status(200).send(response);
    }).catch((error) => {
        return res.status(500).send(error);
    })
});

/*router.post("/register", (req, res, next) => {
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
    
});*/

module.exports = router;