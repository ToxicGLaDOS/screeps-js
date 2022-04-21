function tower() {
	for (var room_name in Game.rooms) {
		var room = Game.rooms[room_name];
		for (var tower of room.find(FIND_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER }})) {
			var enemies = room.find(FIND_HOSTILE_CREEPS);
			if (enemies.length > 0) {
				var err = tower.attack(enemies[0]);
				console.log(`Error in tower: ${err}`);
			}
		}
	}
}

module.exports = tower;
