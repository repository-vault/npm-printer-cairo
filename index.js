"use strict";

var cp = require('child_process');
var fs = require('fs');
var util = require('util');
var path = require('path');

var tmppath = require('nyks/fs/tmppath');


var gsprinter   = path.resolve(__dirname + "/lib/gsprint.exe");
var ghostscript = path.resolve(__dirname + "/lib/gswin32c.exe");

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
  var tmpbuffer = tmppath("pdf");
  fs.writeFileSync(tmpbuffer, buffer);
  printPDF(tmpbuffer, options, function(err){
    fs.unlinkSync(tmpbuffer);
    chain(err);
  });
}


function printPDF(source_file, options, chain) {
  if(typeof options == "string")
    options = {printerName : options };

  if (!fs.existsSync(source_file))
    return chain('unexisting file');

  var args = ["-printer", options.printerName, "-ghostscript", ghostscript, source_file ];
  args.push("-colour");

  if(options.orientation) //valid are portrait / landscape
    args.push("-" + options.orientation);

  var child = cp.spawn(gsprinter, args),
      body = "";

  child.stdout.on("data", function(buf){
    console.log("OUT>" + buf);
  });

  child.stderr.on("data", function(buf){
    console.log("ERR>" + buf);
  });

  child.on("close", function(exit){
    if(exit !== 0)
      return chain("Call to gsprint failed !");
    return chain();
  });

  
}

module.exports.printPDF         = printPDF;
module.exports.printPDFBuffer   = printPDFBuffer;
module.exports.getPrinters      = getPrinters;
