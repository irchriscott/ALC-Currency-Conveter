import express from 'express';
import http from 'http';
import statics from 'serve-static';
import path from 'path';

const port = process.env.PORT || 8008;
const app = express();

app.use(statics(__dirname + '/'));

app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

http.Server(app).listen(port, () => {
    console.log(`Server running on port ${port}`);
});