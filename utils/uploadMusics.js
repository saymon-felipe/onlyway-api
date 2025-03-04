const functions = require("../utils/functions");

let uploadMusics = {
    upload: function () {
        return new Promise((resolve, reject) => {
            const musicas = require("../public/music_data.json");
            let insertMusics = "";

            for (let i = 0; i < musicas.length; i++) {
                let currentMusic = musicas[i];

                if (i == musicas.length - 1) {
                    insertMusics += `(${currentMusic.artist.indexOf("Unknown") == -1 ? '"' + currentMusic.artist + '"' : null}, ${currentMusic.title.indexOf("Unknown") == -1 ? '"' + currentMusic.title + '"' : '"' + currentMusic.file_name + '"'}, ${currentMusic.album.indexOf("Unknown") == -1 && currentMusic.album != "no title" ? '"' + currentMusic.album + '"' : null}, ${currentMusic.year}, ${currentMusic.genre.indexOf("Unknown") == -1 ? '"' + currentMusic.genre + '"' : null})`;
                } else {
                    insertMusics += `(${currentMusic.artist.indexOf("Unknown") == -1 ? '"' + currentMusic.artist + '"' : null}, ${currentMusic.title.indexOf("Unknown") == -1 ? '"' + currentMusic.title + '"' : '"' + currentMusic.file_name + '"'}, ${currentMusic.album.indexOf("Unknown") == -1 && currentMusic.album != "no title" ? '"' + currentMusic.album + '"' : null}, ${currentMusic.year}, ${currentMusic.genre.indexOf("Unknown") == -1 ? '"' + currentMusic.genre + '"' : null}),`;
                }
            }

            functions.executeSql(
                `
                    INSERT INTO musicas
                    (artista, nome, album, ano, genero)
                    VALUES
                    ${insertMusics}
                `, []
            ).then(() => {
                resolve();
            }).catch((error) => {
                reject(error);
            })
        });
    }
}

module.exports = uploadMusics;