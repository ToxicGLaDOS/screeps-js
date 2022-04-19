// *** THIS DOESN'T WORK RIGHT IN THE SIMULATION. IT LETS YOU BUILD WAY MORE EXTENSIONS THEN YOU SHOULD BE ABLE TO. BUT IT WORKS CORRECTLY IN THE REAL GAME ***

// Handles auto constructing buildings
function construct() {
	for (var spawn_name in Game.spawns) {
		var spawn = Game.spawns[spawn_name]
		var room = spawn['room']
		var controller = room.controller
		var controller_level = controller['level']
		var x = 1 
		var y = 1
		var dir = {'x': -1, 'y': 0}
		var err = room.createConstructionSite(spawn.pos.x + x, spawn.pos.y + y, STRUCTURE_EXTENSION);
		while (err != ERR_RCL_NOT_ENOUGH) {
			x += dir.x * 2
			y += dir.y * 2

			// If we're in the corner we started at this distance
			if (x == y && x > 0) {
				x += 1
				y += 1
			}
			
			err = room.createConstructionSite(spawn.pos.x + x, spawn.pos.y + y, STRUCTURE_EXTENSION);
			// If we're a corner change direction
			if (Math.abs(x) == Math.abs(y)) {
				dir = spiralDirection(dir)					
			}

			// Something has gone very wrong
			if (err == ERR_INVALID_ARGS){
				break;
			}
		}
	}
}

function spiralDirection(direction) {
	
	if (direction.x == -1 && direction.y == 0) {
		return {'x': 0, 'y': -1};
	}
	else if (direction.x == 0 && direction.y == -1) {
		return {'x': 1, 'y': 0};
	}
	else if (direction.x == 1 && direction.y == 0) {
		return {'x': 0, 'y': 1};
	}
	else if (direction.x == 0 && direction.y == 1) {
		return {'x': -1, 'y': 0};
	}
}

module.exports = construct
