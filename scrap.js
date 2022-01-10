
function viewNext() {

	let next = null;
	let highPeri = Infinity;
	let localView = view;

	let lowPeri = 0; // in case view is sun
	let localFocus = mostMassiveBody; // in case view is sun
	if (localView !== mostMassiveBody) {
		lowPeri = body[localView].kepler.periapsis;
		localFocus = body[localView].focus;
	}

	let child = null;
	let lowOrbit = Infinity;

	let ignoreChildren = false;


	function getHigher() {
		for (let i = body.length - 1; i > 0; i--) { // skip sun
			// catch things orbiting what is being viewed
			if (body[i].focus === localView && body[i].kepler.periapsis < lowOrbit &&
				ignoreChildren === false) {
				child = i;
				lowOrbit = body[i].kepler.periapsis;
				next = null;
			}
			// check for things further out
			else if (child === null && body[i].focus === localFocus &&
				body[i].kepler.periapsis > lowPeri &&
				body[i].kepler.periapsis < highPeri) {
				highPeri = body[i].kepler.periapsis;
				next = i;
			}
		}
	}
	getHigher(localFocus);

	while (next === null) {
		if (child !== null) {
			// it is the lowest peri, but does it have children? reset and rerun
			localFocus = localView;
			localView = child;
			highPeri = Infinity;
			lowPeri = 0;
			child = null;
			lowOrbit = Infinity;
			getHigher();
		}
		// nothing is further out in this gravity area, so go to its parent system
		else if (localFocus !== mostMassiveBody) {
			localView = localFocus;
			lowPeri = body[localView].kepler.periapsis;
			localFocus = body[localFocus].focus;
			ignoreChildren = true;
			getHigher();
		} else {
			next = mostMassiveBody;
		}
	}

	view = next;
	viewFinalize();
}
