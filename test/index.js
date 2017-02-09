"use strict";

const fs   = require('fs');
const path = require('path');

const some          = require('mout/array/some');
const intersection  = require('mout/array/intersection');
const pluck         = require('mout/object/pluck');
const values        = require('mout/object/values');

const printersName = ['PDFCreator', 'doPDF v7'];// 'Foxit PhantomPDF Printer'],

const expect = require('expect.js');
const printer = require('..');

var printerName = null;
var test_pdf = "foo.pdf";

//var printerName = '\\\\ivsfrsrv-ad1\\imprimante DEVELWEB';
//test_pdf = "Ruler_A4.pdf";

describe("Initial test suite", function(){

  it("should list printers", function(chain) {
    printer.getPrinters(function(err, printers) {
      expect(err).not.to.be.ok();
      expect(printers).to.be.a('object');
      console.log("Current printer lists", printers);
      chain();
    });
  });

  it("should check for printer existance", function(chain){
    printer.getPrinters(function(err, printers) {
      printers = values(pluck(printers, 'name'));
      printerName = intersection(printers, printersName)[0];
      if(!printerName) 
        throw "Cannot find PDF printer (required for testing), please download one (we recommend http://azure.download.pdfforge.org/pdfcreator/2.2.1/PDFCreator-2_2_1-setup.exe";


      console.log("Working with printer '%s'", printerName);
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

  it ("should print width options", function(chain) {
    this.timeout(30000);
    var output_path = path.join(__dirname, "incoming_options.pdf");
    if(fs.existsSync(output_path))
      fs.unlinkSync(output_path);

    console.log("Make sure to save the file as '%s'", output_path);
    var source_file = path.resolve(__dirname, test_pdf),
        options = {
          printer_name : printerName,
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