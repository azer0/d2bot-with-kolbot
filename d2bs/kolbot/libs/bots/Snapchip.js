/**
*	@filename	Snapchip.js
*	@author		kolton
*	@desc		kill Snapchip and optionally clear Icy Cellar
*/

function Snapchip(Config, Attack, Pickit, Pather, Town, Misc) {
	Town();
	if (!me.journeyToPreset(119, 2, 397)) {
		throw new Error("Failed to move to Snapchip Shatter");
	}

	Attack.clear(15, 0, getLocaleString(22496)); // Snapchip Shatter

	if (Config.Snapchip.ClearIcyCellar) {
		Attack.clearLevel(Config.ClearType);
	}

	return true;
}