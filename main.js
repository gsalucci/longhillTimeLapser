const cli = require('./commandLine.js')
const tools = require('./tools.js')
const path = require('path')
const videoMaker = require('./videomaker.js')
var status = tools.status
const scheduler = require('./scheduler.js')
const usage = cli.usage
const options = cli.options
var jobs = []
function Job(name,job){
    if (!this instanceof Job) return new Job(name,job)
    this.name = name
    this.job = job
}

function printHelp(){
    console.log(usage)
    process.exit(0)
}
if (Object.keys(options).length === 0) printHelp()
if (options.help == true) printHelp()
if (options.verbose) status.verboseLevel = 1
tools.dbg('options: ' + JSON.stringify(options))
tools.dbg('resume: ' + JSON.stringify(options.resume))
if (options.resume){
    tools.dbg('setting status from resume file')
    status = tools.loadConfig(options.resume)
}
else {
    tools.dbg('Setting status from options')
    status.url = options.url
    status.downloadInterval = options.interval
    status.rootDir = options.destination
    status.startDate = new Date()
    status.endDate = options.duration.endDate
    status.startDifference = status.endDate - status.startDate
    tools.initFs()
}
tools.dbg('status: ' + JSON.stringify(status))
var dirSwapRule = new scheduler.schedule.RecurrenceRule()
    dirSwapRule.hour = 00
    dirSwapRule.minute = 01
    dirSwapRule.dayOfWeek = new scheduler.schedule.Range(0,6)

var dailyVideoRule = new scheduler.schedule.RecurrenceRule()
    dailyVideoRule.hour = 21
    dailyVideoRule.minute = 50
    dailyVideoRule.second = 30
    dailyVideoRule.dayOfWeek = new scheduler.schedule.Range(0,6)

tools.log('Scheduling download job with interval: ' + status.downloadInterval)
jobs.push(new Job('download',scheduler.scheduleJob(status.downloadInterval,tools.doDl)))
tools.log('Scheduling daily directory swap job')
jobs.push(new Job('dirswap',scheduler.scheduleJob(dirSwapRule,tools.doSubDir)))
tools.log('Scheduling daily video creation')
jobs.push(new Job('videomaker',scheduler.scheduleJob(dailyVideoRule,videoMaker.makeVideo)))
tools.dbg(JSON.stringify(jobs))
//gracefully handling sigint
if (process.platform === "win32") {
    var rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    rl.on("SIGINT", function () {
      process.emit("SIGINT");
    });
  }
  
  process.on("SIGINT", function () {
    //graceful shutdown
    tools.storeConfig()
    process.exit();
  });
setInterval(() => {}, Number.POSITIVE_INFINITY)