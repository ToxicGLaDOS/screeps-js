var _ = require('lodash');

function hasRequiredParts(creep, requiredParts){
    return _.every(requiredParts, (part, _index, _collection) => creep.getActiveBodyparts(part));
}

function getJobFitness(creep, job){
    // getRangeTo returns Infinity if the target is in another room
    // TODO: Improve the efficency by adding a function
    // to do getRangeTo across rooms
    var dist = creep.pos.getRangeTo(job.target);
    if (dist != Infinity) {
        return -dist;
    }
    var pathObj = PathFinder.search(creep.pos, job.target);
    if(pathObj.incomplete){
        return -Infinity
    }
    return -pathObj.path.length
}

function getBestCreep(job, valid_creeps){
    // Filter out the creeps that are in a different room than the target
    // as an optimization. This seems like it could cause a creep to loop between
    // rooms.
    var same_room_creeps = _.filter(valid_creeps, (creep) => creep.room == job.target.room);
    if (same_room_creeps.length > 0) {
        valid_creeps = same_room_creeps;
    }
    var fitnesses = [];
    for (const [name, creep] of Object.entries(valid_creeps)){
        // Skip creeps that don't have the required parts
        if(!hasRequiredParts(creep, job.requiredParts)){
            continue;
        }
        if(creep.memory.subtask != null && creep.memory.subtask.action == "harvest") {
            continue;
        }
        // Skip creeps that already have a task
        //if(creep.memory.task != null){
        //    continue;
        //}
        var fitness = getJobFitness(creep, job);
        fitnesses.push({
            creep: creep,
            fitness: fitness
        });
    }

    if(fitnesses.length > 0){
        // Would use maxBy if screeps has higher lodash version
        // -o.fitness because we want to sort high to low
        var bestFit = _.sortBy(fitnesses, (o) => -o.fitness)[0];
        return bestFit.creep;
    }
    return null;
}

function assignJobs(jobs){
    // Weird way to make a copy
    var unassigned_creeps = {};
    Object.assign(unassigned_creeps, Game.creeps);
    jobs.forEach((job) => {
        var bestFit = getBestCreep(job, unassigned_creeps);
        if(bestFit){
            delete unassigned_creeps[bestFit.name];
            bestFit.memory.task = {
                action: job.task,
                target: job.target.id
            }
            // If the creep is harvesting we don't want to disturb that
            if (bestFit.memory.subtask != null && bestFit.memory.subtask.action != "harvest") {
                bestFit.memory.subtask = null;
            }
        }
    })
}

module.exports = assignJobs
