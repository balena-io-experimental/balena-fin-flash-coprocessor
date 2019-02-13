#!/bin/env node

{
  const gi = require('node-gtk');
  Fin = gi.require('Fin', '0.2');
  const fin = new Fin.Client();
  const BALENA_FIN_REVISION = fin.revision;
  const Firmata = require("firmata");
  let port;
  if (BALENA_FIN_REVISION === '09') {
    port = process.env.SERIALPORT || "/dev/ttyUSB0";
  } else {
    port = process.env.SERIALPORT || "/dev/ttyS0";
  }
  const board = new Firmata(port);
  const debug = require('debug')('firmata');
  board.settings.skipCapabilities = true;
  String.prototype.splice = function(idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
  };
  let self;
  let firmata = function() {
    'use strict';
    if (!(this instanceof firmata)) return new firmata();
    this.firmata = {};
    this.fwVersion = {};
    self = this;

    this.configSleep = function(delay, sleep) {
      // we want to represent the input as a 8-bytes array
      var byteArray = [0, 0, 0, 0, 0, 0];
      // pad every 8th bit with 0 for conformance with Firmata protocol
      var sleep_string = sleep.toString(2);
      sleep_string = self.padData(sleep_string);
      var sleep_data = parseInt(sleep_string, 2);
      var delay_string = delay.toString(2);
      delay_string = self.padData(delay_string);
      var delay_data = parseInt(delay_string, 2);
      for (var index = 0; index < byteArray.length; index++) {
        var byte = sleep_data & 0xff;
        byteArray[index] = byte;
        sleep_data = (sleep_data - byte) / 256;
      }
      // insert balena command
      byteArray.splice(0, 0, 0x0B);
      // insert balena subcommand
      byteArray.splice(1, 0, 0x01);
      byteArray.splice(2, 0, delay_data);
      return byteArray;
    };

    this.setPin = function(pin, state) {
      board.digitalWrite(pin, state);
    };

    this.padData = function(input_string) {
      for (var i = 1; i < 6; i++) {
        input_string = input_string.splice((i * -7) - ((i * 1) - 1), 0, "0");
      }
      return input_string;
    };

    this.sleep = function(delay, timeout) {
      board.sysexCommand(self.configSleep(delay, timeout));
    };

    this.close = function() {
      board.transport.close();
    };

    board.on("queryfirmware", () => {
      // Encoded terminal text colors, i.e. green is \x1b[32m
      self.fwVersion = {
        firmataName: board.firmware.name,
        firmataVersion: board.firmware.version.major + "." + board.firmware.version.minor
      };
      debug(self.fwVersion);
      board.sysexCommand([0xF0, 0x0B, 0x00, 0xF7], (data) => {
          debug(Firmata.decode(data));
      });
    });

  };
  module.exports = firmata();
}
