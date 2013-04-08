/*jshint node:true */

var program = require('commander'),
    tracker = require('./lib/tracker')(process.stdout),
    parser  = require('./lib/consoleparser'),
    Proc    = require('./lib/proc'),
    Q       = require('q'),
    fs      = require('fs');

var INPUT  = "01.avs",
    TEMP   = "01",
    OUTPUT = "NUL",
    PARTS  = 1,
    FRAMES = 0;

// first, get the input framecount
framecount(INPUT)
// then split the .avs for parallel encoding
.then(function(framecount) {
  FRAMES = framecount;
  return parallel(INPUT, PARTS, FRAMES);
// then launch the actual encodes
}).then(function(partlist) {
  var d = Q.defer();
  var jobs = [];
  for(var i = 0; i < PARTS; i++) {
    var part = partlist[i];
    jobs.push(encode(part.input, part.output, part.framecount));
    // do visual update on progress
    jobs[i].progress(tracker.draw);
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
});


function framecount(input) {
  var d = Q.defer();
  var info = new Proc('avsinfo :i', {i: input});
  info.on.out = function(data) {
    var log = parser.info(data);
    info.kill();
    d.resolve(log.length);
  };
  return d.promise;
}

function parallel(input, parts, framecount) {
  var d = Q.defer();
  var partlist = [];

  // if there is only one part, skip the splitting
  if(parts === 1) {
    partlist.push({input: input, output: "NUL", framecount: framecount});
    d.resolve(partlist);
    return d.promise;
  }

  // calculate the trim points and create partial avs files
  var str = "", len = 0, partfile = "";
  for(var i = 0, start = 0, end = 0, count; i < parts; i++) {
    start = ((framecount/parts)*i|0);
    end   = ((framecount/parts)*(i+1)|0) - 1;
    count = end - start + 1;
    str   = "Import(\"../01.avs\").Trim("+start+","+end+")";
    partfile = "01/01.part"+(i+1);
    fs.writeFileSync(partfile+".avs",str);
    partlist.push({input: partfile+".avs", output: partfile+".mkv", framecount: count});
  }
  d.resolve(partlist);

  return d.promise;
}

function encode(input, output, framecount) {
  var d = Q.defer();
  var avs, enc;

  avs = new Proc("avs2yuv :input -o -", {input: input});
  enc = new Proc("x264 - --demuxer y4m --frames :frames -o :output",
                {frames: framecount, output: output});

  avs.pipe(enc);

  // create the encoding task
  var job = tracker.createTask(framecount, {fps: 0, bitrate: 0},
    ":name: [:bar] :done/:total (:percent%), :fps fps, :bitrate kb/s");

  // encode progress reporting
  enc.on.log = function(data) {
    var log = parser.encoder(enc, data);
    tracker.update(job, log.frames, {fps: log.fps, bitrate: log.bitrate});
    // promise progress update
    d.notify();
  };
  enc.on.close = function() {
    d.resolve(true);
  };
  return d.promise;
}