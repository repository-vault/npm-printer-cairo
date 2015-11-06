"use strict";


var cp = require('child_process');
var fs = require('fs');
var util = require('util');
var path = require('path');

var some    = require('mout/array/some');
var printer = require('./lib/printer');

function printPDF(source_file, printerName, chain) {
  if (!fs.existsSync(source_file))
    return chain('unexisting file');
  var buffer = fs.readFileSync(source_file);
  printer.printDirect({
    printer : printerName,
    data: buffer,
    type: 'RAW',
    success: function(id) {
      console.log('printed with id ' + id);
      chain(null);
    },
    error: function(err) {
      console.error('error on printing: ' + err);
      return chain(err);
    }
  });
}

module.exports.printPDF    = printPDF;
module.exports.getPrinters = printer.getPrinters;
