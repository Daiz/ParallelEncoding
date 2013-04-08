/*jshint node:true */

// this module serves as a multiple task tracker
// and also handles the logging for said tasks.

var charm = require('charm')(),
    write = 0;

var tracker, tasks = [];

// usage: var tracker = require('tracker')();

module.exports = function(output, opts) {
  charm.pipe(output);
  for(var k in opts) {
    if(tracker.opts.hasOwnProperty(k)) {
      tracker.opts[k] = opts[k];
    }
  }
  return tracker;
};

// helper functions

function progressBar(n) {
  var len = tracker.opts.length, str = "",
      bar = ((n|0) / (100/len)) | 0;

  for(var i = 0; i < len; i++) {
    if(i < bar) {
      str += tracker.opts.complete;
    }
    else {
      str += tracker.opts.incomplete;
    }
  }

  return str;
}

function visualize(task) {
  var percent = task.done/task.total*100;
  str = task.visualize;
  str = str.replace(":bar",progressBar(percent));
  str = str.replace(":percent",percent.toFixed(1));
  for(var k in task) {
    if(task.hasOwnProperty(k)) {
      str = str.replace(":"+k,task[k]);
    }
  }
  return str;
}

// main object

tracker = {
  opts: {
    complete: "=",
    incomplete: " ",
    length: 20
  },
  tasks: tasks,
  // task creation - minimum requirement is total task length
  createTask: function(total, task, visualize) {
    if(!total) throw new Error("Task requires a total length!");
    if(!task) task = {};
    task.completed = false;
    task.done = 0;
    task.total = total;
    task.index = tasks.length;
    task.visualize = visualize || ":name: [:bar] :percent%";
    if(!task.name) task.name = "Task " + (task.index+1);
    tasks.push(task);
    // return task id
    return task.index;
  },
  removeTask: function(id) {
    // remove task at position id
    tasks = tasks.slice(0,id).concat(tasks.slice(id+1,tasks.length));
  },
  // add progress to task
  tick: function(index, amount, data) {
    var task = tasks[index];
    task.done += amount;
    if(task.done > task.total) task.done = task.total;
    // update additional data
    for(var k in data) {
      if(task.hasOwnProperty(k)) {
        task[k] = data[k];
      }
    }
  },
  // set progress on task
  update: function(index, amount, data) {
    var task = tasks[index];
    task.done = amount;
    if(task.done > task.total) task.done = task.total;
    // update additional data
    for(var k in data) {
      if(task.hasOwnProperty(k)) {
        task[k] = data[k];
      }
    }
  },
  // visual update
  draw: function() {
    // clear the previous lines
    if(write) {
      charm.up(write).erase('down');
    }
    // write task progress to charm
    for(var i = 0, ii = tasks.length; i < ii; i++) {
      charm.write(visualize(tasks[i]) + "\r");
    }
    // set write to amount of lines written for next clearing
    write = tasks.length;
  },
  // various events
  on: function(evt, callback) {
    var i, ii;
    switch(evt) {
      case "alldone": // all tasks completed
        var alldone = true;
        for(i = 0, ii = tasks.length; i < ii; i++) {
          if(tasks[i].progress < 100) alldone = false;
        }
        if(alldone) callback(tasks); // gives all tasks in return
        break;
      case "complete": // single task completes
        for(i = 0, ii = tasks.length; i < ii; i++) {
          if(tasks[i].progress >= 100 && !tasks[i].completed) {
            tasks[i].completed = true;
            callback(tasks[i]); // gives completed task in return
          }
        }
        break;
    }
  }
};