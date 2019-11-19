/**
*	@filename	UndergroundPassage.js
*	@author		loshmi
*	@desc		Move and clear Underground passage level 2
*/

function UndergroundPassage(Config, Attack, Pickit, Pather, Town, Misc) {
	Town();

	if (!Pather.journeyTo(14)) {
		throw new Error("Failed to move to Underground passage level 2");
	}

	Attack.clearLevel();
}