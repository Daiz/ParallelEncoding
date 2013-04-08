/*jshint node:true */

var program = require('commander'),
    encode  = require('../parallelencoding');

program
  .version("0.0.1")
  .usage('[options] <input>')
  .option("-p, --parts <n>","Number of parts to encode in parallel [1].", 1)
  .option("-f, --format <type>","Output format (mkv/mp4/h264) [mkv]","mkv")
  .option("-t, --task <file>","Use a specific encoding profile.","encode.json")
  .parse(process.argv);

if(program.args[0]) {
  encode(program.args[0], program.parts, program.format);
}