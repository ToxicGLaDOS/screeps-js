function isClaimer(creep, _index, _collection) {
    if (!creep.memory.task) {
        return false
    }
    return creep.memory.task.action == "claim"
}

function spawn() {
    var main_spawner = Game.spawns["Spawn0"];
    var main_room = main_spawner.room;
    if(Object.keys(Game.creeps).length < 3){
        var err = main_spawner.spawnCreep([MOVE, WORK, CARRY], "C" + parseInt(Math.floor(Math.random() * 10000)));
    }
    else if(Object.keys(Game.creeps).length < 13){
        var body = [];
        var energyCapacity = main_room.energyCapacityAvailable

        if (Game.flags["claim"] != null && energyCapacity > BODYPART_COST["claim"] + BODYPART_COST["move"]) {
            if (!_.some(Game.creeps, isClaimer)) {
                body.push(CLAIM);
                body.push(MOVE);
            }
        }
        else {
            for(var i = 0; i < Math.floor(energyCapacity / 200); i++){
                body.push(MOVE);
                body.push(CARRY);
                body.push(WORK);
            }
        }

        var err = main_spawner.spawnCreep(body, "C" + parseInt(Math.floor(Math.random() * 10000)));
    }
}

module.exports = spawn
