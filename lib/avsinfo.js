/*jshint node:true */

// This module is used for parsing avsinfo output.

module.exports = function(data) {
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
};