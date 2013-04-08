/*jshint node:true */

// This module is used for parsing textual output of avsinfo, ffmpeg and x264

var sframes = 0, sfps = 0, sbitrate = 0;
var rframes = 0, rfps = 0, rbitrate = 0;

module.exports = {
  // avsinfo output parsing
  info: function(data) {
    str = ""+data;
    var colorspace = str.match(/Color: ([^,]+)+/)[1],
        resolution = str.match(/Resolution: ([0-9]+x[0-9]+)/)[1],
        framerate  = str.match(/Frame rate: ([0-9]+)\/?([0-9]+)?/),
        length     = str.match(/Length: ([0-9]+) frames/)[1];

    if(framerate[2]) {
      framerate = parseInt(framerate[1],10) / parseInt(framerate[2],10);
    } else {
      framerate = parseInt(framerate[1],10);
    }
    resolution = resolution.split("x");
    resolution = {
      width: parseInt(resolution[0],10),
      height: parseInt(resolution[1],10)
    };
    length = parseInt(length,10);
    return {
      colorspace: colorspace.toUpperCase(),
      resolution: resolution,
      framerate: framerate,
      length: length
    };
  },
  // x264 & ffmpeg process parsing
  encoder: function(program, data) {
    str = ""+data;
    if(str.match('\n')) {
      str = str.split('\n');
      for(var i = str.length-1; i > 0; i--) {
        if(str[i].match('frame')) {
          str = str[i];
          break;
        }
      }
    }
    switch(program.name) {
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
  }
};