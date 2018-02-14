const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const url = require('url')

const Note = require('./note');

let notes = [];

var fs = require('fs');

var folder = path.join(app.getPath('userData'), 'notes');
try {
    fs.mkdirSync(folder);
} catch (error) { }

var items = fs.readdirSync(folder);

for (var i = 0; i < items.length; i++) {
    var filePath = path.join(folder, items[i]);
    console.log(filePath);
    var dataToParse = fs.readFileSync(filePath, { encoding: 'utf-8' });
    var data = JSON.parse(dataToParse);

    let note = new Note(data.text, data.text, data.x, data.y, data.width, data.height, items[i]);
    notes.push(note);
}
if (notes.length == 0) {
    let note = new Note("", "", undefined, undefined, 250, 250, undefined);
    notes.push(note);
}



function createWindow() {

    var aWhile = 200; // 1 milisecond to enable transparency in the first window

    var doSomethingAfterAWhile = function () {
        for (var i = 0; i < notes.length; i++) {
            notes[i].createWindow();
        }
    }
    setTimeout(doSomethingAfterAWhile, aWhile);
}


const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].window === null) {
            if (notes[i].window.isMinimized()) notes[i].window.restore()
            notes[i].window.focus()
        }

    }
})

if (shouldQuit) {
    app.quit()
    return
}

app.on('ready', createWindow);
app.showExitPrompt = true;

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].window === null) {
            notes[i].createWindow();
        }

    }
})

//app.commandLine.appendSwitch('enable-transparent-visuals disable-gpu');


process.on('uncaughtException', function (err) {
    console.log(err);
})

ipcMain.on('deleteNote', (e, wId) => {


    if (app.showExitPrompt) {
        e.preventDefault() // Prevents the window from closing 
        dialog.showMessageBox({
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'Are you sure you want to delete?'
        }, (response) => {
            if (response === 0) { // Runs the following if 'Yes' is clicked
                let note;
                var userFolder = app.getPath('userData');
                for (var i = 0; i < notes.length; i++) {
                    notes[i].window.setSkipTaskbar(true);
                    if (notes[i].id == wId) {
                        note = notes[i];
                        notes.splice(i, 1);
                        break;
                    }


                }
                if (notes.length > 0) {
                    notes[0].window.setSkipTaskbar(false);
                }

                try {
                    fs.unlinkSync(path.join(userFolder, 'notes', note.filename));
                } catch (error) { }
                note.window.removeAllListeners();
                note.window.close();
                note.window = null;
                note = null;
            }
        })
    }


});

ipcMain.on('addWindow', (e, wId) => {
    let nt = new Note("", "", undefined, undefined, 250, 250, undefined);
    nt.createWindow();
    notes.push(nt);
});

ipcMain.on('restoreAll', () => {
    for (var i = 0; i < notes.length; i++) {
        notes[i].window.restore();
    }
});

ipcMain.on('minimizeAll', () => {
    for (var i = 0; i < notes.length; i++) {
        notes[i].window.minimize();
    }
});

ipcMain.on('closeAll', () => {
    app.quit();

});



