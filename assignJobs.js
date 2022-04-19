var _ = require('lodash');

function hasRequiredParts(creep, requiredParts){
    return _.every(requiredParts, (part, _index, _collection) => creep.getActiveBodyparts(part));
}

function getJobFitness(creep, job){
    // This could use some tuning, because creeps
    // could be blocking the path but they'll be
    // out of the way next frame
    var pathObj = PathFinder.search(creep.pos, job.target);
    if(pathObj.incomplete){
        return -Infinity
    }
    return -pathObj.path.length
}

function getBestCreep(job){
    var fitnesses = [];
    for (const [name, creep] of Object.entries(Game.creeps)){
        // Skip creeps that don't have the required parts
        if(!hasRequiredParts(creep, job.requiredParts)){
            continue;
        }
        // Skip creeps that already have a task
        if(creep.memory.task != null){
            continue;
        }
        var fitness = getJobFitness(creep, job);
        fitnesses.push({
            creep: creep,
            fitness: fitness
        });
    }

    if(fitnesses.length > 0){
        // Would use maxBy if screeps has higher lodash version
        var bestFit = _.sortBy(fitnesses, (o) => {o.fitness})[0];

        return bestFit.creep;
    }
    return null;
}

function assignJobs(jobs){
    jobs.forEach((job) => {
        var bestFit = getBestCreep(job);
        if(bestFit){
            bestFit.memory.task = {
                action: job.task,
                target: job.target.id
            }
        }
    })
}

module.exports = assignJobs
