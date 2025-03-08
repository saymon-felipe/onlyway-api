const functions = require("../utils/functions");
const bcrypt = require('bcrypt');
const sendEmails = require("../config/sendEmail");
const emailTemplates = require("../templates/emailTemplates");
const jwt = require('jsonwebtoken');

let userService = {
    register: function (email, name, password, company_id, token, temporary_password, salary, role = "", company_name = "") {
        return new Promise((resolve, reject) => {
            let self = this;
            
            this.userExists(email).then((results) => {
                if (results.exists) {
                    reject("Usuário já cadastrado");
                } else {
                    bcrypt.hash(password, 10, (errBcrypt, hash) => {
                        if (errBcrypt) {
                            reject(errBcrypt);
                        }

                        let promises = [];
                        let companyId = company_id ? company_id : 0;

                        if (token != "") {
                            promises.push(
                                _companiesService.returnCompanyIdFromAdminToken(token).then((results) => {
                                    companyId = results;
                                })
                            )
                        } else {
                            promises.push(
                                new Promise((resolve, reject) => { resolve(); })
                            )
                        }

                        Promise.all(promises).then(() => {
                            functions.executeSql(
                                `
                                    INSERT INTO
                                        usuarios
                                        (nome, email, senha, url_foto_perfil, id_empresa, senha_temporaria, salario, data_criacao)
                                    VALUES
                                        (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP())
                                `, [
                                    name, 
                                    email, 
                                    hash, 
                                    process.env.URL_API + '/public/default-user-image.png',
                                    companyId,
                                    temporary_password,
                                    salary
                                ]
                            ).then((results2) => {
                                if (token != "") {
                                    _companiesService.acceptCompanyAdmin(results2.insertId, 0, token);
                                }
    
                                let createdUser = {
                                    id: results2.insertId,
                                    email: email
                                }

                                if (role != "") {
                                    self.insertRoleIntoUser(role, results2.insertId).then(() => {
                                        let mailString = emailTemplates.requestToCompany(company_name, temporary_password, email);
                                        sendEmails.sendEmail(mailString, `Você foi convidado para fazer parte da empresa [${company_name}]`, process.env.USER_EMAIL, email);
                                        resolve(createdUser);
                                    })
                                } else {
                                    resolve(createdUser);
                                }
                            }).catch((error2) => {
                                reject(error2);
                            })
                        })
                    })
                }
            })      
        })
    },
    login: function (user_id) {
        return new Promise((resolve, reject) => {
            let token = jwt.sign({
                id: user_id
            }, 
            process.env.JWT_KEY,
            {
                expiresIn: "8h"
            })

            resolve(token);
        })
    },
    checkJwt: function (token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                if (err) {
                    reject("Token inválido");
                } else {
                    let newToken = jwt.sign({
                        id: decoded.id
                    }, process.env.JWT_KEY, {expiresIn: "8h"});
                    resolve(newToken);
                }
            })
        })
    },
    returnUser: function (user_id, clearCache = false) {
        return new Promise((resolve, reject) => {
            functions.executeSql(
                `
                    SELECT
                        u.id,
                        u.nome,
                        u.email,
                        u.salario,
                        u.admin,
                        u.data_criacao,
                        u.url_foto_perfil,
                        u.id_empresa,
                        u.senha_temporaria,
                        ccu.id_cargo,
                        cc.nome AS cargo
                    FROM
                        usuarios u
                    LEFT JOIN
                        config_cargos_usuarios ccu ON u.id = ccu.id_usuario
                    LEFT JOIN
                        config_cargos cc ON ccu.id_cargo = cc.id
                    WHERE
                        u.id = ?
                `, [user_id], !clearCache, 60
            ).then((results) => {
                let user = {
                    id: results[0].id,
                    nome: results[0].nome,
                    email: results[0].email,
                    salario: results[0].salario,
                    admin: results[0].admin,
                    id_empresa: results[0].id_empresa,
                    data_criacao: results[0].data_criacao,
                    url_foto_perfil: results[0].url_foto_perfil,
                    senha_temporaria: results[0].senha_temporaria,
                    cargo: results[0].cargo,
                    id_cargo: results[0].id_cargo || "",
                    status: { //todo: fazer a parte de notificações
                        notifications: 1
                    }
                }

                resolve(user);
            }).catch((error) => {
                reject(error);
            })
        })
    },
    editUser: function (user_name, user_salary, user_role, user_id) {
        return new Promise((resolve, reject) => {
            let self = this;

            functions.executeSql(
                `
                    UPDATE
                        usuarios
                    SET 
                        nome = ?,
                        salario = ?
                    WHERE
                        id = ?
                `, [user_name, user_salary, user_id]
            ).then((results) => {
                self.checkIfUserHaveRole(user_id).then((response) => {
                    if (response) {
                        self.changeRoleOfUser(user_role, user_id).then(() => {
                            this.returnUser(user_id, true);
                            resolve();
                        })
                    } else {
                        self.insertRoleIntoUser(user_role, user_id).then(() => {
                            resolve();
                        })
                    }
                })
            }).catch((error) => {
                reject(error);
            })
        })
    },
    toggleStarMusic: function (musicTitle, user_id) {
        return new Promise((resolve, reject) => {
            functions.executeSql(
                `
                    SELECT
                        *
                    FROM
                        musicas_curtidas
                    WHERE
                        id_musica = (SELECT id FROM musicas WHERE identifier = ?)
                    AND
                        id_usuario = ?
                `, [musicTitle, user_id]
            ).then((results) =>{
                if (results.length > 0) {
                    functions.executeSql(
                        `
                            DELETE FROM
                                musicas_curtidas
                            WHERE
                                id_musica = (SELECT id FROM musicas WHERE identifier = ?)
                            AND
                                id_usuario = ?
                        `, [musicTitle, user_id]
                    ).then(() => {
                        this.getFavoritedMusics(user_id, true);
                        this.getMusics(user_id, true);
                        resolve();
                    })
                } else {
                    functions.executeSql(
                        `
                            INSERT INTO
                                musicas_curtidas
                                (id_musica, id_usuario)
                            VALUES
                                ((SELECT id FROM musicas WHERE identifier = ?), ?)
                        `, [musicTitle, user_id]
                    ).then(() => {
                        this.getFavoritedMusics(user_id, true);
                        this.getMusics(user_id, true);
                        resolve();
                    })
                }
            })
        })
    },
    getFavoritedMusics: function (user_id, clearCache = false) {
        return new Promise((resolve, reject) => {
            functions.executeSql(
                `
                    SELECT
                        m.identifier
                    FROM
                        musicas m
                    INNER JOIN
                        musicas_curtidas mc ON mc.id_musica = m.id
                    WHERE
                        mc.id_usuario = ?
                `, [user_id], !clearCache, 60
            ).then((results) => {
                resolve(results);
            })
        })
    },
    getMusics: function (user_id, clearCache = false) {
        return new Promise((resolve, reject) => {
            functions.executeSql(
                `
                    SELECT
                        m.id,
                        m.nome AS title,
                        m.artista AS author,
                        (SELECT EXISTS (
                            SELECT
                                1
                            FROM
                                musicas_curtidas mc 
                            WHERE
                                mc.id_musica = m.id
                            AND
                                mc.id_usuario = ${user_id}
                        )) AS starred,
                        m.ano AS year
                    FROM
                        musicas m
                `, [], !clearCache, 60
            ).then((results) => {
                resolve(results);
            })
        })
    },
    insertContact: function (mensagem, motivo, email, nome) {
        return new Promise((resolve, reject) => {
            let mailStringAdmin = emailTemplates.contactReceived(mensagem, motivo, email, nome);
            sendEmails.sendEmail(mailStringAdmin, `MENSAGEM DE OUVINTE: ${nome} entrou em contato.`, process.env.USER_EMAIL, process.env.USER_EMAIL).then(() => {
                let mailStringUser = emailTemplates.contactReceivedResponse(mensagem, motivo, email, nome);
                sendEmails.sendEmail(mailStringUser, `Olá ${nome}, sua mensagem foi recebida e retornaremos em breve.`, process.env.USER_EMAIL, email).then(() => {
                    resolve();
                });
            });
        })
    }
}

module.exports = userService;