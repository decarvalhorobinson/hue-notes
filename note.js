const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const url = require('url')

var fs = require('fs');

var userFolder = app.getPath('userData');

var uniqueID = (function () {
    var id = 0; // This is the private persistent value
    // The outer function returns a nested function that has access
    // to the persistent value.  It is this nested function we're storing
    // in the variable uniqueID above.
    return function () { return id++; };  // Return and increment
})();

class Note {

    constructor(name, text, x, y, width, height, filename) {
        this.name = name;
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        if (filename == undefined) {
            this.filename = new Date().getTime() + '.json';
        } else {
            this.filename = filename;;
        }

        this.id = uniqueID();
    }


    createWindow() {
        // Criar uma janela de navegação.
        this.window = new BrowserWindow({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            frame: false,
            icon: path.join(__dirname, 'assets/icons/icon.png'),
            transparent: true,
        })
        // e carrega index.html do app.
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))

        var filename = this.filename;
        let winId = this.id;
        let win = this.window;


        // Abre o DevTools.
        //this.window.webContents.openDevTools()

        // Emitido quando a janela é fechada.
        this.window.on('closed', () => {
            // Elimina a referência do objeto da janela, geralmente você iria armazenar as janelas
            // em um array, se seu app suporta várias janelas, este é o momento
            // quando você deve excluir o elemento correspondente.
            this.window = null

        })
        this.window.on('move', () => {
            let position = this.window.getPosition();
            let size = this.window.getSize();
            var node = { name: this.name, text: this.text, x: position[0], y: position[1], width: size[0], height: size[1] };
            var jsonFile = path.join(userFolder, 'notes', filename);
            if (this.text) {
                fs.writeFile(jsonFile, JSON.stringify(node), 'utf8', callback);
            } else {
                try {
                    fs.unlinkSync(path.join(userFolder, 'notes', filename));
                } catch (error) { }

            }

            function callback() {

            }
        })

        this.window.on('resize', () => {
            let position = this.window.getPosition();
            let size = this.window.getSize();
            var node = { name: this.name, text: this.text, x: position[0], y: position[1], width: size[0], height: size[1] };
            var jsonFile = path.join(userFolder, 'notes', filename);
            if (this.text) {
                fs.writeFile(jsonFile, JSON.stringify(node), 'utf8', callback);
            } else {
                try {
                    fs.unlinkSync(path.join(userFolder, 'notes', filename));
                } catch (error) { }

            }

            function callback() {

            }
        })

        this.window.webContents.on('did-finish-load', () => {
            let obj = { windowId: this.id, text: this.text };
            this.window.webContents.send('message', obj);
        });

        ipcMain.on('closeWindow', closeWindowFn);
        function closeWindowFn(e, wId) {
            if (wId == winId) {
                if (app.showExitPrompt) {
                    e.preventDefault() // Prevents the window from closing 
                    dialog.showMessageBox({
                        type: 'question',
                        buttons: ['Yes', 'No'],
                        title: 'Confirm',
                        message: 'Are you sure you want to delete?'
                    }, function (response) {
                        if (response === 0) { // Runs the following if 'Yes' is clicked
                            try {
                                fs.unlinkSync(path.join(userFolder, 'notes', filename));
                            } catch (error) { }
                            win.close();
                        }
                    })
                }
            }

        }

        ipcMain.on('addWindow', addWindowFn);

        function addWindowFn(e, wId) {
            if (wId == winId) {
                let nt = new Note("", "", undefined, undefined, 200, 200, undefined);
                nt.createWindow();
            }
        }

        ipcMain.on('saveText', (e, message) => {
            let wId = message.windowId;
            let text = message.text;

            if (winId == wId) {
                let position = this.window.getPosition();
                let size = this.window.getSize();

                var node = { name: this.name, text: text, x: position[0], y: position[1], width: size[0], height: size[1] };
                var jsonFile = path.join(userFolder, 'notes', filename);
                if (text) {
                    fs.writeFile(jsonFile, JSON.stringify(node), 'utf8', callback);
                } else {
                    try {
                        fs.unlinkSync(path.join(userFolder, 'notes', filename));
                    } catch (error) { }

                }
                function callback() {

                }
            }


        })

        return this.window;
    }



}
module.exports = Note;