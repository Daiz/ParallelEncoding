/*jshint node:true */

var program = require('commander'),
    encode  = require('./parallelencoding');

program
  .version("0.0.1")
  .option("-i, --input","Input avs file. (Required)")
  .option("-p, --parts","Number of parts to encode in parallel [1].",1)
  .option("-d, --dir","Output directory [:input]",":input")
  .option("-o, --output","Output prefix [:input]",":input")
  .option("-t, --task","Use a specific encoding profile.","encode.json")
  .parse(procss.argv);

if(program.input) {

}
