const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

var uniqueID = (function() {
    var id = 0; // This is the private persistent value
    // The outer function returns a nested function that has access
    // to the persistent value.  It is this nested function we're storing
    // in the variable uniqueID above.
    return function() { return id++; };  // Return and increment
 })(); 

class Note{

    constructor(name, text){
        this.name = name;
        this.text = text;
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

        let win = this.window;
        ipcMain.on('closeWindow', closeWindowFn);
        function closeWindowFn() {
            //win.close();
            try {
                BrowserWindow.getFocusedWindow().close();
            } catch (error) {
                
            }
            
        }

        ipcMain.on('addWindow', addWindowFn);
        let winId = this.id;
        function addWindowFn(e, wId) {
            if(wId ==  winId){
                let nt = new Note('teste', 'teste');
                    nt.createWindow();
            }
        }


}
    


}
module.exports = Note;