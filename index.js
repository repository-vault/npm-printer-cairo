"use strict";

const cp      = require('child_process');
const path    = require('path');

const drain   = require('nyks/stream/drain');


const gsprinter   = path.resolve(__dirname + "/lib/gsprint.exe");
const pdftocairo  = path.resolve(__dirname + "/lib/pdftocairo.exe");


async function getPrinters(chain) {
  var child = cp.spawn(gsprinter, ["-list"]),
      body = [];

  child.stdout.on('data', (buff) => body.push(buff));

  child.on('close', function(exit) {
    if(exit !== 0)
      return chain("Could not get printer listing");

    body = Buffer.concat(body).toString('binary');

    chain(null, body.split("\n").map(function(v){ return {name:v.trim()}; }) );
  });
}

function printPDF(source_file, options, chain) {
  if(typeof options == "string")
    options = {printer_name : options};

  var args = [
    source_file,
    "-print",
    "-origpagesizes",
    "-printer",
    options.printer_name,
    "-nocrop",
    "-noshrink",
    "-r",
    "600"
  ];

  var child = cp.spawn(pdftocairo, args);

  child.on('error', chain);

  child.on("close", function(exit){
    if(exit !== 0)
      return chain("Call to pdftocairo failed !");
    return chain();
  });
}

module.exports.printPDF         = printPDF;
module.exports.getPrinters      = getPrinters;
