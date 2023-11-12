const express = require("express");
const app = express();

const multer = require("multer");
const upload = multer();

const fs = require("fs");

const notesFile = (__dirname + "/notes.json");

if (!fs.existsSync(notesFile)) {
    fs.writeFileSync(notesFile, '[]');
}

app.get('/', (req, res) => {
    res.send(`<h1>Доступні запити</h1>
            1. /notes (всі нотатки) <b1>
            2. /UploadForm.html (форма для запису всіх нотатків) <b1>
            3. /notes/<note_name> (пошук окремого нотатку)<b1>`);
})

app.get('/notes', (req, res) => {
    try {
        const data = fs.readFileSync(notesFile, 'utf8');
        const notes = data ? JSON.parse(data) : [];
        res.json(notes);
    } catch (error) {
        res.status(500).send("Помилка читання нотаток з файлу");
    }
});

app.get('/UploadForm.html', (req, res) => {
    const path = (__dirname + '/static/UploadForm.html');
    res.sendFile(path);
})

app.post('/upload', upload.fields([{ name: 'note_name' }, { name: 'note' }]), (req, res) => {
    const { note_name, note } = req.body;

    try {
        const data = fs.readFileSync(notesFile, 'utf8');
        const notes = data ? JSON.parse(data) : [];

        // Перевірка існування нотатки
        const existingNote = notes.find(n => n.note_name === note_name);
        if (existingNote) {
            return res.status(400).send("Нотатка з таким ім’ям вже існує");
        }

        // Додавання нової нотатки
        notes.push({ note_name, note });
        fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));
        res.status(201).send("Нотатка успішно завантажена");
    } catch (error) {
        res.status(500).send("Помилка при обробці нотатки");
    }
});

app.get('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;

    try {
        const data = fs.readFileSync(notesFile, 'utf8');
        const notes = data ? JSON.parse(data) : [];

        const foundNote = notes.find(note => note.note_name === noteName);

        if (!foundNote) {
            return res.status(404).send("Нотатка не знайдена");
        }

        res.send(foundNote.note);
    } catch (error) {
        res.status(500).send("Помилка при читанні нотатки");
    }
});

app.put('/notes/:noteName', express.text(), (req, res) => {
    const noteName = req.params.noteName;
    const note = req.body;

    try {
        let data = fs.readFileSync(notesFile, 'utf8');
        const notes = data ? JSON.parse(data) : [];

        const foundNoteIndex = notes.findIndex(note => note.note_name === noteName);

        if (foundNoteIndex === -1) {
            return res.status(404).send("Нотатка не знайдена");
        }

        // Заміна тексту нотатки
        notes[foundNoteIndex].note = note;
        fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));

        res.send("Текст нотатки успішно замінено");
    } catch (error) {
        res.status(500).send("Помилка при оновленні нотатки");
    }
});

app.delete('/notes/:noteName', (req, res) => {
    const noteName = req.params.noteName;

    try {
        let data = fs.readFileSync(notesFile, 'utf8');
        const notes = data ? JSON.parse(data) : [];

        const foundNoteIndex = notes.findIndex(note => note.note_name === noteName);

        if (foundNoteIndex === -1) {
            return res.status(404).send("Нотатка не знайдена");
        }

        // Видалення нотатки
        notes.splice(foundNoteIndex, 1);
        fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));

        res.send("Нотатка успішно видалена");
    } catch (error) {
        res.status(500).send("Помилка при видаленні нотатки");
    }
});

app.listen(8000);
