function isClaimer(creep, _index, _collection) {
    if (!creep.memory.task) {
        return false
    }
    return creep.memory.task.action == "claim"
}

function spawn() {
    for (var spawner_name in Game.spawns) {
        var spawner = Game.spawns[spawner_name];
        var room = spawner.room;

        var enemies = room.find(FIND_HOSTILE_CREEPS);
        if(enemies.length > 0){
            var err = spawner.spawnCreep([MOVE, MOVE, ATTACK, ATTACK], "C" + parseInt(Math.floor(Math.random() * 10000)));
        }
        else if(Object.keys(Game.creeps).length < 3){
            var err = spawner.spawnCreep([MOVE, WORK, CARRY], "C" + parseInt(Math.floor(Math.random() * 10000)));
        }
        else if(Object.keys(Game.creeps).length < 13){
            var body = [];
            var energyCapacity = room.energyCapacityAvailable

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

            var err = spawner.spawnCreep(body, "C" + parseInt(Math.floor(Math.random() * 10000)));
        }

        var adjacent_creeps = spawner.pos.findInRange(FIND_MY_CREEPS, 1);
        if (adjacent_creeps.length > 0) {
            var creep = adjacent_creeps[0];
            var err = spawner.renewCreep(creep);
        }
    }
}

module.exports = spawn
