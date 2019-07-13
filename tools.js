const colors= require('colors/safe')
const path = require('path')
const fs = require('fs')
const dl = require('image-downloader')
const format = require('node.date-time')
const dateFormat='dd-MM-Y hh:mm:SS'
const fNameFormat='dd-MM-Y_hh-mm-SS'
const level = {
    'info': 0,
    'dbg': 1
}
const type = {
    'info': 99,
    'warn': 100,
    'err': 101
}
var status = {
    verboseLevel: 0,
    downloadInterval: 'unset',
    rootDir: 'unset',
    subDir: '',
    url: 'unset',
    startDate: 'unset',
    endDate: 'unset',
    startDifference: 0,
    progress: 0
}
var dayCount = 0

function load(f){
    if (fs.existsSync(f)) {
        try {
            log('Resuming from: ' + f + path.sep + 'resume.json')
            status = JSON.parse(fs.readFileSync(f + path.sep + 'resume.json'))
            status.startDate = new Date(status.startDate)
            status.endDate = new Date(status.endDate)
            debug('tools.status: '+ JSON.stringify(status))
        } catch(e) {
            logger(level.info, type.err,e)
            return e
        }
    }
    return status
}

function store(){
    try {
        log('Saving resume file...')
        fs.writeFileSync(status.rootDir.filename + path.sep + 'resume.json',JSON.stringify(status))
    } catch (e) {
        logger(level.info,type.err,e)
        return e
    }
    return false
}

function log(m){
    logger(level.info,type.info,m)
}
function debug(m){
    logger(level.dbg,type.info,m)
}
function logger(l,t, message){
    if (l <= status.verboseLevel){
        switch(t){
            
            case type.info:
                console.log(colors.bgBlue(new Date().format(dateFormat)) + ' ' + message)
            break;
        
            case type.warn:
                console.log(colors.yellow(new Date().format(dateFormat)) + ' ' + message)
            break;
        
            case type.err:
                console.log(colors.red(new Date().format(dateFormat)) + ' ' + message)
            break;
        }
    }
}
function mkdir(d){
    try{
        fs.mkdirSync(d)
    } catch (e) {
        logger(level.info,type.err,e)
    }
}
function complete() {
    log('TIMELAPSE COMPLETE!')
    process.exit(0)
}
function doDl(){
    var diff = status.endDate.getTime() - Date.now()
    if (diff <= 0) complete()
    else status.progress=(100 - (diff/status.startDifference)*100).toFixed(2)
    log('Timelapse completion: '+ colors.green(status.progress + ' %'))
    log('Downloading image from: ' + status.url)

    const dlOpts = {
        url: status.url,
        dest: status.rootDir.filename + path.sep + status.subDir + new Date().format(fNameFormat)  + '.jpg'
    }
    dl.image(dlOpts)
    .then(({ filename, image }) => {
        logger(level.info,type.info,'File saved to: ' + filename)
      }).catch((err) => {
        logger(level.info,type.err,err)
      })
}
function createSubDir(){
    ++dayCount
    status.subDir = 'Day '+ dayCount + path.sep
    log('Creating sub-directory: '+ status.subDir)
    mkdir(status.rootDir.filename + path.sep + status.subDir)
}
function initFs(){
    if (!status.rootDir.exists && !status.rootDir.directory){
        log("Destination directory doesn\'t exist, creating it now...")
        mkdir(status.rootDir.filename)
    } else if (!status.rootDir.directory) {
        logger(level.info,type.warn,"Destination isn\'t a directory, creating: " + status.rootDir.filename + "_d")
        mkdir(status.rootDir.filename + '_d')
        status.rootDir.filename = status.rootDir.filename + '_d'
        status.rootDir.directory = true
    }
    createSubDir()
}
module.exports = {
    messageLevel: level,
    messageType: type,
    log: log,
    dbg: debug,
    logger: logger,
    initFs: initFs,
    status: status,
    doDl: doDl,
    doSubDir : createSubDir,
    loadConfig : load,
    storeConfig: store
}