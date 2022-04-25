
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

function jobAssignedCount(task_name, target) {
    var count = 0
    for (const [_, creep] of Object.entries(Game.creeps)){
        if(creep.memory.task != null){
            if(creep.memory.task.action == task_name && creep.memory.task.target == target.id){
                count++;
            }
        }
    }
    return count;
}

function groupRepariables(o){
    var ratio_health_remaining = o.hits / o.hitsMax;
    if(o.structureType == STRUCTURE_WALL){
        if(o.hits < 10000){
            return 2;
        }
        return 4;
    }
    else{
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
}

function groupContainers(o){
    var grouping = {
        [STRUCTURE_SPAWN]: 0,
        [STRUCTURE_EXTENSION]: 0,
        [STRUCTURE_CONTAINER]: 1,
        [STRUCTURE_TOWER]: 1
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

function sortRooms(room){
    // Sorts lowest level room first
    return room.controller.level;
}

function getJobs(){
    // My construction sites
    var construction_sites = [];
    var repairables = [];
    var containers = []
    for (const room_name in Game.rooms){
        var room = Game.rooms[room_name];
        construction_sites = construction_sites.concat(room.find(FIND_MY_CONSTRUCTION_SITES));
        // Things that might need repair
        repairables = repairables.concat(room.find(FIND_STRUCTURES,
            {
                filter:
                    (o) => {
                        return o.hits != null;
                    }
            }
        ))

        // Things that can take energy
        containers = containers.concat(room.find(FIND_STRUCTURES,
            {
                filter:
                    (o) => {
                        return o.store != null;
                    }
            }));
        containers = _.sortBy(containers, sortContainers);
    }
    var grouped_repairables = _.groupBy(repairables, groupRepariables);
    var grouped_containers = _.groupBy(containers, groupContainers);
    var jobs = []
    var sorted_rooms = _.sortBy(Game.rooms, sortRooms);

    for (const room of sorted_rooms){
        room_name = room.name;

        // High priority containers
        if(grouped_containers[0] != null){
            grouped_containers[0].forEach((container) => {
                if (container.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                    jobs.push({
                        target:container,
                        task:"fill",
                        requiredParts: [MOVE, CARRY],
                        priority: 0
                    })
                }
            })
        }

        var max_workers_per_site = 2
        construction_sites.forEach((construction_site) => {
            var screeps_assigned = jobAssignedCount("build", construction_site);
            var num_jobs_to_be_assigned = Math.max(max_workers_per_site - screeps_assigned, 0);

            for (var i = num_jobs_to_be_assigned; i > 0; i--) {
                jobs.push({
                    target:construction_site,
                    task:"build",
                    requiredParts: [MOVE, CARRY, WORK],
                    priority: max_workers_per_site - i + 1
                })
            }
        })

        // 0-tier priority repairs
        if(grouped_repairables[0] != null){
            grouped_repairables[0].forEach((container) => {
                jobs.push({
                    target:container,
                    task:"repair",
                    requiredParts: [MOVE, CARRY, WORK],
                    priority: 2
                })
            })
        }

        if (room.controller.my){
            jobs.push({
                target:room.controller,
                task:"upgrade",
                requiredParts: [MOVE, CARRY],
                priority: 3
            })
        }

        // 1-tier priority repairs
        if(grouped_repairables[1] != null){
            grouped_repairables[1].forEach((container) => {
                jobs.push({
                    target:container,
                    task:"repair",
                    requiredParts: [MOVE, CARRY, WORK],
                    priority: 4
                })
            })
        }

        // 2-tier priority repairs
        if(grouped_repairables[2] != null){
            grouped_repairables[2].forEach((container) => {
                jobs.push({
                    target:container,
                    task:"repair",
                    requiredParts: [MOVE, CARRY, WORK],
                    priority: 5
                })
            })
        }

        // Low priority containers
        if(grouped_containers[1] != null){
            grouped_containers[1].forEach((container) => {
                if (container.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                    jobs.push({
                        target:container,
                        task:"fill",
                        requiredParts: [MOVE, CARRY],
                        priority: 6
                    })
                }
            })
        }

        // Add a bunch of upgrades as a default
        // TODO: Make this less hacky
        for(var i = 0; i < 12; i++){
            if (room.controller.my) {
                jobs.push({
                    target:room.controller,
                    task:"upgrade",
                    requiredParts: [MOVE, CARRY],
                    priority: 7
                })
            }
        }


        var enemies = room.find(FIND_HOSTILE_CREEPS);
        if (enemies.length > 0) {
            enemies.forEach((enemy) => {
                jobs.push({
                    target:enemy,
                    task:"defend",
                    requiredParts: [MOVE, ATTACK],
                    priority: 8
                });
            });
        }

        if (Game.flags["claim"]) {
            jobs.push({
                target:Game.flags["claim"],
                task:"claim",
                requiredParts: [MOVE, CLAIM],
                priority: 20
            })
        }
    }

    jobs = _.sortBy(jobs, "priority");
    
    var roomVisual = new RoomVisual();

    // In a try-catch because rendering this debug text should never cause us to halt
    try {
        for (var i = 0; i < Math.min(20, jobs.length); i++){
            var job = jobs[i];
            var text;
            if (job.target.hasOwnProperty('name')){
                text = `Task: ${job.task}, Target: ${job.target.name}, Room: ${job.target.room.name}, Priority: ${job.priority}`
            }
            else {
                text = `Task: ${job.task}, Target: ${job.target.id}, Room: ${job.target.room.name}, Priority: ${job.priority}`
            }

            roomVisual.text(text, 0, i/2, {color: '#FF0000', font: 0.5, align: "left"});
        }
    }
    catch (error){
        roomVisual.text(`Error: ${error.stack}`, 0, i/2, {color: '#FF0000', font: 0.5, align: "left"});
    }

    return jobs
}

module.exports = getJobs
