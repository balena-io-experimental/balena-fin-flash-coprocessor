#!/bin/env node

const supervisor = require(__dirname + '/utils/supervisor.js');
const gi = require('node-gtk');
Fin = gi.require('Fin', '0.1');
const fin = new Fin.Client();
const BALENA_FIN_REVISION = fin.revision;
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 1337;
const Gpio = require('onoff').Gpio;
const mux = new Gpio(41, 'out');
const fs = require('fs');
const {
  spawn
} = require("child_process");
const chalk = require('chalk');
const express = require('express');
const compression = require('compression');
const path = require('path');
const mime = require('mime');
const debug = require('debug')('http');
const bodyParser = require("body-parser");
const app = express();
let errorCheck = 0;

errorHandler = (err, req, res, next) => {
  res.status(500);
  res.render('error', {
    error: err
  });
};
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(errorHandler);

app.post('/v1/flash/:fw', (req, res) => {
  if (!req.params.fw) {
    return res.status(400).send('Bad Request');
  }
  mux.writeSync(1);
  let flash = spawn("/usr/src/app/flash.sh", [req.params.fw, BALENA_FIN_REVISION]);
  flash.stdout.on('data', (data) => {
    console.log("flash stdout: " + data);
  });
  flash.stderr.on('data', (data) => {
    console.log("flash stderr: " + data);
    if (!data.includes('Connection closed by foreign host.')) {
      errorCheck++;
      return res.status(500).send(data);
    }
  });
  flash.on('error', (err) => {
    console.error(err);
    errorCheck++;
    return res.status(500).send(err);
  });
  flash.on('close', (code) => {
    mux.writeSync(0);
    if (errorCheck === 0) {
      res.status(200).send('OK');
      if (BALENA_FIN_REVISION > '09') {
        supervisor.reboot().then(() => {
          console.log('rebooting via supervisor...');
        }).catch((err) => {
          console.error('reboot failed with error: ', err);
        });
      }
    } else {
      console.log('flash failed! device will not reboot.');
      errorCheck = 0;
    }
  });
});

app.listen(SERVER_PORT, () => {
  console.log('server listening on port ' + SERVER_PORT);
});

process.on('SIGINT', () => {
  mux.unexport();
  board.reset();
  process.exit();
});
