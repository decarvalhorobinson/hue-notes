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
        var skipTaskbarIn  = false;
        if(this.id !== 0){
            skipTaskbarIn = true;
        }
        this.window = new BrowserWindow({
            x: this.x,
            y: this.y,
            tabbingIdentifier: "tab",
            skipTaskbar: skipTaskbarIn,
            width: this.width,
            height: this.height,
            frame: false,
            icon: path.join(__dirname, 'assets/icons/icon.png'),
            transparent: false,
        })
        this.window.setSkipTaskbar
        // e carrega index.html do app.
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))


        // Abre o DevTools.
        //this.window.webContents.openDevTools()
        
        this.window.on('move', () => {
            let position = this.window.getPosition();
            let size = this.window.getSize();
            var node = { name: this.name, text: this.text, x: position[0], y: position[1], width: size[0], height: size[1] };
            var jsonFile = path.join(userFolder, 'notes', this.filename);
            if (this.text) {
                fs.writeFile(jsonFile, JSON.stringify(node), 'utf8', callback);
            } else {
                try {
                    fs.unlinkSync(path.join(userFolder, 'notes', this.filename));
                } catch (error) { }

            }

            function callback() {

            }
        })

        this.window.on('resize', () => {
            let position = this.window.getPosition();
            let size = this.window.getSize();
            var node = { name: this.name, text: this.text, x: position[0], y: position[1], width: size[0], height: size[1] };
            var jsonFile = path.join(userFolder, 'notes', this.filename);
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

        this.window.on('closed', () => {
            ipcMain.emit('closeAll');
        })

        this.window.on('blur', () => {
            this.window.webContents.send('blur');
        })

        this.window.on('focus', () => {
            this.window.webContents.send('focus');
            ipcMain.emit('restoreAll');
        })

        this.window.on('minimize', () => {
            ipcMain.emit('minimizeAll');
        });

        this.window.on('restore', () => {
            ipcMain.emit('restoreAll');
        });
        

        this.window.webContents.on('did-finish-load', () => {
            let obj = { windowId: this.id, text: this.text };
            this.window.webContents.send('message', obj);
            this.window.focus();
            this.window.webContents.send('focus');
        });

        

        ipcMain.on('saveText', (e, message) => {
            let wId = message.windowId;
            let text = message.text;

            if (this.id == wId) {
                let position = this.window.getPosition();
                let size = this.window.getSize();

                var node = { name: this.name, text: text, x: position[0], y: position[1], width: size[0], height: size[1] };
                var jsonFile = path.join(userFolder, 'notes', this.filename);
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