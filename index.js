const express = require("express");
const multer = require("multer");
const app = express();
const fs = require("fs");

app.use(multer().none());

const notesFile = "notes.json";

function readNotesFromFile() {
    try {
        const data = fs.readFileSync(notesFile);
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeNotesToFile(data) {
    fs.writeFileSync(notesFile, JSON.stringify(data, null, 2));
}

const notes = readNotesFromFile();


app.get('/', (req, res) => {
    res.send(`<h1>Доступні запити</h1>
            1. /notes (всі нотатки) <b1>
            2. /UploadForm.html (форма для запису всіх нотатків) <b1>
            3. /notes/<note_name> (пошук окремого нотатку)<b1>`);
})

app.get('/notes', (req, res) => {
    res.json(notes);
})

app.get('/UploadForm.html', (req, res) => {
    const path = (__dirname + '/static/UploadForm.html');
    res.sendFile(path);
})

app.post('/upload', (req, res) => {
    const noteName = req.body.note_name;
    const note = req.body.note;
    
    const existing = notes.find(note => note.note_name === noteName);

    if(existing){
        res.status(400).send("Нотатка з таким ім'ям вже існує");
    }else{
        notes.push({ note_name: noteName, note: note });
        writeNotesToFile(notes); // Сохраняем заметки в файл
        res.status(201).send("Нотатка успішно додана");
    }
})

app.get('/notes/:note_name', (req, res) => {
    const note_name = req.params.note_name;
    const findNotes = notes.find(note => note.note_name === note_name);

    if(findNotes)
    {
        res.send({note_name: note_name, note: findNotes.note});
    } else{
        res.status(404).json("Нотатку не знайдено");
    }
})

app.put('/notes/:note_name', (req, res) => {
    const noteName = req.params.note_name;
    const note = req.body.note
    const findNoteIndex = notes.findIndex(note => note.note_name === noteName);

    if (findNoteIndex !== -1) {
        notes[findNoteIndex].note = note; 
        writeNotesToFile(notes); 
        res.json({ note_name: noteName, note: notes[findNoteIndex].note });
    } else {
        res.status(404).send("Заметку не найдено");
    }
});

app.delete('/notes/:note_name', (req, res) => {
    const noteName = req.params.note_name;
    const findNoteIndex = notes.findIndex(note => note.note_name === noteName);

    if (findNoteIndex !== -1) {
        notes.splice(findNoteIndex, 1);
        writeNotesToFile(notes); // Сохраняем обновленные заметки в файл
        res.send(`Заметка с именем ${noteName} была удалена`);
    } else {
        res.status(404).send("Заметку не найдено");
    }
});



app.listen(8000);