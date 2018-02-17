const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const url = require('url')

var fs = require('fs');

var userFolder = app.getPath('userData');

class Note {

    constructor(name, text, x, y, width, height, filename) {
        this.name = name;
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = "default-color";
        
        if (filename == undefined) {
            this.id = new Date().getTime();
            this.filename = this.id + '.json';
        } else {
            this.id = filename.substring(0, filename.lastIndexOf("."));
            this.filename = filename;;
        }

        
    }

    createWindow() {
        // Criar uma janela de navegação.
        this.window = new BrowserWindow({
            x: this.x,
            y: this.y,
            tabbingIdentifier: "tab",
            skipTaskbar: true,
            width: this.width,
            height: this.height,
            frame: false,
            icon: path.join(__dirname, '../../icons/icon.png'),
            transparent: false,
        })
        // e carrega index.html do app.
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, '../../html/index.html'),
            protocol: 'file:',
            slashes: true
        }))

        this.window.webContents.on('did-finish-load', () => {
            this.window.webContents.send('nodeLoad', this);
            this.window.focus();
            this.window.webContents.send('focus');
        });

        // Abre o DevTools.
        //this.window.webContents.openDevTools()
        
        this.window.on('move', () => {
            this.save(this);
        });

        this.window.on('resize', () => {
            this.save(this);
        });

        ipcMain.on('saveText', (e, note) => {
            this.save(note);
        });

        this.window.on('close', () => {
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

        return this.window;
    }

    save(note){
        if (this.id == note.id) {
            let position = this.window.getPosition();
            let size = this.window.getSize();
            this.name = note.name;
            this.text = note.text;
            this.x = note.x = position[0];
            this.y = note.y = position[1];
            this.width = note.width = size[0];
            this.height = note.height = size[1];
            var jsonFile = path.join(userFolder, 'notes', this.filename);
            fs.writeFile(jsonFile, JSON.stringify(this), 'utf8', callback);
            function callback() {

            }
        }

    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            text: this.text,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            color: this.color
        };
    }



}
module.exports = Note;