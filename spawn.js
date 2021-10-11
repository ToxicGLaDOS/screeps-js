function spawn() {
    var main_spawner = Game.spawns["Spawn0"];
    var main_room = main_spawner.room;
    if(Object.keys(Game.creeps).length < 3){
        var err = main_spawner.spawnCreep([MOVE, WORK, CARRY], "C" + parseInt(Math.floor(Math.random() * 10000)));
    }
    else if(Object.keys(Game.creeps).length < 10){
        var body = [];
        var energyCapacity = main_room.energyCapacityAvailable
        for(var i = 0; i < Math.floor(energyCapacity / 200); i++){ 
            body.push(MOVE);
            body.push(CARRY);
            body.push(WORK);
        }
        var err = main_spawner.spawnCreep(body, "C" + parseInt(Math.floor(Math.random() * 10000)));
    }
}

module.exports = spawn
