function finishTask(creep){
    creep.memory.task = null
    creep.memory.subtask = null
}

// Returns whether the task was completed
function doHarvestSubTask(creep){
    var target = Game.getObjectById(creep.memory.subtask.target);
    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
        // Start from top of function
        creep.memory.subtask = null;
        return true;
    }
    var err = creep.harvest(target);
    if(err == ERR_NOT_IN_RANGE){
        creep.moveTo(target);
    }
    return false;
}


function doBuild(creep){
    if(creep.memory.subtask == null){
        // If the creep has energy stored
        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
            creep.memory.subtask = {
                action: "build",
                target: creep.memory.task.target
            }
        }
        else{
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if(source){
                creep.memory.subtask = {
                    action: "harvest",
                    target: source.id
                }
            }
            else{
                return;
            }
        }
    }

    var target = Game.getObjectById(creep.memory.subtask.target);
    // Target will be null when it's done building?
    if(target == null){
        finishTask(creep);
    }
    else{
        if(creep.memory.subtask.action == "build"){
            var err = creep.build(target);
            if(err == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }
            else if(err == ERR_NOT_ENOUGH_RESOURCES){
                // Start from top of function
                creep.memory.subtask = null;
                doBuild(creep);
                return;
            }
        }
        else if(creep.memory.subtask.action == "harvest"){
            var harvestCompleted = doHarvestSubTask(creep);
            if(harvestCompleted){
                doBuild(creep);
            }
        }
    }
}

