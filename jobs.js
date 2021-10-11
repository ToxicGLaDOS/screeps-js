
// Determines whether a creep is already assigned to a 
// specific task and target
function isJobAssigned(task_name, target){
    for (const [_, creep] of Object.entries(Game.creeps)){
        if(creep.memory.task != null){
            if(creep.memory.task.action == task_name && creep.memory.task.target == target.id){
                return true;
            }
        }
    }
    return false;
}

function groupRepariables(o){
    var ratio_health_remaining = o.hits / o.hitsMax;
    if(o.structureType == STRUCTURE_WALL){
        return 4;
    }
    if(ratio_health_remaining < .25){
        return 0;
    }
    if(ratio_health_remaining < .5){
        return 1;
    }
    if(ratio_health_remaining < .75){
        return 2;
    }
    if(ratio_health_remaining < 1){
        return 3;
    }
    return 4;
}

function groupContainers(o){
    var grouping = {
        [STRUCTURE_SPAWN]: 0,
        [STRUCTURE_EXTENSION]: 0,
        [STRUCTURE_CONTAINER]: 1
    }

    return grouping[o.structureType];
}

// Used in lodash sortBy to sortContainers
function sortContainers(o){
    // Lower is higher priority
    var priority = {
        [STRUCTURE_SPAWN]: 0,
        [STRUCTURE_EXTENSION]: 1,
        [STRUCTURE_CONTAINER]: 2
    }
    
    return priority[o.structureType];
}

function getJobs(){
    var main_room = Game.spawns["Spawn0"].room

    // My construction sites
    var construction_sites = main_room.find(FIND_MY_CONSTRUCTION_SITES);
    // Things that might need repair
    var repairables = main_room.find(FIND_STRUCTURES,
        {
            filter:
                (o) => {
                    return o.hits != null;
                }
        }
    )
    var grouped_repairables = _.groupBy(repairables, groupRepariables);
    
    // Things that can take energy
    var containers = main_room.find(FIND_STRUCTURES, 
        {
            filter:
                (o) => {
                    return o.store != null;
                }
        });
    containers = _.sortBy(containers, sortContainers);
    var grouped_containers = _.groupBy(containers, groupContainers);

    var jobs = []


    // High priority containers
    if(grouped_containers[0] != null){
        grouped_containers[0].forEach((container) => {
            if (!isJobAssigned("fill", container) && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                jobs.push({
                    target:container,
                    task:"fill",
                    requiredParts: [MOVE, CARRY]
                })
            }
        })
    }

    construction_sites.forEach((construction_site) => {
        if (!isJobAssigned("build", construction_site)){
            jobs.push({
                target:construction_site,
                task:"build",
                requiredParts: [MOVE, CARRY, WORK]
            })
        }        
    })
    
    // 0-tier priority repairs
    if(grouped_repairables[0] != null){
        grouped_repairables[0].forEach((container) => {
            if (!isJobAssigned("repair", container)){
                jobs.push({
                    target:container,
                    task:"repair",
                    requiredParts: [MOVE, CARRY, WORK]
                })
            }
        })
    }
    

    if (!isJobAssigned("upgrade", main_room.controller)){
        jobs.push({
            target:main_room.controller,
            task:"upgrade",
            requiredParts: [MOVE, CARRY]
        })
    }

    // 1-tier priority repairs
    if(grouped_repairables[1] != null){
        grouped_repairables[1].forEach((container) => {
            if (!isJobAssigned("repair", container)){
                jobs.push({
                    target:container,
                    task:"repair",
                    requiredParts: [MOVE, CARRY, WORK]
                })
            }
        })
    }

    // 2-tier priority repairs
    if(grouped_repairables[2] != null){
        grouped_repairables[2].forEach((container) => {
            if (!isJobAssigned("repair", container)){
                jobs.push({
                    target:container,
                    task:"repair",
                    requiredParts: [MOVE, CARRY, WORK]
                })
            }
        })
    }

    // Low priority containers
    if(grouped_containers[1] != null){
        grouped_containers[1].forEach((container) => {
            if (!isJobAssigned("fill", container) && container.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                jobs.push({
                    target:container,
                    task:"fill",
                    requiredParts: [MOVE, CARRY]
                })
            }
        })
    }
    

    // Add a bunch of upgrades as a default
    // TODO: Make this less hacky
    for(var i = 0; i < 12; i++){
        jobs.push({
            target:main_room.controller,
            task:"upgrade",
            requiredParts: [MOVE, CARRY]
        })
    }

    //energy_sources.forach((energy_source) => {
    //    if (!isJobAssigned("harvest", energy_source)){
    //        jobs.push({
    //            target:energy_source,
    //            task:"harvest"
    //        })
    //    }
    //})

    return jobs
}

module.exports = getJobs
