var construct = require('construct.js')
var spawn = require('spawn.js')
var getJobs = require('jobs.js')
var assignJobs = require('assignJobs.js')
var doJob = require('doJob.js')

module.exports.loop = function () {
    // In private servers there is no generatePixel function, so we check for that
    if(Game.cpu.bucket == 10000 && typeof Game.cpu.generatePixel == 'function') {
        Game.cpu.generatePixel();
    }

    construct()
    
    spawn()

    var jobs = getJobs()

    assignJobs(jobs)

    for (const [name, creep] of Object.entries(Game.creeps)){
        doJob(creep);
    }

    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }
}
