function isClaimer(creep, _index, _collection) {
    if (!creep.memory.task) {
        return false
    }
    return creep.memory.task.action == "claim"
}

function spawn() {
    // Found experimentally
    var HARVEST_PARTS_PER_SOURCE = 33;
    var num_sources = 0;
    for (var room_name in Game.rooms){
        var room = Game.rooms[room_name];
        num_sources += room.find(FIND_SOURCES).length;
    }
    var harvest_parts_wanted = num_sources * HARVEST_PARTS_PER_SOURCE;
    var num_harvest_parts = 0;
    for (var creep_name in Game.creeps){
        var creep = Game.creeps[creep_name];
        var works = creep.body.filter(x => x.type === WORK);

        num_harvest_parts += works.length;
    }
    var num_attackers = _.filter(Game.creeps, (creep) => creep.body.filter(part => part.type === ATTACK).length > 0).length;
    var greatest_rcl = _.sortBy(Game.spawns, spawn => -spawn.room.controller.level)[0].room.controller.level;
    //console.log(`Wanted harvest parts: ${harvest_parts_wanted}, Have: ${num_harvest_parts}`);

    for (var spawner_name in Game.spawns) {
        var spawner = Game.spawns[spawner_name];
        // Only spawn from spawners that are the highest level to get the best creeps
        // TODO: Base this on the best creep we can create, perhaps by counting extensions?
        if (spawner.room.controller.level == greatest_rcl) {
            var room = spawner.room;
            var energyCapacity = room.energyCapacityAvailable

            var enemies = room.find(FIND_HOSTILE_CREEPS);
            // Spawn the biggest guy we can
            if(enemies.length > 0){
                var bodypart_cost_sum = BODYPART_COST[TOUGH] + BODYPART_COST[MOVE] + BODYPART_COST[ATTACK];
                var energy_available = room.energyAvailable;
                var body = [];

                if (energy_available >= bodypart_cost_sum) {
                    var num_each_bodyparts = Math.floor(energy_available / bodypart_cost_sum);
                    for (var i = 0; i < num_each_bodyparts; i++) {
                        body.push(TOUGH);
                    }
                    for (var i = 0; i < num_each_bodyparts; i++) {
                        body.push(ATTACK);
                    }
                    for (var i = 0; i < num_each_bodyparts; i++) {
                        body.push(MOVE);
                    }
                    var err = spawner.spawnCreep(body, "C" + parseInt(Math.floor(Math.random() * 10000)));
                }
            }
            // Spawn the biggest guy we can once the room is full
            else if (Game.flags["attack"] != null && num_attackers == 0) {
                var bodypart_cost_sum = BODYPART_COST[TOUGH] + BODYPART_COST[MOVE] + BODYPART_COST[ATTACK];
                var body = [];

                var num_each_bodyparts = Math.floor(energyCapacity / bodypart_cost_sum);
                for (var i = 0; i < num_each_bodyparts; i++) {
                    body.push(TOUGH);
                }
                for (var i = 0; i < num_each_bodyparts; i++) {
                    body.push(ATTACK);
                }
                for (var i = 0; i < num_each_bodyparts; i++) {
                    body.push(MOVE);
                }
                var err = spawner.spawnCreep(body, "C" + parseInt(Math.floor(Math.random() * 10000)));
            }
            else if(Object.keys(Game.creeps).length < 3){
                var err = spawner.spawnCreep([MOVE, WORK, CARRY], "C" + parseInt(Math.floor(Math.random() * 10000)));
            }
            else if(num_harvest_parts < harvest_parts_wanted && Object.keys(Game.creeps).length < 20){
                var body = [];

                if (Game.flags["claim"] != null && energyCapacity > BODYPART_COST["claim"] + BODYPART_COST["move"]) {
                    if (!_.some(Game.creeps, isClaimer)) {
                        body.push(CLAIM);
                        body.push(MOVE);
                    }
                }
                else {
                    for(var i = 0; i < Math.floor(energyCapacity / (BODYPART_COST[MOVE] + BODYPART_COST[CARRY] + BODYPART_COST[WORK])); i++){
                        body.push(MOVE);
                        body.push(CARRY);
                        body.push(WORK);
                    }
                }

                var err = spawner.spawnCreep(body, "C" + parseInt(Math.floor(Math.random() * 10000)));
            }
        }

        var adjacent_creeps = spawner.pos.findInRange(FIND_MY_CREEPS, 1);
        if (adjacent_creeps.length > 0) {
            var creep = adjacent_creeps[0];
            var err = spawner.renewCreep(creep);
        }
    }
}

module.exports = spawn
