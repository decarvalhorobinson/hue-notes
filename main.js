const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

const Note = require('./note');
// Mantenha uma referencia global do objeto da janela, se você não fizer isso, a janela será
// fechada automaticamente quando o objeto JavaScript for coletado.
let win

let notes = [];

var fs = require('fs');
var folder = path.join(__dirname, 'notes');
var items = fs.readdirSync(folder);
 
for (var i=0; i<items.length; i++) {
    var filePath = path.join(folder, items[i]);
    
    var data = fs.readFileSync(filePath, { encoding: 'utf-8' });
    notes.push(JSON.parse(data));
}




function createWindow() {

    var aWhile = 1; // 1 milisecond to enable transparency in the first window
    var doSomethingAfterAWhile = function () {
        if(notes.length == 0){
            let noteteste = new Note("", "");
            win = noteteste.createWindow();
        }
        for (var i=0; i<notes.length; i++){
            let noteteste = new Note(notes[i].text, notes[i].text,notes[i].x, notes[i].y, notes[i].width, notes[i].height, items[i]);
            win = noteteste.createWindow();
        }
        
    }
    setTimeout(doSomethingAfterAWhile, aWhile);

    

}

// Este método será chamado quando o Electron tiver finalizado
// a inicialização e está pronto para criar a janela browser.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.on('ready', createWindow)




// Finaliza quando todas as janelas estiverem fechadas.
app.on('window-all-closed', () => {
    // No macOS é comum para aplicativos e sua barra de menu 
    // permaneçam ativo até que o usuário explicitamente encerre com Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

app.commandLine.appendSwitch('enable-transparent-visuals disable-gpu');



