/*jshint node:true, boss:true */

var tracker = require('./lib/taskman')(process.stdout),
    parser  = require('./lib/progparser'),
    avsinfo = require('./lib/avsinfo'),
    Proc    = require('./lib/proc'),
    Q       = require('q'),
    fs      = require('fs');

module.exports = function(input, args) {

  var opts = {
    parts: 1,
    merge: false,
    qpfile: null,
    tcfile: null,
    cmd: ""
  };

  // check for encode.json - existence overrides --settings and --setfile
  if(fs.existsSync("./encode.json")) {
    var settings = require('./encode.json'),
        profile = settings[args.task];

    // load options from task profile
    for(var k in profile) {
      if(opts.hasOwnProperty(k)) {
        opts[k] = profile[k];
      }
    }
  } else {

    // --settings
    if(args.settings) {
      opts.cmd = args.settings;
    }

    // --setfile overrides --settings
    if(args.setfile) {
      if(fs.existsSync(args.setfile)) {
        opts.cmd = fs.readFileSync(args.setfile, {encoding:"utf8"});
      } else {
        console.log("Could not find "+args.setfile);
      }
    }

  }

  // replace :input in option strings
  opts.cmd = opts.cmd.replace(":input",input);
  opts.qpfile = opts.qpfile.replace(":input",input);
  opts.tcfile = opts.tcfile.replace(":input",input);

  if(!opts.cmd) {
    throw new Error("No encoding settings specified!");
  }

  // options should be sorted out now, so it's time to move on to the actual encoding
  // 
  // first, we get the input framecount
  var frames = 0;
  framecount(input)
  // then we generate the partial scripts and their relevant files
  .then(function(framecount) {
    frames = framecount;
    return split(input, opts, frames);
  })
  // then we run the actual parallel encodes.
  .then(function(parts) {

  })
  // and finally we log some compiled statistics.
  .then(function() {

  });
/*
// first, get the input framecount
framecount(input)
// then split the .avs for parallel encoding
.then(function(framecount) {
  FRAMES = framecount;
  return parallel(INPUT, PARTS, FRAMES, QPFILE, TCFILE);
// then launch the actual encodes
}).then(function(partlist) {
  var d = Q.defer();
  var jobs = [];
  for(var i = 0; i < PARTS; i++) {
    var part = partlist[i];
    jobs.push(encode(part.input, part.output, part.framecount));
  }
  Q.all(jobs).done(function() {
    d.resolve();
  });
  return d.promise;
// finally, log average bitrate and fps.
}).then(function() {
  var fps = 0, bitrate = 0;
  for(var i = 0; i < PARTS; i++) {
    fps += tracker.tasks[i].fps;
    bitrate += tracker.tasks[i].bitrate;
  }
  fps /= PARTS;
  bitrate /= PARTS;
  console.log("Encoded "+FRAMES+" frames, "+fps.toFixed(2)+" fps, "+bitrate.toFixed(2)+" kb/s");
});*/
};

function framecount(input) {
  var d = Q.defer();
  var info = new Proc('avsinfo :i.avs', {i: input});
  info.on.out = function(data) {
    var log = avsinfo(data);
    info.kill();
    d.resolve(log.length);
  };
  return d.promise;
}

function split(input, opts, frames) {
  var d = Q.defer();
  var partlist = [];

  var trims = [];

  // if parts is set to auto (0), read the input file for comment lines starting with a trim, eg. #Trim(0,100)
  if(parts === 0) {
    var infile = fs.readFileSync(input, {encoding: "utf8"}).split("\r");
    var line, match;
    for(var j = 0, jj = infile.length; i < ii; i++) {
      line = infile[j];
      if(match = line.match(/^#\s*Trim\(([0-9]+),([0-9]+)\)/i)) {
        trims.push({line: line.replace(/^#\s*/,""), frames: (match[2] - match[1] + 1)});
      }
    }
    parts = trims.length;
    if(parts === 0) {
      console.log("No trims found. Parts set to 1.");
      parts = 1;
    }
  }

  // if there is only one part, skip the splitting
  if(parts === 1 && !trims.length) {
    partlist.push({input: input+AVS, output: input+FORMAT, framecount: framecount});
    d.resolve(partlist);
    return d.promise;
  }

  // calculate the trim points if not in auto mode
  if(!trims.length) {
    for(var i = 0, start = 0, end = 0, count; i < parts; i++) {
      start = ((framecount/parts)*i|0);
      end   = ((framecount/parts)*(i+1)|0) - 1;
      count = end - start + 1;
      trims.push({line: "Trim("+start+","+end+")", framecount: count});
    }
  }

  // create the output folder
  if(!fs.existsSync(input)) {
    fs.mkdirSync(input);
  }

  // create the partial avs files
  var str = "", partfile = "";
  for(var k = 0, kk = trims.length; k < kk; k++) {
    str = "Import(\"../"+input+".avs\")."+trims[k].line;
    partfile = input+"/"+input+".part"+(k+1);
    fs.writeFileSync(partfile+AVS,str);
    partlist.push({input: partfile+AVS, output: partfile+FORMAT, framecount: trims[k].framecount});
  }
  d.resolve(partlist);

  return d.promise;
}

function encode(input, output, framecount) {
  var d = Q.defer();
  var avs, enc;

  avs = new Proc("avs2yuv :input -o -", {input: input});
  enc = new Proc("x264 - --demuxer y4m --frames :frames -o :output", {frames: framecount, output: output});

  avs.pipe(enc);

  // create the encoding task
  var job = tracker.createTask(framecount, {fps: 0, bitrate: 0},
    ":name: [:bar] :done/:total (:percent%), :fps fps, :bitrate kb/s");

  // encode progress reporting
  enc.on.log = function(data) {
    var log = parser(enc, data);
    tracker.update(job, log.frames, {fps: log.fps, bitrate: log.bitrate});
    tracker.draw();
  };
  enc.on.close = function() {
    d.resolve(true);
  };
  return d.promise;
}