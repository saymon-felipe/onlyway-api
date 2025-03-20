const functions = require("../utils/functions");

let uploadMusics = {
    upload: function (musics) {
        return new Promise((resolve, reject) => {
            let insertMusics = "";

            for (let i = 0; i < musics.length; i++) {
                let currentMusic = musics[i];

                if (i == musics.length - 1) {
                    insertMusics += `(${currentMusic.artist.indexOf("Unknown") == -1 ? '"' + currentMusic.artist + '"' : null}, ${currentMusic.title.indexOf("Unknown") == -1 ? '"' + currentMusic.title + '"' : '"' + currentMusic.file_name + '"'}, ${currentMusic.album.indexOf("Unknown") == -1 && currentMusic.album != "no title" ? '"' + currentMusic.album + '"' : null}, ${currentMusic.year}, ${currentMusic.genre.indexOf("Unknown") == -1 ? '"' + currentMusic.genre + '"' : null})`;
                } else {
                    insertMusics += `(${currentMusic.artist.indexOf("Unknown") == -1 ? '"' + currentMusic.artist + '"' : null}, ${currentMusic.title.indexOf("Unknown") == -1 ? '"' + currentMusic.title + '"' : '"' + currentMusic.file_name + '"'}, ${currentMusic.album.indexOf("Unknown") == -1 && currentMusic.album != "no title" ? '"' + currentMusic.album + '"' : null}, ${currentMusic.year}, ${currentMusic.genre.indexOf("Unknown") == -1 ? '"' + currentMusic.genre + '"' : null}),`;
                }
            }

            functions.executeSql(
                `
                    INSERT IGNORE INTO musicas
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