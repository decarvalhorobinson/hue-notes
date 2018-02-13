const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

const Note = require('./note');
// Mantenha uma referencia global do objeto da janela, se você não fizer isso, a janela será
// fechada automaticamente quando o objeto JavaScript for coletado.
let win

let notes = [];

var fs = require('fs'), filePath = path.join(__dirname, 'notes.json');

fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        notes = JSON.parse(data);
    } else {
        console.log(err);
    }
});

function createWindow() {

    var aWhile = 1; // 1 milisecond to enable transparency in the first window
    var doSomethingAfterAWhile = function () {
        let noteteste = new Note('test header', 'test body note');
        win = noteteste.createWindow();
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
