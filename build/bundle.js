'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var port = process.env.PORT || 8008;
var app = (0, _express2.default)();

app.use((0, _serveStatic2.default)(__dirname + '/'));

app.get('/', function (_, res) {
    res.sendFile(_path2.default.join(__dirname + '/index.html'));
});

_http2.default.Server(app).listen(port, function () {
    console.log('Server running on port ' + port);
});
