const schedule = require('node-schedule')
function scheduleJob(interval, cb) {
    return schedule.scheduleJob(interval,cb)
}
function cancelJob(job){
    if (job instanceof schedule.Job){
        Job.cancel()
        return true
    }
    else throw err={message: 'Job Not Found'}
}
module.exports = {
    schedule: schedule,
    scheduleJob:scheduleJob,
    cancelJob: cancelJob
}