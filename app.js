let createError = require('http-errors');
let express = require('express');
let path = require('path');
//Routers
let indexRouter = require('./routes/index');
let dataRouter = require('./routes/sku');
let app = express();

/**
 * Module dependencies.
 */
let debug = require('debug')('sample-demo:server');
let http = require('http');

// view engine setup
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');
//router
app.use('/', indexRouter);
app.use('/', dataRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

let port = 9393;
app.set('port', port);
let server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
    console.log("Server Started : http://localhost:" + port)
}

module.exports = app;
