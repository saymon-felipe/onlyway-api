const express = require('express');
const router = express.Router();
const uploadMusics = require("../utils/uploadMusics");
const functions = require("../utils/functions");

router.post("/upload_musics/:token", async (req, res) => {
    const token = req.params.token;

    if (!token == process.env.JWT_KEY) {
        return res.status(401).send("Não autorizado.");
    } else {
        uploadMusics.upload(req.body.musics).then(() => {
            let response = functions.createResponse("Upload das músicas feito com sucesso", null, "GET", 200);
            return res.status(200).send(response);
        });
    }
});

module.exports = router;