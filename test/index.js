"use strict";
var expect = require('expect.js'),
    fs = require('fs'),
    printer = require('..'),
    some    = require('mout/array/some'),
    path = require('path'),
    printerName = 'PDFCreator',
    test_pdf = "foo.pdf";

//var printerName = '\\\\ivsfrsrv-ad1\\imprimante DEVELWEB';
//test_pdf = "Ruler_A4.pdf";

describe("Initial test suite", function(){

  it("should list printers", function(chain) {
    printer.getPrinters(function(err, printers) {
      expect(err).not.to.be.ok();
      expect(printers).to.be.a('object');
      chain();
    });
  });

  it("should check for printer existance", function(chain){
    printer.getPrinters(function(err, printers) {

      if(!some(printers, function(printer){ return printer.name == printerName; })) 
        throw "Cannot find PDF printer (required for testing), please download one (we recommend http://azure.download.pdfforge.org/pdfcreator/2.2.1/PDFCreator-2_2_1-setup.exe";
      chain();
    });
  });

  it("Should not print a fake file", function(chain){
    var output_path = path.join(__dirname, "incoming.pdf"),
        source_file = path.resolve(__dirname, "fake.fake");
    printer.printPDF(source_file, printerName, function(err) {
      expect(err).to.be.a('string');
      chain();
    });
  });

  it("Should print something", function(chain){
    this.timeout(30000);
    var output_path = path.join(__dirname, "incoming.pdf");
    if(fs.existsSync(output_path))
      fs.unlinkSync(output_path);

    console.log("Make sure to save the file as '%s'", output_path);
    var source_file = path.resolve(__dirname, test_pdf);
    printer.printPDF(source_file, printerName, function(err) {
      expect(err).not.to.be.ok();

     var i = setInterval(function(){
        if(!fs.existsSync(output_path))
          return;
        clearInterval(i);
        chain();
      }, 200);
    });
  });

  it ("should print a buffered pdf", function(chain) {
    this.timeout(30000);
    var output_path = path.join(__dirname, "incoming_buffer.pdf");
    if(fs.existsSync(output_path))
      fs.unlinkSync(output_path);

    console.log("Make sure to save the file as '%s'", output_path);
    var source_file = path.resolve(__dirname, test_pdf),
        buffer = fs.readFileSync(source_file);
    printer.printPDFBuffer(buffer, printerName, function(err) {
      expect(err).not.to.be.ok();

     var i = setInterval(function(){
        if(!fs.existsSync(output_path))
          return;
        clearInterval(i);
        chain();
      }, 200);
    });
  });

  it ("should print width options", function(chain) {
    this.timeout(30000);
    var output_path = path.join(__dirname, "incoming_options.pdf");
    if(fs.existsSync(output_path))
      fs.unlinkSync(output_path);

    console.log("Make sure to save the file as '%s'", output_path);
    var source_file = path.resolve(__dirname, test_pdf),
        options = {
          printerName : printerName,
          orientation : 'landscape'
        };
    printer.printPDF(source_file, options, function(err) {
      expect(err).not.to.be.ok();

     var i = setInterval(function(){
        if(!fs.existsSync(output_path))
          return;
        clearInterval(i);
        chain();
      }, 200);
    });
  });

});