"use strict";

var cp      = require('child_process'),
    fs      = require('fs'),
    util    = require('util'),
    path    = require('path');


var gsprinter   = path.resolve(__dirname + "/lib/gsprint.exe"),
    pdftocairo  = path.resolve(__dirname + "/lib/pdftocairo.exe");

function getPrinters(chain){
  var child = cp.spawn(gsprinter, ["-list"]),
      body = "";

  child.stdout.on("data", function(buf){
    body += buf;
  });

  child.on("close", function(exit){
    if(exit !== 0)
      return chain("Could not get printer listing");

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
