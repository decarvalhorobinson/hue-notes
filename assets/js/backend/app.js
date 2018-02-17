module.exports = function () {
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
        var dataToParse = fs.readFileSync(filePath, { encoding: 'utf-8' });
        var note;
        try {
            data = JSON.parse(dataToParse);
            note = new Note({   
                                name: data.name, 
                                text: data.text, 
                                x: data.x, 
                                y: data.y, 
                                width: data.width, 
                                height: data.height, 
                                color: data.color, 
                                transparent:data.transparent, 
                                filename:items[i]});
        } catch (error) {
            note = new Note({   name: "", 
                                text: "", 
                                width: 280, 
                                height:300, 
                                filename:items[i]});
            
        }
        notes.push(note);

        
    }
    if (notes.length == 0) {
        let note = new Note({name: "",
                            text: "",
                            width: 280,
                            height: 300});
        notes.push(note);
    }



    function createWindow() {

        var aWhile = 200; // 1 milisecond to enable transparency in the first window

        var doSomethingAfterAWhile = function () {
            for (var i = 0; i < notes.length; i++) {
                notes[i].createWindow();
            }
            notes[0].window.setSkipTaskbar(false);
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

    ipcMain.on('addWindow', (e, color) => {
        let nt = new Note({name:"", text:"",width:280, height:300, color:color});
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
        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];
            var jsonFile = path.join(app.getPath('userData'), 'notes', note.filename);
            fs.writeFile(jsonFile, JSON.stringify(note), 'utf8', callback);
            function callback() {}
            
        }
        

        app.quit();

    });

}

