const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')

const Note = require('./note');
// Mantenha uma referencia global do objeto da janela, se você não fizer isso, a janela será
// fechada automaticamente quando o objeto JavaScript for coletado.
let win

let notes = [];

var fs = require('fs');

var folder = path.join(app.getPath('userData'), 'notes');
try {
    fs.mkdirSync(folder);
} catch (error) {
    
}

var items = fs.readdirSync(folder);
 
for (var i=0; i<items.length; i++) {
    var filePath = path.join(folder, items[i]);
    console.log(filePath);
    var data = fs.readFileSync(filePath, { encoding: 'utf-8' });
    notes.push(JSON.parse(data));
}




function createWindow() {

    var aWhile = 1; // 1 milisecond to enable transparency in the first window
    var doSomethingAfterAWhile = function () {
        if(notes.length == 0){
            let noteteste = new Note("", "", undefined, undefined, 250, 250, undefined);
            win = noteteste.createWindow();
        }
        for (var i=0; i<notes.length; i++){

            let noteteste = new Note(notes[i].text, notes[i].text,notes[i].x, notes[i].y, notes[i].width, notes[i].height, items[i]);
            win = noteteste.createWindow();

            win.show();
        }
        
    }
    setTimeout(doSomethingAfterAWhile, aWhile);

    

}

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

if (shouldQuit) {
    app.quit()
    return
}

// Este método será chamado quando o Electron tiver finalizado
// a inicialização e está pronto para criar a janela browser.
// Algumas APIs podem ser usadas somente depois que este evento ocorre.
app.on('ready', createWindow);
app.showExitPrompt = true;




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

//app.commandLine.appendSwitch('enable-transparent-visuals disable-gpu');



