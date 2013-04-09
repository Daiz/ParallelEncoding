/*jshint node:true */

var program = require('commander'),
    encode  = require('../parallelencoding'),
    pkg     = require('../package.json');

program
  .version(pkg.version)
  .usage('[options] <input>')
  .option("-p, --parts <n>","Number of parts to encode in parallel [1].", 1)
  .option("-f, --format <type>","Output format for the encoder. [mkv]","mkv")
  .option("-m, --merge","Merge parts to a single file on finish [false]")
  .option("-o, --output","Output folder for partial encodes. [input] (optional)")
  .option("-O, --outfile","Merged / single-part output filename. [input.format] (optional)")
  .option("-q, --qpfile <file>","The qpfile for the encode. [input.qpfile] (optional)")
  .option("-c, --tcfile <file>","The (VFR) timecode file for the encode. [input.tc.txt] (optional)")
  .option("-t, --task <name>","The task to run from encode.json if present [default]","default")
  .option("-s, --settings <string>","The encoding settings as a string.")
  .option("-S, --setfile <file>","File to read encode settings from.");

program.on("--help", function() {
  console.log("  Encoding Settings:");
  console.log("");
  console.log("    You need to either specify --settings, --setfile,");
  console.log("    or have a valid encode.json in your working directory.");
  console.log("    encode.json overrides --settings and --setfile.");
  console.log("");
});

program.parse(process.argv);

if(program.args[0]) {
  encode(program.args[0], program, process.stdout);
}