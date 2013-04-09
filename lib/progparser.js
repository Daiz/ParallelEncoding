/*jshint node:true */

// This module is used for parsing textual output of ffmpeg and x264

var sframes = 0, sfps = 0, sbitrate = 0;
var rframes = 0, rfps = 0, rbitrate = 0;

module.exports = function(program, data) {
  var str = ""+data;
  if(str.match('\n')) {
    str = str.split('\n');
    for(var i = str.length-1; i > 0; i--) {
      if(str[i].match('frame')) {
        str = str[i];
        break;
      }
    }
  }
  var name = program.name.match(/x264|ffmpeg|avconv/);
  if(!name) {
    throw new Error("Unsupported encoder!");
  }

  if(name[0] === "avconv") name[0] = "ffmpeg";

  switch(name[0]) {
    case "x264":
      sframes  = str.match(/([0-9]+)\/[0-9]+/);
      sfps     = str.match(/([0-9]+\.[0-9]+) fps/);
      sbitrate = str.match(/([0-9]+\.[0-9]+) kb\/s/);
      break;
    case "ffmpeg":
      sframes  = str.match(/frame=\s*([0-9]+)/);
      sfps     = str.match(/fps=\s*([0-9]+)/);
      sbitrate = str.match(/bitrate=\s*([0-9]+\.[0-9]+)kbits\/s/);
      break;
  }
  if(sframes) {
    rframes = parseInt(sframes[1],10);
  } else {
    rframes = 999999999;
  }
  if(sfps) {
    rfps = parseFloat(sfps[1],10);
  }
  if(sbitrate) {
    rbitrate = parseFloat(sbitrate[1],10);
  }
  return {frames: rframes, fps: rfps, bitrate: rbitrate};
};