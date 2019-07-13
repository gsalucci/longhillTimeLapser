const ffpath = require('@ffmpeg-installer/ffmpeg').path
const ProgressBar = require('cli-progress')
const path = require('path')
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffpath)
var cmd = ffmpeg()
const fs = require('fs')
const tools = require('tools.js')
var i = 0
function setupImages(folder, symsFolder) {
    if (!(fs.existsSync(symsFolder) && fs.lstatSync(symsFolder).isDirectory())){
        try {
            fs.mkdirSync(symsFolder)
        } catch(e){
            tools.logger(tools.messageLevel.info,tools.messageType.err,e)
        }
    }
    fs.readdirSync(folder).forEach(file => {
        if (path.extname(file) == '.jpg' || path.extname(file) == '.jpeg'){
            let fullPath = folder + path.sep + file
            try {
                fs.linkSync(fullPath,symsFolder+path.sep+i+path.extname(file),'file')
            }
            catch(e){
                if (e.code == 'EEXIST') tools.logger(tools.messageLevel.info,tools.messageType.warn,e)
                else tools.logger(tools.messageLevel.info,tools.messageType.err,e)
            }
            ++i
        }
      })
}

function makeVideo(){
    var folder = tools.status.rootDir.filename + path.sep + tools.status.subDir
    var symsFolder = folder + path.sep + 'syms'
    setupImages(folder, symsFolder)
    var bar = new ProgressBar.Bar({
        barsize: 20,
        format: 'Encoding [{bar}] {percentage}% | ETA: {eta}s | ',
        barCompleteChar: '#',
        barIncompleteChar: '.',
    })
    tools.log('Encoding Started!')
    bar.start(100,0)
    cmd
        .on('end', onEnd)
        .on('progress', onProgress)
        .on('error', onError)
        .input(symsFolder + path.sep + '%d.jpg')
        //.inputFPS(4 / 100)
        .output(folder + path.sep + 'daily.mp4')
        .outputFPS(25)
        .run();
    
    function onProgress(progress) {
        bar.update(progress.percent)
    }
    
    function onError(err, stdout, stderr) {
        tools.logger(tools.messageLevel.info,tools.messageLevel.err,'Cannot process video: ' + err.message);
    }
    function onEnd() {
        bar.update(100)
        tools.log('Encoding Terminated!');
    }
}
module.exports = {
    makeVideo: makeVideo
}