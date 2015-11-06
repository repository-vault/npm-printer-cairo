"use strict";


var cp = require('child_process');
var fs = require('fs');
var util = require('util');
var path = require('path');


function print(pdf_file_path, printer_name, chain) {

  var printer = cp.spawn(FOXIT_BIN,  ["/t", "pan-apps/printer/tmp/tmpfile.html.pdf",  printer_name] );

  printer.on('close', function (code) {
    if(code !== 0)
      return chain("Invalid exit code");
    fs.unlinkSync(pdf_file_path);
    chain();
  });


}


var fs      = require('fs');
var some    = require('mout/array/some');
var printer = require('./lib/printer');

var printers = printer.getPrinters();


var printerName =  "PDFCreator";



if(!some(printers, function(printer){ return printer.name== printerName; })) 
  throw "Cannot find PDF printer (required for testing), please download one (we recommend http://azure.download.pdfforge.org/pdfcreator/2.2.1/PDFCreator-2_2_1-setup.exe";
  



var buffer = fs.readFileSync("foo.pdf");



printer.printDirect({
        printer : printerName,
        data: buffer,
        type: 'RAW',
        success: function(id) {
            console.log('printed with id ' + id);
        },
        error: function(err) {
            console.error('error on printing: ' + err);
        }
});


module.exports.printPDF    = print;
module.exports.getPrinters = print;