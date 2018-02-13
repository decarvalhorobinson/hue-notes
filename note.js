const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

var fs = require('fs');

var uniqueID = (function() {
    var id = 0; // This is the private persistent value
    // The outer function returns a nested function that has access
    // to the persistent value.  It is this nested function we're storing
    // in the variable uniqueID above.
    return function() { return id++; };  // Return and increment
 })(); 

class Note{

    constructor(name, text, filename){
        this.name = name;
        this.text = text;
        if(filename == undefined){
            this.filename = new Date().getTime()+'.json';
        }else{
            this.filename = filename;;
        }
        
        this.id = uniqueID();
        console.log(this.id);
    }

    createWindow() {
        // Criar uma janela de navegação.
         this.window = new BrowserWindow({
            width: 200,
            height: 200,
            opacity: 0.0,
            frame: false,
            transparent: true,
        })
    
        // e carrega index.html do app.
        this.window.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))

    
        // Abre o DevTools.
        //this.window.webContents.openDevTools()
    
        // Emitido quando a janela é fechada.
        this.window.on('closed', () => {
            // Elimina a referência do objeto da janela, geralmente você iria armazenar as janelas
            // em um array, se seu app suporta várias janelas, este é o momento
            // quando você deve excluir o elemento correspondente.
            this.window = null
        })

        this.window.webContents.on('did-finish-load', () => {
            console.log(this.text);
            let obj = {windowId: this.id, text:  this.text};
            this.window.webContents.send('message', obj);
        });
        var filename = this.filename;
        let winId = this.id;
        let win = this.window;
        ipcMain.on('closeWindow', closeWindowFn);
        function closeWindowFn(e, wId) {
            if(wId ==  winId){
                try {
                    fs.unlinkSync(path.join(__dirname, 'notes', filename));
                } catch (error) {}
                win.close();
            }
            
        }

        ipcMain.on('addWindow', addWindowFn);
        
        function addWindowFn(e, wId) {
            if(wId ==  winId){
                let nt = new Note('', '');
                    nt.createWindow();
            }
        }

        ipcMain.on('saveText', saveTextFn);
        function saveTextFn(e, message) {
            let wId = message.windowId;
            let text = message.text;
            if(winId == wId){
                console.log(message);
                var node = {name: message.text, text: message.text};
                var jsonFile = path.join(__dirname, 'notes', filename);
                if(text){
                    fs.writeFile(jsonFile, JSON.stringify(node), 'utf8', callback);
                }else{
                    try {
                        fs.unlinkSync(path.join(__dirname, 'notes', filename));
                    } catch (error) {}
                    
                }
                function callback(){

                }
            }
            
            
        }


}
    


}
module.exports = Note;