function doFill(creep){
    if(creep.memory.subtask == null){ 
        // If the creep has energy stored
        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
            creep.memory.subtask = {
                action: "fill",
                target: creep.memory.task.target
            }
        }
        else{
            var target = Game.getObjectById(creep.memory.task.target);
            var nonEmptyContainers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;}
            });

            if(target.structureType != STRUCTURE_CONTAINER && nonEmptyContainers.length > 0){
                var container = creep.pos.findClosestByPath(nonEmptyContainers);
                // TODO: Make this not hacky
                if(!container){
                    container = nonEmptyContainers[0];
                }
                creep.memory.subtask = {
                    action: "withdraw",
                    target: container.id
                }
            }
            else{
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if(source){
                    creep.memory.subtask = {
                        action: "harvest",
                        target: source.id
                    }
                }
                else{
                    // TODO: Figure something out to do
                    return;
                }
            }
        } 
    }

    var target = Game.getObjectById(creep.memory.subtask.target);
    if(creep.memory.subtask.action == "fill"){
        var err = creep.transfer(target, RESOURCE_ENERGY);
        if(err == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
        else if(err == ERR_FULL){
            finishTask(creep);
        }
        else if(err == ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.subtask = null;
            doFill(creep);
            return;
        }
    }
    else if(creep.memory.subtask.action == "withdraw"){
        var err = creep.withdraw(target, RESOURCE_ENERGY);
        if(err == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
        else if(err == ERR_FULL){
            creep.memory.subtask = null;
            doFill(creep);
            return;
        }
        else if(err == ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.subtask = null;
            doFill(creep);
            return;
        }
    }
    else if(creep.memory.subtask.action == "harvest"){
        var harvestCompleted = doHarvestSubTask(creep);
        if(harvestCompleted){
            doFill(creep);
        }
    }
}

function doUpgrade(creep){
    if(creep.memory.subtask == null){ 
        // If the creep has energy stored
        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
            creep.memory.subtask = {
                action: "upgrade",
                target: creep.memory.task.target
            }
        }
        else{
            var target = Game.getObjectById(creep.memory.task.target);
            var nonEmptyContainers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;}
            });

            if(target.structureType != STRUCTURE_CONTAINER && nonEmptyContainers.length > 0){
                var container = creep.pos.findClosestByPath(nonEmptyContainers);
                // TODO: Make this not hacky
                if(!container){
                    container = nonEmptyContainers[0];
                }
                creep.memory.subtask = {
                    action: "withdraw",
                    target: container.id
                }
            }
            else{
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if(source){
                    creep.memory.subtask = {
                        action: "harvest",
                        target: source.id
                    }
                }
                else{
                    // TODO: Figure something out to do
                    return;
                }
            }
        } 
    }

    var target = Game.getObjectById(creep.memory.subtask.target);
    if(creep.memory.subtask.action == "upgrade"){
        var err = creep.upgradeController(target);
        if(err == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
        // Finish task every time we run out so we
        // can pick up a new task
        else if(err == ERR_NOT_ENOUGH_RESOURCES){
            finishTask(creep);
        }
    }
    else if(creep.memory.subtask.action == "withdraw"){
        var err = creep.withdraw(target, RESOURCE_ENERGY);
        if(err == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
        else if(err == ERR_FULL){
            creep.memory.subtask = null;
            doUpgrade(creep);
            return;
        }
        else if(err == ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.subtask = null;
            doUpgrade(creep);
            return;
        }
    }
    else if(creep.memory.subtask.action == "harvest"){
        var harvestCompleted = doHarvestSubTask(creep);
        if(harvestCompleted){
            doUpgrade(creep);
        }
    }
}

function doRepair(creep){
    if(creep.memory.subtask == null){ 
        // If the creep has energy stored
        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
            creep.memory.subtask = {
                action: "repair",
                target: creep.memory.task.target
            }
        }
        else{
            var target = Game.getObjectById(creep.memory.task.target);
            var nonEmptyContainers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;}
            });

            if(target.structureType != STRUCTURE_CONTAINER && nonEmptyContainers.length > 0){
                var container = creep.pos.findClosestByPath(nonEmptyContainers);
                // TODO: Make this not hacky
                if(!container){
                    container = nonEmptyContainers[0];
                }
                creep.memory.subtask = {
                    action: "withdraw",
                    target: container.id
                }
            }
            else{
                var source = creep.pos.findClosestByPath(FIND_SOURCES);
                if(source){
                    creep.memory.subtask = {
                        action: "harvest",
                        target: source.id
                    }
                }
                else{
                    // TODO: Figure something out to do
                    return;
                }
            }
        } 
    }

    var target = Game.getObjectById(creep.memory.subtask.target);
    if(creep.memory.subtask.action == "repair"){
        if(target.hits == target.hitsMax){
            finishTask(creep);
        }
        var err = creep.repair(target);
        if(err == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
        else if(err == ERR_NOT_ENOUGH_RESOURCES){
            if(target.structureType == STRUCTURE_WALL && target.hits > 10000){
                finishTask(creep);
            }
            else{
                creep.memory.subtask = null;
                doRepair(creep);
                return;
            }
        }
    }
    else if(creep.memory.subtask.action == "withdraw"){
        var err = creep.withdraw(target, RESOURCE_ENERGY);
        if(err == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
        else if(err == ERR_FULL){
            creep.memory.subtask = null;
            doRepair(creep);
            return;
        }
        else if(err == ERR_NOT_ENOUGH_RESOURCES){
            creep.memory.subtask = null;
            doRepair(creep);
            return;
        }
    }
    else if(creep.memory.subtask.action == "harvest"){
        var harvestCompleted = doHarvestSubTask(creep);
        if(harvestCompleted){
            doRepair(creep);
        }
    }
}

function doDefend(creep){
    var enemies = creep.room.find(FIND_HOSTILE_CREEPS);
    if(enemies.length > 0){
        // TODO: Better target selection?
        var target = enemies[0];
        var err = creep.attack(target);
        if(err == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
    }
}

function doAttack(creep){
    var moveFlag = Game.flags["move"];
    var attackFlag = Game.flags["attack"];

    if(attackFlag){
        if(attackFlag.room == creep.room){
            var target = creep.room.lookForAt(LOOK_STRUCTURES, attackFlag.pos)[0];
            var err = creep.attack(target);
            if(err == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }
        }
        else{
            creep.moveTo(attackFlag);
        }
    }
    else if(moveFlag){
        creep.moveTo(moveFlag);
    }
}

function doClaim(creep){
    var claim_flag = Game.flags["claim"];

    if(claim_flag){
        if(claim_flag.room == creep.room){
            var err = creep.claimController(creep.room.controller);
            if(err == ERR_NOT_IN_RANGE){
                creep.moveTo(creep.room.controller);
            }
            if(creep.room.controller.my) {
               claim_flag.remove()
            }
        }
        else{
            creep.moveTo(claim_flag);
        }
    }
}

function doJob(creep){
    if(creep.memory.task != null){
        switch(creep.memory.task.action){
            case "build":
                doBuild(creep);
                break;
            case "fill":
                doFill(creep);
                break;
            case "upgrade":
                doUpgrade(creep);
                break;
            case "repair":
                doRepair(creep);
                break;
            case "defend":
                doDefend(creep);
                break;
            case "attack":
                doAttack(creep);
                break;
            case "claim":
                doClaim(creep);
                break;
            default:
                console.log(`Unimplemented job on creep ${creep.name}: "${creep.memory.task.action}"`)
        }
    }
}

module.exports = doJob
