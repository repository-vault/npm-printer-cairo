"use strict";

var cp = require('child_process'),
    fs = require('fs'),
    util = require('util'),
    path = require('path'),
    tmppath = require('nyks/fs/tmppath');


var gsprinter   = path.resolve(__dirname + "/lib/gsprint.exe"),
    ghostscript = path.resolve(__dirname + "/lib/gswin32c.exe");

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


function printPDFBuffer(buffer, options, chain) {
  if(typeof options == "string")
    options = {printer_name : options};

  var tmpbuffer = tmppath("pdf");
  fs.writeFileSync(tmpbuffer, buffer);
  printPDF(tmpbuffer, options, function(err){
    fs.unlinkSync(tmpbuffer);
    chain(err);
  });
}

function printPDF(source_file, options, chain) {
  if(typeof options == "string")
    options = {printer_name : options};

  if (!fs.existsSync(source_file))
    return chain('unexisting file');

  convertPDFtocmyk(source_file, function(err, cmyk_pdf) {
    if(err) return chain(err);

    print_cmyk_pdf(cmyk_pdf, options, function(err2){
      if(err2) return chain(err2);

      fs.unlinkSync(cmyk_pdf);

      chain();
    });
  });
}

function print_cmyk_pdf(source_file, options, chain) {
  var args = [
    "-printer",
    options.printer_name,
    "-ghostscript",
    ghostscript,
    source_file,
    "-colour"
  ];

  if(options.orientation) //valid are portrait / landscape
    args.push("-" + options.orientation);

  var child = cp.spawn(gsprinter, args);

  child.on('error', chain);

  child.on("close", function(exit){
    if(exit !== 0)
      return chain("Call to gsprint failed !");
    return chain();
  });
}

function convertPDFtocmyk(source_file, chain) {
  var output_pdf = source_file + ".cmyk.pdf",
      args = [
        "-dBATCH",
        "-sDEVICE=pdfwrite",
        "-dNOPAUSE",
        "-sOutputFile=\"" + output_pdf + "\"",
        "-dUseCIEColor",
        "-sProcessColorModel=DeviceRGB",
        "-dProcessColorModel=/DeviceCMYK",
        "-sColorConversionStrategy=/CMYK",
        source_file,
        "-c",
        "quit"
      ],
      child = cp.spawn(ghostscript, args);

  child.on('error', chain);

  child.on("close", function(exit){
    if(exit !== 0)
      return chain("Call to gswin32c failed !");
    return chain(null, output_pdf);
  });
}

module.exports.printPDF         = printPDF;
module.exports.printPDFBuffer   = printPDFBuffer;
module.exports.getPrinters      = getPrinters;
