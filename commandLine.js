const cli = require('command-line-args')
const getUsage = require('command-line-usage')
const fs = require('fs')
const dateMath = require('date-arithmetic')
const cliDefinitions = [
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'url', alias: 'u', type: String },
    { name: 'destination', alias: 'f', type: FileDetails },
    { name: 'interval', alias: 'i', type: String },
    { name: 'duration', alias: 'd', type: Duration },
    { name: 'resume', alias: 'r', type: String }
]
const helpMessage = [
    {
        header: 'LongHillTimeLapser',
        content: 'Downloads an image from [underline]{url} and stores it in [underline]{destination} every [underline]{interval} for [underline]{duration}'
    },
    {
        header: 'Options',
        optionList: [
            {name: 'help', alias: 'h', description: 'prints this help message'},
            {name: 'url', alias: 'u', typeLabel: '[underline]{url}', description: 'input url'},
            {name: 'destination', alias: 'f', typeLabel: '[underline]{directory}', description: 'output folder'},
            {name: 'interval', alias: 'i', typeLabel: '[underline]{string}', description: 'a cron-style schedule string, eg. [underline]{\'}*/5 * * * *[underline]{\'} every 5 minutes'},
            {name: 'duration', alias: 'd', typeLabel: '[underline]{string}', description: 'how long should the program run, also when to notify via email eg. 1,y / 1,m / 1,d / [italic]{number}[bold]{,}[italic]{y / m / d}'},
            {name: 'resume', alias: 'r', typeLabel: '[underline]{directory}', description: 'resumes a previously started timelapse, enter the root directory of the previous timelapse'},
            {name: 'verbose', alias: 'v', description: 'verbose output'}
        ]
    }
]
function FileDetails(filename){
    if (!(this instanceof FileDetails)) return new FileDetails(filename)
    this.filename = filename
    var e = fs.existsSync(filename)
    this.exists = e
    if (e) this.directory = fs.lstatSync(filename).isDirectory()
    else this.directory = false
  }

function Duration(d){
    if (!(this instanceof Duration)) return new Duration(d)
    var duration= d.split(',')
    this.duration = duration
    switch (duration[1]) {
        case 'y':
        this.endDate = dateMath.add(new Date(), parseInt(duration[0]), 'year')
        break;
        
        case 'm':
        this.endDate = dateMath.add(new Date(), parseInt(duration[0]), 'month')            
        break;        
        
        case 'd':
        this.endDate = dateMath.add(new Date(), parseInt(duration[0]), 'day')
        break;        
    }

}
module.exports = {
options: cli(cliDefinitions),
usage: getUsage(helpMessage)
}