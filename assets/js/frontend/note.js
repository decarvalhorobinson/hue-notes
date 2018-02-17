const electron = require('electron');
const { ipcRenderer } = electron;
const closeButton = document.querySelector('#closeButton');
var id;
var color;
closeButton.addEventListener('click', () => {
    if(id){
        ipcRenderer.send('deleteNote', id);
    }  
});

const addButton = document.querySelector('#addButton');
addButton.addEventListener('click', () => {
    if(id){
        ipcRenderer.send('addWindow', id);
    }
});

ipcRenderer.on('nodeLoad', (event, note) => {
    document.querySelector('#note-text').innerHTML = note.text;
    document.querySelector('html').className = note.color;
    color = note.color;
    id = note.id;
});

ipcRenderer.on('blur', () => {
    document.querySelector(".nav").style.visibility = "hidden";
});

ipcRenderer.on('focus', () => {
    document.querySelector(".nav").style.visibility = "visible";
});


const noteText = document.querySelector('#note-text');
noteText.addEventListener('keyup', () => {
    if(id){
        ipcRenderer.send('saveText', { text: noteText.innerHTML, id: id, color: color });
    }
});
noteText.addEventListener('keypressed', () => {
    if(id){
        ipcRenderer.send('saveText', { text: noteText.innerHTML, id: id, color: color});
    }
});
noteText.addEventListener('keydown', () => {
    if(id){
        ipcRenderer.send('saveText', { text: noteText.innerHTML, id: id, color: color });
    }
});



window.onbeforeunload = function (e) {
    var remote = require('remote');
    var dialog = remote.require('dialog');
    var choice = dialog.showMessageBox(
        remote.getCurrentWindow(),
        {
            type: 'question',
            buttons: ['Yes', 'No'],
            title: 'Confirm',
            message: 'Are you sure to delete this note?'
        });

    return choice === 0;
};