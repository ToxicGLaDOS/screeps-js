var spawn = require('spawn.js')
var getJobs = require('jobs.js')
var assignJobs = require('assignJobs.js')
var doJob = require('doJob.js')

module.exports.loop = function () {
    if(Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
    }
    
    spawn()

    var jobs = getJobs()

    assignJobs(jobs)

    for (const [name, creep] of Object.entries(Game.creeps)){
        doJob(creep);
    }
}
