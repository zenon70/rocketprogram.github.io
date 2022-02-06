"use strict";

////////////////////////////////////////////////////////////////////////////////
// get system positions
// using icrf-oriented vectors for each body relative to its parent,
// find its solar system barycenter vectors
/*
	requires:
		mostMassiveBody
		scale
		body [array]
			.cartes [icrf]
			.mesh.position [threejs vector3]
			.focus [integer]

	returns:
		.x positions
		.mesh.position.x positions
*/

function systemPosition() {
	// skip sun. order is important. increment to move focii before satellites
	for (let i = 1; i < body.length; i++) {

		// start with the current focus
		let focus = body[i].focus;

		// start with local coordinates 
		body[i].x = body[i].cartes.x;
		body[i].y = body[i].cartes.y;
		body[i].z = body[i].cartes.z;
		body[i].vx = body[i].cartes.vx;
		body[i].vy = body[i].cartes.vy;
		body[i].vz = body[i].cartes.vz;

		// recurse through foci (parents), adding values along the way
		let recurse = true;
		while (recurse) {
			// when the most massive body (i.e. sun) is reached, add that and exit
			if (focus === mostMassiveBody) {
				body[i].x += body[focus].x;
				body[i].y += body[focus].y;
				body[i].z += body[focus].z;
				body[i].vx += body[focus].vx;
				body[i].vy += body[focus].vy;
				body[i].vz += body[focus].vz;
				recurse = false;
			}
			else {
				// add cartesian values of the parent AKA focus body
				body[i].x += body[focus].cartes.x;
				body[i].y += body[focus].cartes.y;
				body[i].z += body[focus].cartes.z;
				body[i].vx += body[focus].cartes.vx;
				body[i].vy += body[focus].cartes.vy;
				body[i].vz += body[focus].cartes.vz;

				// traverse up one level to its parent
				focus = body[focus].focus;
			}
		}
		// dev5
		//if (body[i].onSurface !== true) {
			// apply the system coordinates for rendering
			body[i].mesh.position.x = body[i].x * scale;
			body[i].mesh.position.y = body[i].y * scale;
			body[i].mesh.position.z = body[i].z * scale;
		//}
	}
}


////////////////////////////////////////////////////////////////////////////////
// time

// max loop speed is 100x per second. slower depending on load and cpu speed
// 8 million times is relatively stable, though wobbly
// 16 million times will eject moons 401 and 402 in about a minute
let timestep = 0.01;
function showStep() {
	let state = "";
	if (running === false) {
		state = "paused";
	}
	document.getElementById("hudStep").innerHTML =
		/*Math.round(*/timestep * 100/*).toString()*/ + "<br>" + state;
}
function faster() {
	if (timestep < 80000) timestep *= 2;
	showStep();
}
function slower() {
	if (timestep > 0.000625) timestep /= 2;
	if (timestep < 0.000625) timestep = 0.000625;
	showStep();
}


////////////////////////////////////////////////////////////////////////////////
// rocket control (spin and thrust)

let spinPower = 0.1; // m/s²

// onscreen buttons
function up() {
	if (body[view].rcs === true) {
		body[view].xSpin += spinPower;
	}
	document.getElementById("hudPitch").innerHTML =
		Math.round(body[view].xSpin * 10) + "<br>pitch";
}
function down() {
	if (body[view].rcs === true) {
		body[view].xSpin -= spinPower;
	}
	document.getElementById("hudPitch").innerHTML =
		Math.round(body[view].xSpin * 10) + "<br>pitch";
}
function left() {
	if (body[view].rcs === true) {
		body[view].zSpin += spinPower;
	}
	document.getElementById("hudYaw").innerHTML =
		Math.round(- body[view].zSpin * 10) + "<br>yaw";
}
function right() {
	if (body[view].rcs === true) {
		body[view].zSpin -= spinPower;
	}
	document.getElementById("hudYaw").innerHTML =
		Math.round(- body[view].zSpin * 10) + "<br>yaw";
}
function rollLeft() {
	if (body[view].rcs === true) {
		body[view].ySpin -= spinPower;
	}
	document.getElementById("hudRoll").innerHTML =
		Math.round(body[view].ySpin * 10) + "<br>roll";
}
function rollRight() {
	if (body[view].rcs === true) {
		body[view].ySpin += spinPower;
	}
	document.getElementById("hudRoll").innerHTML =
		Math.round(body[view].ySpin * 10) + "<br>roll";
}
function stopSpin() {
	if (body[view].rcs === true) {
		body[view].xSpin = 0;
		body[view].ySpin = 0;
		body[view].zSpin = 0;
	}
	document.getElementById("hudPitch").innerHTML =
		Math.round(body[view].xSpin * 10) + "<br>pitch";
	document.getElementById("hudYaw").innerHTML =
		Math.round(- body[view].zSpin * 10) + "<br>yaw";
	document.getElementById("hudRoll").innerHTML =
		Math.round(body[view].ySpin * 10) + "<br>roll";
}


function throttleOn() {
	if (body[view].type === "Artificial") {
		body[view].throttleOn = true;
		throttleShow();
	}
}
document.getElementById("throttleAdjustContainer").style.visibility = "hidden";
function throttleAdjust() {
	if (document.getElementById("throttleAdjustContainer").style.visibility ===
		"hidden") {
		document.getElementById("throttleAdjustContainer").style.visibility =
			"visible";
	} else {
		document.getElementById("throttleAdjustContainer").style.visibility =
			"hidden";
	}
}


document.getElementById("throttleAdjustSlider").value = 100;
//document.getElementById("starlightOutput").innerHTML = "100%";
// Update the current slider value (each time you drag the slider handle)
document.getElementById("throttleAdjustSlider").oninput = function() {
	//document.getElementById("starlightOutput").innerHTML = this.value * 20 + "%";
	body[view].throttle = this.value;
	throttleShow();
};



function throttleOff() {
	if (body[view].type === "Artificial") {
		body[view].throttleOn = false;
		throttleShow();
	}
}
function throttleUp() {
	if (body[view].type === "Artificial") {
		if (body[view].throttle < 100) { body[view].throttle += 10; }
		throttleShow();
	}
}
function throttleDown() {
	if (body[view].type === "Artificial") {
		if (body[view].throttle > 0) { body[view].throttle -= 10; }
		throttleShow();
	}
}


// keys that will be used must be declared first
const keyState = {
	KeyE: null,
	KeyS: null,
	KeyD: null,
	KeyF: null,
	KeyW: null,
	KeyR: null,
	KeyQ: null,
	KeyA: null,
	KeyZ: null,
	KeyX: null,
	KeyV: null,
	KeyT: null,
	KeyG: null
};

// initialize last effective date of keypresses for repeat delay
const keyDelay = {
	KeyE: 0,
	KeyS: 0,
	KeyD: 0,
	KeyF: 0,
	KeyW: 0,
	KeyR: 0,
	KeyQ: 0,
	KeyA: 0,
	KeyZ: 0,
	KeyX: 0,
	KeyV: 0,
	KeyT: 0,
	KeyG: 0
};

let repeatDelay = 150;

// process keyboard input. 2nd true means use capture phase, not bubble phase
// it is undocumented why capture phase was chosen, could use code review
window.addEventListener("keydown", function(event) {
	keyState[event.code] = true;
}, true);
window.addEventListener("keyup", function(event) {
	keyState[event.code] = false;
	keyDelay[event.code] = 0;
}, true);

function rocketControl() {
	// e (pitch up)
	if (keyState.KeyE && Date.now() - keyDelay.KeyE > repeatDelay) {
		if (body[view].rcs === true) {
			body[view].xSpin += spinPower;
			keyDelay.KeyE = Date.now();
			document.getElementById("hudPitch").innerHTML =
				Math.round(body[view].xSpin * 10) + "<br>pitch";
		}
	}

	// s (yaw left)
	if (keyState.KeyS && Date.now() - keyDelay.KeyS > repeatDelay) {
		if (body[view].rcs === true) {
			body[view].zSpin += spinPower;
			keyDelay.KeyS = Date.now();
			document.getElementById("hudYaw").innerHTML =
				Math.round(- body[view].zSpin * 10) + "<br>yaw";
		}
	}

	// d (pitch down)
	if (keyState.KeyD && Date.now() - keyDelay.KeyD > repeatDelay) {
		if (body[view].rcs === true) {
			body[view].xSpin -= spinPower;
			keyDelay.KeyD = Date.now();
			document.getElementById("hudPitch").innerHTML =
				Math.round(body[view].xSpin * 10) + "<br>pitch";
		}
	}

	// f (yaw right)
	if (keyState.KeyF && Date.now() - keyDelay.KeyF > repeatDelay) {
		if (body[view].rcs === true) {
			body[view].zSpin -= spinPower;
			keyDelay.KeyF = Date.now();
			document.getElementById("hudYaw").innerHTML =
				Math.round(- body[view].zSpin * 10) + "<br>yaw";
		}
	}

	// w (roll left)
	if (keyState.KeyW && Date.now() - keyDelay.KeyW > repeatDelay) {
		if (body[view].rcs === true) {
			body[view].ySpin -= spinPower;
			keyDelay.KeyW = Date.now();
			document.getElementById("hudRoll").innerHTML =
				Math.round(body[view].ySpin * 10) + "<br>roll";
		}
	}

	// r (roll right)
	if (keyState.KeyR && Date.now() - keyDelay.KeyR > repeatDelay) {
		if (body[view].rcs === true) {
			body[view].ySpin += spinPower;
			keyDelay.KeyR = Date.now();
			document.getElementById("hudRoll").innerHTML =
				Math.round(body[view].ySpin * 10) + "<br>roll";
		}
	}

	// freeze all spin and thrust
	if (keyState.KeyQ && Date.now() - keyDelay.KeyQ > repeatDelay) {
		if (body[view].rcs === true) {
			body[view].xSpin = 0;
			body[view].ySpin = 0;
			body[view].zSpin = 0;
			keyDelay.KeyQ = Date.now();
			document.getElementById("hudPitch").innerHTML =
				Math.round(body[view].xSpin * 10) + "<br>pitch";
			document.getElementById("hudYaw").innerHTML =
				Math.round(- body[view].zSpin * 10) + "<br>yaw";
			document.getElementById("hudRoll").innerHTML =
				Math.round(body[view].ySpin * 10) + "<br>roll";
		}
	}

	if (keyState.KeyA && Date.now() - keyDelay.KeyA > repeatDelay) {
		if (body[view].type === "Artificial") {
			throttleUp();
			keyDelay.KeyA = Date.now();
			throttleShow();
		}
	}
	if (keyState.KeyZ && Date.now() - keyDelay.KeyZ > repeatDelay) {
		if (body[view].type === "Artificial") {
			throttleDown();
			keyDelay.KeyZ = Date.now();
			throttleShow();
		}
	}
	if (keyState.KeyX && Date.now() - keyDelay.KeyX > repeatDelay) {
		if (body[view].type === "Artificial") {
			throttleOff();
			keyDelay.KeyX = Date.now();
			throttleShow();
		}
	}

	if (keyState.KeyV && Date.now() - keyDelay.KeyV > repeatDelay) {
		viewNext();
		keyDelay.KeyV = Date.now();
	}

	if (keyState.KeyT && Date.now() - keyDelay.KeyT > repeatDelay) {
		faster();
		keyDelay.KeyT = Date.now();
	}
	if (keyState.KeyG && Date.now() - keyDelay.KeyG > repeatDelay) {
		slower();
		keyDelay.KeyG = Date.now();
	}

	// rotate rocket(s)
	for (let i = body.length - 1; i > -1; i--) {
		if (body[i].type === "Artificial") {

			if (body[i].missionTime !== undefined) {
				body[i].missionTime += timestep;
			}

			body[i].mesh.rotateX(body[i].xSpin * timestep);
			body[i].mesh.rotateY(body[i].ySpin * timestep);
			body[i].mesh.rotateZ(body[i].zSpin * timestep);

			// process thrust
			if (body[i].fuelMass > 0 && body[i].throttleOn && body[i].throttle > 0) {
				// update the direction vector of rocket
				body[i].pointingM4.extractRotation(body[i].mesh.matrix);
				// get unit vector of direction
				body[i].pointingV3 =
					body[i].mesh.up.clone().applyMatrix4(body[i].pointingM4);

				let airPressure = 0; // Pascals
				// get current air pressure
				if (body[i].focus === earth) {
					if (body[i].gps.alt < 86000) {
						let airData = earthAirData(body[i].gps.alt);
						airPressure = airData.airPressure;
					}
				}

				// decrease mass by fuel used, and reduce fuel amount
				const fuelMassPerSecond = body[i].fuelMass / body[i].burnTime;

				let fuelUse = 1;
				if (body[i].fuelMass - (fuelMassPerSecond * body[i].throttle / 100 *
					timestep) < 0) {
					// get ratio
					fuelUse = body[i].fuelMass / (fuelMassPerSecond *
						body[i].throttle / 100 * timestep);
					body[i].fuelMass = 0;
					body[i].burnTime = 0;
				} else {
					body[i].fuelMass -= fuelMassPerSecond * body[i].throttle / 100 *
						timestep;
					body[i].burnTime -= body[i].throttle / 100 * timestep;
				}
				body[i].mass -= fuelMassPerSecond * body[i].throttle/100 * timestep *
					fuelUse;

				const thrustAccel = (body[i].thrustVac - (airPressure *
					(body[i].thrustVac - body[i].thrustSea) / 101325))
					/ body[i].mass * fuelUse;

				// apply thrust according to direction the rocket is pointing
				body[i].vx += body[i].pointingV3.x * body[i].throttle / 100 *
					thrustAccel * timestep;
				body[i].vy += body[i].pointingV3.y * body[i].throttle / 100 *
					thrustAccel * timestep;
				body[i].vz += body[i].pointingV3.z * body[i].throttle / 100 *
					thrustAccel * timestep;
/*
				if (i === view) {
					document.getElementById("hudFuel").innerHTML =
						body[i].fuelMass.toFixed(0) + "<br>kg fuel";
				}
*/
				body[i].onSurface = false;

				// dev5
				//body[i].mesh.removeFromParent();

				if (body[i].missionTime === undefined) {
					body[i].missionTime = 0;
				}
			} // end process thrust
		} // end Artificial
	} // end for loop
}




//document.getElementById("refuel").disabled = true;
function refuel() {
	// is rocket, doesn't have stage 2, didn't have stage 2, then it is stage 2
	// and is out of fuel...
	if (body[view].type === "Artificial" && !body[view].stage2 &&
		body[view].stage2 !== null && body[view].fuelMass === 0 &&
		body[view].mass !== 100) {
		body[view].mass += 92670;
		body[view].fuelMass += 92670;
		body[view].burnTime += 397;
		if (body[view].refuelCount) {
			body[view].refuelCount++;
		} else {
			body[view].refuelCount = 1;
		}
	}
	// if it has or had stage 2, then it is stage 1
	if (body[view].type === "Artificial" &&
		(body[view].stage2 || body[view].stage2 === null) &&
		body[view].fuelMass === 0) {
		body[view].mass += 411000;
		body[view].fuelMass += 411000;
		body[view].burnTime += 162;
		if (body[view].refuelCount) {
			body[view].refuelCount++;
		} else {
			body[view].refuelCount = 1;
		}
	}
}



////////////////////////////////////////////////////////////////////////////////
// nbody physics
// calculate all nbody forces at a point in time, and update velocities
// Euler-Cromer method AKA Symplectic Euler (almost identical to leapfrog)
/*
	requires:
		body [array]
			x, y, z, vx, vy, vz, mass [meters, m/s, kg]
		GRAVITY [universal constant]
		timestep [seconds]

	returns:
		body [array]
			focusForce, focus, distanceX, distanceY, distanceZ, distance
*/
//let currentFocus = body[8].focus;
//let debugLog = 0;

const GRAVITY = 6.67408e-11; // mohr 2016

function nBodyVelocity(/*body, GRAVITY, timestep*/) {
	for (let i = body.length - 1; i > -1; i--) {

		// initialize most influential gravity value
		body[i].focusForce = 0;
		body[i].focusDistance = 1;

		for (let j = body.length - 1; j > -1; j--) {
			if (i === j) continue;

			// avoid issues with fairings etc.
			if (body[j].type === "Artificial") {
				continue;
			}

			// compare system positions (not local positions)
			let distanceX = body[j].x - body[i].x;
			let distanceY = body[j].y - body[i].y;
			let distanceZ = body[j].z - body[i].z;
			let distance = Math.hypot(distanceX, distanceY, distanceZ);

			// avoid division by zero
			if (distance === 0) continue;

			// newton's law of universal gravitation, but only in one direction
			//let force = GRAVITY * (body[j].mass / (distance * distance));
			let force = body[j].gm / (distance * distance);

			/* dangerous with nbody physics if anything is ejected
			// do NOT dynamically re-assign these objects. just update.
			if (body[i].type === "Natural") {
				if (j === body[i].focus) {
					body[i].focusForce = force;
					body[i].focusDistanceX = distanceX;
					body[i].focusDistanceY = distanceY;
					body[i].focusDistanceZ = distanceZ;
					body[i].focusDistance = distance;
				}
			}
			*/

			// save the most influential object (overwritten until found)
			if (force / distance > body[i].focusForce / body[i].focusDistance &&
				body[j].mass > body[i].mass) {

				body[i].focusForce = force;
				body[i].focus = j;
				body[i].focusDistanceX = distanceX;
				body[i].focusDistanceY = distanceY;
				body[i].focusDistanceZ = distanceZ;
				body[i].focusDistance = distance;
			}

			// update system velocity
			body[i].vx += force * (distanceX / distance) * timestep;
			body[i].vy += force * (distanceY / distance) * timestep;
			body[i].vz += force * (distanceZ / distance) * timestep;
		}
	}

	/*
	// debug stuff
	if (body[8].focus !== currentFocus) {
		debugLog = 0;
		currentFocus = body[8].focus;
	}
	if (debugLog < 3) {
		debugLog++;
		console.log("debugLog: " + debugLog + ", focus: " + body[8].focus,
			body[8].x +", "+ body[8].y +", "+ body[8].z);
	}
	*/
	//return body;
}




////////////////////////////////////////////////////////////////////////////////
// keplerian physics
// compute local position, subtract greatest force (use it through
// kepler's 2-body equations). tilt from icrf to "eci" body frame,
// convert to elements, increment time, add j2, convert to vectors using
// kepler's equation, get ecef, and untilt
/*
	depends:
		icrfToEci()
		eciToIcrf()
		toKepler()
		toCartes()
		nodalPrecession()
		eciToEcef()
		...

	requires:
		body [array]
			cartes, focus, distanceXYZ..., focusForce, mass...
		timestep
		mostMassiveBody
		...

	returns:
		cartes [icrf] (computes cartes eci but doesn't save it)
		kepler [eci]
		ecef
		surfacePeriapsis
		...

*/

// calculate keplerian orbit, update local positions
function keplerPosition() {
	// skip sun. order is important. natural body spin before satellites.
	for (let i = 1; i < body.length; i++) {

		// prepare
		const focus = body[i].focus;

		// get new local vectors (icrf)
		body[i].cartes.x = -body[i].focusDistanceX;
		body[i].cartes.y = -body[i].focusDistanceY;
		body[i].cartes.z = -body[i].focusDistanceZ;
		body[i].cartes.vx = body[i].vx - body[focus].vx;
		body[i].cartes.vy = body[i].vy - body[focus].vy;
		body[i].cartes.vz = body[i].vz - body[focus].vz;

////////////////////////////////////////////////////////////////////////////////
// compute new position using kepler's equation (change meanAnom)

		// subtract gravity of parent. the keplerian orbit will add this.
		body[i].cartes.vx -= body[i].focusForce *
			(body[i].focusDistanceX / body[i].focusDistance) * timestep;
		body[i].cartes.vy -= body[i].focusForce *
			(body[i].focusDistanceY / body[i].focusDistance) * timestep;
		body[i].cartes.vz -= body[i].focusForce *
			(body[i].focusDistanceZ / body[i].focusDistance) * timestep;

		// tilt the orbit to match parent body frame (axial tilt)
		body[i].cartesEci = icrfToEci(body[i].cartes, body[focus].rightAscension,
			body[focus].declination);
/*
body[i].testCartesEci = {
	x: body[i].cartesEci.x,
	y: body[i].cartesEci.y,
	z: body[i].cartesEci.z,
	vx: body[i].cartesEci.vx,
	vy: body[i].cartesEci.vy,
	vz: body[i].cartesEci.vz
}
*/
		// use the updated vectors and mu to get keplerian elements
		body[i].kepler = toKepler(body[i].cartesEci, body[focus].gm);
/*
body[i].testKepler = {
	a: body[i].kepler.a,
	e: body[i].kepler.e,
	i: body[i].kepler.i,
	lan: body[i].kepler.lan,
	w: body[i].kepler.w,
	M: body[i].kepler.M,
}

if (i === 13) {
console.log(body[i].testCartesEci);
console.log(body[i].testKepler);
}
*/
		if (!body[i].onSurface) {
			// increment position (this code IS compatible with hyperbolic)
			// add to mean anomaly (rene schwarz method). units in seconds
			body[i].kepler.meanAnom += timestep *
				Math.sqrt(body[focus].gm / Math.abs(body[i].kepler.a)**3);
			//body[i].kepler.eAnom = null;
			//body[i].kepler.truAnom = null;

			// keep meanAnom within range BUT ONLY FOR ELLIPSES (CLOSED ORBITS)
			if (body[i].kepler.e < 1) {
				body[i].kepler.meanAnom %= 2 * Math.PI;
			}

			// add J2 zonal harmonic nodal precession (oblate spheroid gravity)
			if (body[i].kepler.periapsis - body[focus].radiusPole > 0
				//&& body[i].kepler.e < 1
				) {
				body[i].nodal = nodalPrecession(body[i].kepler, body[focus].gm,
					body[focus].J2, body[focus].radiusEquator);
				body[i].kepler.lan += body[i].nodal.lanRate * timestep;
				body[i].kepler.w += body[i].nodal.wRate * timestep;
			}
		}

/*
		// calculate circularVelocity
		//...

		// catch near zero velocity, use nbody position instead
		if (body[i].kepler.e > 0.99999 && body[i].kepler.v < circularVelocity) {
			nBodyPosition(i);
		}
*/


		// use the new keplerian elements to get new vectors
		body[i].cartesEci = toCartes(body[i].kepler, body[focus].gm);


////////////////////////////////////////////////////////////////////////////////
// symplectic euler method

/*
//function nBodyPosition() {
	//for (let i = body.length -1; i > -1; i--) {
		body[i].cartes.x += body[i].cartes.vx * timestep;
		body[i].cartes.y += body[i].cartes.vy * timestep;
		body[i].cartes.z += body[i].cartes.vz * timestep;

		body[i].cartesEci = icrfToEci(body[i].cartes, body[focus].rightAscension,
			body[focus].declination);

		// get new kepler from cartes
		body[i].kepler = toKepler(body[i].cartesEci, body[focus].gm);
//	}
//}
*/

////////////////////////////////////////////////////////////////////////////////

		/*
		// what if it is a focus when ejected? potential bug
		if (body[i].cartesEci.iterations === body[i].cartesEci.maxIterations) {
			console.log(body[i].name + " is being ejected.");
			body.splice(i);
			continue;
		}
		*/

		// error checking
		// what if it is a focus when ejected? potential bug
		{
			if (isNaN(body[i].cartesEci.x) ||
					isNaN(body[i].cartesEci.y) ||
					isNaN(body[i].cartesEci.z) ||
					isNaN(body[i].cartesEci.vx) ||
					isNaN(body[i].cartesEci.vy) ||
					isNaN(body[i].cartesEci.vz)) {
				console.log("NaN coordinate for object: " + i + ", name: " +
					body[i].name + ". No longer tracking.");
				console.log(body[i]);
				performRecycle(i);
				continue;
			}
		}

		// celestial body rotations
		if (body[i].type === "Natural") {
			//if (body[i].tidallyLocked !== true) {
			body[i].mesh.rotateY(body[i].angularVelocity * timestep);
			body[i].spun += body[i].angularVelocity * timestep;
			if (i === earth) {
				body[i].clouds.rotateY(body[i].angularVelocity * timestep / 12);
			}

			//} else {
			if (body[i].tidallyLocked === true) {

				// dev4
				// get moon facing direction as vector (prime meridian)
				// works despite being off a few degrees south from oblate scaling,
				// because normal vector is used and ignores irrelevent angle
				// uncomment the unscale/rescale code if there are issues
				let prime = new THREE.Vector3();
				//body[i].mesh.scale.set(1, 1, 1);
				body[i].mesh.rotateY(Math.PI/2);
				body[i].mesh.getWorldDirection(prime);
				body[i].mesh.rotateY(-Math.PI/2);
				//body[i].mesh.scale.y = body[i].radiusPole / body[i].radiusEquator;
				//if (body[i].radiusWest !== undefined) {
				//	body[i].mesh.scale.z = body[i].radiusWest / body[i].radiusEquator;
				//}
				// convert to eci
				let primeEci = icrfToEci(prime, body[focus].rightAscension,
					body[focus].declination);


				// get normal: relative to orbital plane AND simply the y-axis of moon
				let pole = new THREE.Vector3();
				body[i].mesh.rotateX(-Math.PI/2);
				body[i].mesh.getWorldDirection(pole);
				body[i].mesh.rotateX(Math.PI/2);
				// convert to eci
				let poleEci = icrfToEci(pole, body[focus].rightAscension,
					body[focus].declination);


				// dot product, to get angle
				let dot = primeEci.x * - body[i].cartesEci.x +
					primeEci.y * - body[i].cartesEci.y +
					primeEci.z * - body[i].cartesEci.z;

				// determinant, for >180 deg movement within orbit
				let det =
					primeEci.x * - body[i].cartesEci.y * poleEci.z +
					primeEci.z * - body[i].cartesEci.x * poleEci.y +
					primeEci.y * - body[i].cartesEci.z * poleEci.x -
					primeEci.z * - body[i].cartesEci.y * poleEci.x -
					primeEci.x * - body[i].cartesEci.z * poleEci.y -
					primeEci.y * - body[i].cartesEci.x * poleEci.z;
				let angle = Math.atan2(det, dot);


				if (body[i].lonLibrationAngle === undefined) {
					body[i].lonLibrationAngle = angle;
					//body[i].angleMax = 0;
				}
				const oscillationVelocity = body[i].lonLibrationAngle - angle;

				// experimental tidal locking formula
				// add velocity to correct angle, minus damping
				body[i].angularVelocity += angle/1e10 - oscillationVelocity/1e8;

				body[i].lonLibrationAngle = angle;

/*
				// save max angle to display for dev purposes
				const deg1 = 1 * Math.PI/180
				const angleAbs = Math.abs(angle);
				if (angleAbs < deg1) {
					body[i].angleMax = 0;
				}
				if (angleAbs > Math.abs(body[i].angleMax)) {
					body[i].angleMax = angle;
				}
*/

/*
				// always face parent exactly. unrealistic, but do this for now
				if (angle < 0) {
					angle += Math.PI * 2;
				}
				body[i].mesh.rotateY(angle);
				body[i].spun += angle;
*/



			}
			body[i].spun %= 2 * Math.PI;
		} else {
			// get Earth-Centered-Earth-Fixed and GPS coordinates
			if (!body[i].onSurface) {
				body[i].ecef = eciToEcef(body[i].cartesEci, body[focus].spun,
					body[focus].angularVelocity, body[focus].radiusEquator,
					body[focus].e2);
				body[i].gps = ecefToGps(body[i].ecef, body[focus].radiusEquator,
					body[focus].e2);

				// obstruction of ground eliminates velocity
				// offset due to origin currently being in the center of stage 1
				//if (body[i].gps.alt < 20) {
				if (body[i].gps.alt < 0) {
					body[i].ecef.vx = 0;
					body[i].ecef.vy = 0;
					body[i].ecef.vz = 0;
					body[i].xSpin = 0;
					body[i].ySpin = 0;
					body[i].zSpin = 0;
					body[i].onSurface = true;

					// dev5
					//body[focus].mesh.attach(body[i].mesh);
				}
			}

			if (body[i].onSurface) {
				// use ecef to move with surface
				body[i].cartesEci = ecefToEci(body[i].ecef,
					body[focus].spun,
					body[focus].angularVelocity, body[focus].radiusEquator,
					body[focus].e2);

			// process drag
			// must have density & scale at minimum, but these are actually not used
			// for processing earth drag due to better formula for earth
			} else if (body[focus].surfaceAirDensity !== undefined &&
						body[focus].scaleHeight !== undefined) {

				let density = 1.225; // earth air density at MSL
				if (focus === earth) {
					if (body[i].gps.alt < 86000) {
						let airData = earthAirData(body[i].gps.alt);
						density = airData.airDensity;
					} else {
						density = earthAtmosphere(body[i].gps.alt);
					}
				} else {
					// process rough estimate of foreign planet/moon drag
					density = isothermalAirDensity(
						body[focus].surfaceAirDensity,
						body[focus].scaleHeight,
						body[i].gps.alt);
				}

				let velocity = Math.hypot(body[i].ecef.vx, body[i].ecef.vy,
					body[i].ecef.vz);
/*
				// this should be specific to spacecraft
				// do this for now
				let dragCoefficient = 0.5; // drag coefficient for a cone
				if (body[i].gps.alt > 100000) {
					dragCoefficient = 2.2; // cubesat standard coefficient
					//dragCoefficient = 0.75; // irregular sphere est. for sputnik 1
				}
*/
				body[i].drag = dragEquation(density, velocity, body[i].mass,
					body[i].dragCoefficient, body[i].dragArea);

				// get prograde vector from velocity
				body[i].ecef.prograde = new THREE.Vector3(
					body[i].ecef.vx,
					body[i].ecef.vy,
					body[i].ecef.vz);
				body[i].ecef.prograde.normalize();

				// prepare for safety checks (could be optimized)
				let vxSign = Math.sign(body[i].ecef.vx);
				let vySign = Math.sign(body[i].ecef.vy);
				let vzSign = Math.sign(body[i].ecef.vz);
				let vxDrag = 
					-body[i].ecef.prograde.x * body[i].drag * timestep;
				let vyDrag = 
					-body[i].ecef.prograde.y * body[i].drag * timestep;
				let vzDrag = 
					-body[i].ecef.prograde.z * body[i].drag * timestep;

				// if adding drag results in the same direction, apply it
				if (Math.sign(body[i].ecef.vx + vxDrag) === vxSign) {
					// apply drag. negative prograde is retrograde.
					body[i].ecef.vx +=
						-body[i].ecef.prograde.x * body[i].drag * timestep;
					// if it results in going backwards (an issue with timestepping
					// and/or super fast drag calculated on a 0 or negative altitude),
					// then just zero the velocity instead
				} else {
					body[i].ecef.vx = 0;
				}

				// repeat for y and z
				if (Math.sign(body[i].ecef.vy + vyDrag) === vySign) {
					body[i].ecef.vy +=
						-body[i].ecef.prograde.y * body[i].drag * timestep;
				} else {
					body[i].ecef.vy = 0;
				}
				if (Math.sign(body[i].ecef.vz + vzDrag) === vzSign) {
					body[i].ecef.vz +=
						-body[i].ecef.prograde.z * body[i].drag * timestep;
				} else {
					body[i].ecef.vz = 0;
				}
				// independent safety checks on all 3 vectors, instead of checking
				// final prograde direction, may have an issue, or may be better

				// send info back up the chain
				body[i].cartesEci = ecefToEci(body[i].ecef,
				body[focus].spun,
				body[focus].angularVelocity, body[focus].radiusEquator,
				body[focus].e2);
			} // end process drag
		} // end body[i].type === Artificial


		// tilt back, to match icrf frame
		body[i].cartes = eciToIcrf(body[i].cartesEci,
			body[focus].rightAscension, body[focus].declination);

	} // end for loop
}




////////////////////////////////////////////////////////////////////////////////
// path drawing functions

// draw: body index requiring .kepler elements (i.e. body[i].kepler)
// shade: color in hex format (i.e. 0xff0000 for red), only used on first run
// scale: meters to render scale
function drawEllipse(draw, shade, scale) {

	// just get i, lan, and w from icrf. a and e are the same as eci.
	const focus = body[draw].focus;
	let kepi = toKepi(body[draw].cartes, body[focus].gm);

	// use absolute for safety in case of hyperbola
	const a = Math.abs(body[draw].kepler.a) * scale;
	const e = body[draw].kepler.e;
	const i = kepi.i;
	const lan = kepi.lan;
	const w = kepi.w;

	const b = a * Math.sqrt(1 - e*e);
	const c = -Math.sqrt(a*a - b*b);

	const curve = new THREE.EllipseCurve(
		c, 0,                  // aX, aY (center of rotation)
		a, b,                  // xRadius, yRadius
		0, 2 * Math.PI,        // aStartAngle, aEndAngle
		false,                 // aClockwise
		0                      // aRotation
	);

	const points = curve.getPoints(500);

	if (body[draw].ellipse === undefined) {

		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineBasicMaterial({ color: shade });
		body[draw].ellipse = new THREE.Line(geometry, material);

		// prevent clipping
		body[draw].ellipse.frustumCulled = false;

		scene.add(body[draw].ellipse);

	}

	body[draw].ellipse.geometry.dispose();
	body[draw].ellipse.geometry = new
		THREE.BufferGeometry().setFromPoints(points);

	body[draw].ellipse.rotation.set(0, 0, 0);

	body[draw].ellipse.rotation.x -= Math.PI / 2;
	body[draw].ellipse.rotation.y -= lan;
	body[draw].ellipse.rotateX(i);
	body[draw].ellipse.rotateY(-w);
	body[draw].ellipse.rotateX(Math.PI / 2);

	// dev5
	//body[draw].ellipse.position.copy(body[focus].mesh.position);
	body[draw].ellipse.position.x = body[focus].x * scale;
	body[draw].ellipse.position.y = body[focus].y * scale;
	body[draw].ellipse.position.z = body[focus].z * scale;
}


////////////////////////////////////////////////////////////////////////////////
// display data on-screen


document.getElementById("eclipticPlane").checked = true;
let reportPlane = "ecliptic";

function setPlane(value) {
	switch (value) {
		case "ecliptic":
			reportPlane = "ecliptic";
			break;
		case "body":
			reportPlane = "body";
			break;
		case "invariable":
			reportPlane = "invariable";
			break;
		case "galactic":
			reportPlane = "galactic";
			break;
		case "icrf":
			reportPlane = "icrf";
			break;
		default:
			reportPlane = "ecliptic";
	}
}

// save DOM variables for efficiency
const hudDateOrbit = document.getElementById("hudDateOrbit");
const hudGpsInfo = document.getElementById("hudGpsInfo");
const hudView = document.getElementById("hudView");

let verbose = false;
document.querySelector("#toggleHud").checked = false;
function toggleHud() {
	if (verbose === false) {
		hudDateOrbit.style.height = "142px";
		hudGpsInfo.style.height = "142px";
		hudDateOrbit.style.visibility = "visible";
		hudGpsInfo.style.visibility = "visible";
		verbose = true;
		displayText();
	} else {
		hudDateOrbit.style.height = "36px";
		hudGpsInfo.style.height = "36px";
		verbose = false;
		displayText();
	}
}

function simpleHud() {
	if (body[view].type !== "Artificial") {
		hudDateOrbit.style.visibility = "hidden";
		hudGpsInfo.style.visibility = "hidden";
		return;
	}
	hudDateOrbit.style.visibility = "visible";
	hudGpsInfo.style.visibility = "visible";
	let vFocus = body[view].focus;
	// show mission time
	hudDateOrbit.innerHTML =
	"T+ " + secondsToYears(body[view].missionTime) +
	"<br>Apoapsis  " + ((body[view].kepler.apoapsis -
		body[vFocus].radiusEquator)
		/ 1000).toFixed(3) + " km" +
	"<br>Periapsis " + ((body[view].kepler.periapsis -
		body[vFocus].radiusEquator) / 1000).toFixed(3) + " km";

	hudGpsInfo.innerHTML =
		"Altitude " + (body[view].gps.alt / 1000).toFixed(1) + " km" +
		"<br>Speed    " + (Math.hypot(body[view].ecef.vx, body[view].ecef.vy,
			body[view].ecef.vz) * 3.6).toFixed(0) + " km/h" +
		"<br>Fuel     " + body[view].fuelMass.toFixed(0) + " kg";
}


function displayText() {

	if (verbose === false) {
		simpleHud();
		return;
	}

	let vFocus = body[view].focus;

	if (view === mostMassiveBody) {
		hudDateOrbit.innerHTML =
			body.date.toISOString() +
			"<br>r " +
			(Math.hypot(body[view].x, body[view].y, body[view].z) / 1000).
			toFixed(3) + " km" +
			"<br>x " + (body[view].x / 1000).toFixed(3) + " km" +
			"<br>y " + (body[view].y / 1000).toFixed(3) + " km" +
			"<br>z " + (body[view].z / 1000).toFixed(3) + " km" +
			"<br>vx " + (body[view].vx / 1000).toFixed(3) + " km/s" +
			"<br>vy " + (body[view].vy / 1000).toFixed(3) + " km/s" +
			"<br>vz " + (body[view].vz / 1000).toFixed(3) + " km/s" +
			"<br>v " +
			(Math.hypot(body[view].vx, body[view].vy, body[view].vz) /
			1000).toFixed(3) + " km/s";
	} else {
		let keplerShow;
		if (body[view].focus === 0 && reportPlane !== "body") {
			// get elements in ecliptic etc frame, just for reporting data to user
			if (reportPlane === "ecliptic") {
				const cartesAltPlane = icrfToEci(body[view].cartes,
				// RA 270 * Math.PI / 180 = 4.71238898038469
					4.71238898038469,
				// DEC 90 - 23.43929 = 66.56071, * Math.PI / 180 = 1.161703541965115
					1.161703541965115);
				keplerShow = toKepler(cartesAltPlane, body[vFocus].gm);
			} else if (reportPlane === "icrf") {
				// currently in icrf frame
				keplerShow = toKepler(body[view].cartes, body[vFocus].gm);
			} else if (reportPlane === "galactic") {
				const cartesAltPlane = icrfToEci(body[view].cartes,
					0.38147085502186906, // 21.85667 deg
					0.4735078260660616); // 27.13 deg
				keplerShow = toKepler(cartesAltPlane, body[vFocus].gm);
			} else { // invariable
				const cartesAltPlane = icrfToEci(body[view].cartes,
					4.779584156586472, // 273.85 deg
					1.1691960659110012); // 66.99 deg
				keplerShow = toKepler(cartesAltPlane, body[vFocus].gm);
			}
		} else {
			keplerShow = body[view].kepler;
		}
		hudDateOrbit.innerHTML =
			body.date.toISOString() +
			"<br>period " + secondsToYears(
				2*Math.PI / Math.sqrt(body[vFocus].gm) * keplerShow.a**(3/2)) +
			"<br>a " + (keplerShow.a / 1000)/*.toFixed(3)*/ + " km" +
			"<br>e " + (keplerShow.e)/*.toFixed(9)*/ +
			"<br>i " + (keplerShow.i * 180 / Math.PI)/*.toFixed(7)*/ + "°" +
			"<br>Ω " + (keplerShow.lan * 180 / Math.PI)/*.toFixed(5)*/ + "°" +
			"<br>ω " + (keplerShow.w * 180 / Math.PI)/*.toFixed(7)*/ + "°" +
			"<br>M " + (keplerShow.meanAnom * 180 / Math.PI)/*.toFixed(5)*/ + "°" +
			"<br>v<sub>o</sub> " + (keplerShow.v * 3.6)/*.toFixed(0)*/ + " km/h" +
			"<br>Ap " + (keplerShow.apoapsis / 1000)/*.toFixed(3)*/ + " km" +
			"<br>Pe " + (keplerShow.periapsis / 1000)/*.toFixed(3)*/ + " km";
	}

	if (body[view].type === "Artificial") {
		hudGpsInfo.innerHTML =
			"Alt " + (body[view].gps.alt / 1000).toFixed(9) + " km" +
			"<br>vel<sub>s</sub> " + (Math.hypot(body[view].ecef.vx, body[view].ecef.vy,
				body[view].ecef.vz) * 3.6).toFixed(6) + " km/h" +
			"<br>drag " + body[view].drag.toExponential(2) + " m/s²" +
			"<br>Mass " + body[view].mass.toExponential(3) + " kg" +
			"<br>Lat " + (body[view].gps.lat * 180 / Math.PI).toFixed(6) + "°" +
			"<br>Lon " + (body[view].gps.lon * 180 / Math.PI).toFixed(6) + "°" +
			"<br>Ap<sub>Eq</sub> " + ((body[view].kepler.apoapsis -
				body[vFocus].radiusEquator)
				/ 1000).toFixed(3) + " km" +
			"<br>Pe<sub>Eq</sub> " + ((body[view].kepler.periapsis -
				body[vFocus].radiusEquator) / 1000).toFixed(3) + " km" +
			"<br>Fuel " + body[view].fuelMass.toFixed(3) + " kg";
		if (body[view].s1refuelCount) {
			hudGpsInfo.innerHTML +=
				"<br>s1 refueled: " + body[view].s1refuelCount;
		}
		if (body[view].refuelCount) {
			hudGpsInfo.innerHTML +=
				"<br>refueled: " + body[view].refuelCount;
		}
	} else {
		hudGpsInfo.innerHTML =
			"GM " + body[view].gm.toExponential(6) + " kg" +
			"<br>Mass " + body[view].mass.toExponential(6) + " kg" +
			"<br>Radius<sub>Equator</sub> " +
			(body[view].radiusEquator / 1000).toFixed(0) + " km" +
			"<br>Radius<sub>Polar</sub> " +
			(body[view].radiusPole / 1000).toFixed(0) + " km" +
			"<br>Right Asc.  " +
			(body[view].rightAscension * 180 / Math.PI).toFixed(2) + "°" +
			"<br>Declination " +
			(body[view].declination * 180 / Math.PI).toFixed(2) + "°" +
			"<br>Real Sidereal " + body[view].sidereal.toFixed(2) + " hr";


		if (body[view].tidallyLocked === true) {
			hudGpsInfo.innerHTML +=
				"<br>Sim. Sidereal " +
				((1/((body[view].angularVelocity/Math.PI)/2))/3600).toFixed(2) + " hr" +
				"<br>Lon.Libration " + (body[view].lonLibrationAngle *
				180/Math.PI).toFixed(3) + "°";
		}

		if (body[view].surfaceAirDensity > 0) {
			hudGpsInfo.innerHTML +=
				"<br>Atm.Dense " +
				body[view].surfaceAirDensity.toExponential(2) + " kg/m³" +
				"<br>Atm.Scale " +
				(body[view].scaleHeight / 1000).toFixed(1) + " km";
		}
	}

	// update in case object is now orbiting something else
	if (view !== 0) {
		hudView.innerHTML = body[view].name + "<br>@ " +
			body[body[view].focus].name;
	} else {
		hudView.innerHTML = body[view].name + "<br>@ " +
			"mlky";
	}
}


////////////////////////////////////////////////////////////////////////////////
// dynamic and intuitive view order, by periapsis
// periapsis chosen due to higher drag of satellites with low periapsis.
// 999 seems to appear out of order due to sort by periapsis
// to "fix", change it to measure by semi-major axis.
// i.e. replace "periapsis" with "a".

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
	displayText();
}


function viewPrevious() {

	let potentialResult = null;
	let tooLow = 0;
	let tooHigh = Infinity; // in case view is sun
	let focusNow = mostMassiveBody; // in case view is sun
	if (view !== mostMassiveBody) {
		tooHigh = body[view].kepler.periapsis;
		focusNow = body[view].focus;
	}

	function getLower() {
		for (let i = body.length - 1; i > 0; i--) { // skip sun
			if (body[i].focus === focusNow &&
				body[i].kepler.periapsis < tooHigh &&
				body[i].kepler.periapsis > tooLow) {
				potentialResult = i;
				tooLow = body[i].kepler.periapsis;
			}
		}
	}
	getLower();

	while (potentialResult !== null) {
		focusNow = potentialResult;
		potentialResult = null;
		tooLow = 0;
		tooHigh = Infinity;
		getLower();
	}
	
	view = focusNow;
	viewFinalize();
	displayText();
}


////////////////////////////////////////////////////////////////////////////////
// add rocket, stage separation, fairing separation, recycle

//let deployLocation = "random";
let deployLocation = "tour";
// save requests to process when ready. limit 1 during pause.
let addFalconReq = false;
function deploy() {
	deployLocation = document.getElementById("deployLocation").value;
	addFalconReq = true;
}

function prepStats(i) {
	// prep stats for displayText
	let focus = body[i].focus;
	body[i].cartesEci = icrfToEci(body[i].cartes, body[focus].rightAscension,
		body[focus].declination);
	body[i].kepler = toKepler(body[i].cartesEci, body[focus].gm);
	body[i].ecef = eciToEcef(body[i].cartesEci,
		body[focus].spun,
		body[focus].angularVelocity,
		body[focus].radiusEquator, body[focus].e2);
	body[i].gps = ecefToGps(body[i].ecef, body[focus].radiusEquator,
		body[focus].e2);
}

// stage separation request. array in case multiple separations during pause
let stageSepReq = [];
function separateStage() {
	stageSepReq.push(view);
}
function performStageSep(i) {
	// copy
	body[i].stage2.focus = body[i].focus;

	if (body[i].alwaysShowOrbit) {
		body[i].stage2.alwaysShowOrbit = true;
		body[i].alwaysShowOrbit = false;
		body[i].ellipse.visible = false;
	}

	body[i].stage2.missionTime = body[i].missionTime;

	body[i].stage2.cartes.x = body[i].cartes.x;
	body[i].stage2.cartes.y = body[i].cartes.y;
	body[i].stage2.cartes.z = body[i].cartes.z;
	body[i].stage2.cartes.vx = body[i].cartes.vx;
	body[i].stage2.cartes.vy = body[i].cartes.vy;
	body[i].stage2.cartes.vz = body[i].cartes.vz;

	body[i].stage2.mesh.rotation.copy(body[i].mesh.rotation);

	body[i].stage2.xSpin = body[i].xSpin;
	body[i].stage2.ySpin = body[i].ySpin;
	body[i].stage2.zSpin = body[i].zSpin;

	// move to graphics offset so it DOESN'T move
	body[i].pointingM4.extractRotation(body[i].mesh.matrix);
	// get unit vector of direction
	body[i].pointingV3 =
		body[i].mesh.up.clone().applyMatrix4(body[i].pointingM4);

	body[i].stage2.cartes.x += body[i].pointingV3.x * 30.56;
	body[i].stage2.cartes.y += body[i].pointingV3.y * 30.56;
	body[i].stage2.cartes.z += body[i].pointingV3.z * 30.56;
	
	if (body[i].refuelCount) {
		body[i].stage2.s1refuelCount = body[i].refuelCount;
	}

	// separate
	body[i].mesh.remove(body[i].stage2.mesh);
	let j = body.push(body[i].stage2) - 1;
	body[i].stage2 = null;
	scene.add(body[j].mesh);

	body[i].mass -= body[j].mass;
	addRocketHelpers(j);
	if (body[i].axesHelper.visible === true) {
		body[i].axesHelper.visible = false;
		body[i].thrustArrow.visible = false;
		body[j].axesHelper.visible = true;
		body[j].thrustArrow.visible = true;
	}

	// separation velocities should be distributed by mass
	// do this for now
	// pneumatic separation
	body[j].cartes.vx += body[i].pointingV3.x * 2; // 2 m/s² impulse
	body[j].cartes.vy += body[i].pointingV3.y * 2;
	body[j].cartes.vz += body[i].pointingV3.z * 2;

	// pneumatic equal opposite force on stage1
	body[i].cartes.vx -= body[i].pointingV3.x * 2; // 2 m/s² impulse
	body[i].cartes.vy -= body[i].pointingV3.y * 2;
	body[i].cartes.vz -= body[i].pointingV3.z * 2;

	// apply new drag values for stage 1
	body[i].dragCoefficient = 2.2;
	body[i].dragArea = 3.7;

	prepStats(j);

	view = j;
	viewFinalize();
}

let fairingSepReq = [];
function separateFairing() {
	fairingSepReq.push(view);
}
function performFairingSep(i) {
	// copy
	body[i].fairingN.focus = body[i].focus;

	body[i].fairingN.missionTime = body[i].missionTime;

	body[i].fairingN.cartes.x = body[i].cartes.x;
	body[i].fairingN.cartes.y = body[i].cartes.y;
	body[i].fairingN.cartes.z = body[i].cartes.z;
	body[i].fairingN.cartes.vx = body[i].cartes.vx;
	body[i].fairingN.cartes.vy = body[i].cartes.vy;
	body[i].fairingN.cartes.vz = body[i].cartes.vz;

	body[i].fairingN.mesh.rotation.copy(body[i].mesh.rotation);

	body[i].fairingN.xSpin = body[i].xSpin;
	body[i].fairingN.ySpin = body[i].ySpin;
	body[i].fairingN.zSpin = body[i].zSpin;
	
	// move to graphics offset so it DOESN'T move
	body[i].pointingM4.extractRotation(body[i].mesh.matrix);
	// get unit vector of direction
	body[i].pointingV3 =
		body[i].mesh.up.clone().applyMatrix4(body[i].pointingM4);

	body[i].fairingN.cartes.x += body[i].pointingV3.x * (13.8/2 + 1.3 + 6.7/2);
	body[i].fairingN.cartes.y += body[i].pointingV3.y * (13.8/2 + 1.3 + 6.7/2);
	body[i].fairingN.cartes.z += body[i].pointingV3.z * (13.8/2 + 1.3 + 6.7/2);

	// separate
	body[i].mesh.remove(body[i].fairingN.mesh);
	let j = body.push(body[i].fairingN) - 1;
	body[i].fairingN = null;
	scene.add(body[j].mesh);

	body[i].mass -= body[j].mass;
	addRocketHelpers(j);

	// pneumatic separation
	const pneu = 8; // m/s² impulse
	const pneuForward = 4;

	// get unit vector of direction. zAxis will give Zenith direction
	const zenith = zAxis.clone().applyMatrix4(body[i].pointingM4);

	body[j].cartes.vx -= zenith.x * pneu;
	body[j].cartes.vy -= zenith.y * pneu;
	body[j].cartes.vz -= zenith.z * pneu;
	
	body[j].cartes.vx += body[i].pointingV3.x * pneuForward;
	body[j].cartes.vy += body[i].pointingV3.y * pneuForward;
	body[j].cartes.vz += body[i].pointingV3.z * pneuForward;


	body[j].xSpin = - 0.4;

	prepStats(j);

	// repeat for Zenith fairing

	// copy
	body[i].fairingZ.focus = body[i].focus;

	body[i].fairingZ.missionTime = body[i].missionTime;

	body[i].fairingZ.cartes.x = body[i].cartes.x;
	body[i].fairingZ.cartes.y = body[i].cartes.y;
	body[i].fairingZ.cartes.z = body[i].cartes.z;
	body[i].fairingZ.cartes.vx = body[i].cartes.vx;
	body[i].fairingZ.cartes.vy = body[i].cartes.vy;
	body[i].fairingZ.cartes.vz = body[i].cartes.vz;

	body[i].fairingZ.mesh.rotation.copy(body[i].mesh.rotation);

	body[i].fairingZ.xSpin = body[i].xSpin;
	body[i].fairingZ.ySpin = body[i].ySpin;
	body[i].fairingZ.zSpin = body[i].zSpin;

	// move to graphics offset so it DOESN'T move
	body[i].fairingZ.cartes.x += body[i].pointingV3.x * (13.8/2 + 1.3 + 6.7/2);
	body[i].fairingZ.cartes.y += body[i].pointingV3.y * (13.8/2 + 1.3 + 6.7/2);
	body[i].fairingZ.cartes.z += body[i].pointingV3.z * (13.8/2 + 1.3 + 6.7/2);

	// separate
	body[i].mesh.remove(body[i].fairingZ.mesh);
	j = body.push(body[i].fairingZ) - 1;
	body[i].fairingZ = null;
	scene.add(body[j].mesh);

	body[i].mass -= body[j].mass;
	addRocketHelpers(j);

	// pneumatic separation
	body[j].cartes.vx += zenith.x * pneu;
	body[j].cartes.vy += zenith.y * pneu;
	body[j].cartes.vz += zenith.z * pneu;
	
	body[j].cartes.vx += body[i].pointingV3.x * pneuForward;
	body[j].cartes.vy += body[i].pointingV3.y * pneuForward;
	body[j].cartes.vz += body[i].pointingV3.z * pneuForward;

	body[j].xSpin = 0.4;

	// apply new drag values for stage 2
	body[i].dragCoefficient = 2.2;
	body[i].dragArea = 3.7;

	prepStats(j);
}

//let recycleReq = null;
let recycleReq = [];
function recycle() {
	//recycleReq = view;
	recycleReq.push(view);
}
function performRecycle(i) {
	scene.remove(body[i].mesh);

	body[i].mesh.remove(body[i].axesHelper);
	body[i].axesHelper.dispose();

	// what if it's fairingN? or fairingZ?
	if (body[i].nose) {
		body[i].mesh.remove(body[i].base);
		body[i].base.geometry.dispose();
		body[i].base.material.dispose();

		body[i].mesh.remove(body[i].nose);
		body[i].nose.geometry.dispose();
		body[i].nose.material.dispose();
	}

	// what if it's stage 2?
	if (body[i].paf) {
		if (body[i].fairingN) {
			body[i].fairingN.mesh.remove(body[i].fairingN.nose);
			body[i].fairingN.nose.geometry.dispose();
			body[i].fairingN.nose.material.dispose();

			body[i].fairingN.mesh.remove(body[i].fairingN.base);
			body[i].fairingN.base.geometry.dispose();
			body[i].fairingN.base.material.dispose();

			body[i].mesh.remove(body[i].fairingN.mesh);
			body[i].fairingN.mesh.geometry.dispose();
			body[i].fairingN.mesh.material.dispose();


			body[i].fairingZ.mesh.remove(body[i].fairingZ.nose);
			body[i].fairingZ.nose.geometry.dispose();
			body[i].fairingZ.nose.material.dispose();

			body[i].fairingZ.mesh.remove(body[i].fairingZ.base);
			body[i].fairingZ.base.geometry.dispose();
			body[i].fairingZ.base.material.dispose();

			body[i].mesh.remove(body[i].fairingZ.mesh);
			body[i].fairingZ.mesh.geometry.dispose();
			body[i].fairingZ.mesh.material.dispose();
		}

		body[i].mesh.remove(body[i].paf);
		body[i].paf.geometry.dispose();
		body[i].paf.material.dispose();

		body[i].mesh.remove(body[i].engine);
		body[i].engine.geometry.dispose();
		body[i].engine.material.dispose();
	}

	// if it's stage 1
	if (body[i].stage2) {

		body[i].stage2.fairingN.mesh.remove(body[i].stage2.fairingN.nose);
		body[i].stage2.fairingN.nose.geometry.dispose();
		body[i].stage2.fairingN.nose.material.dispose();

		body[i].stage2.fairingZ.mesh.remove(body[i].stage2.fairingZ.nose);
		body[i].stage2.fairingZ.nose.geometry.dispose();
		body[i].stage2.fairingZ.nose.material.dispose();


		body[i].stage2.fairingN.mesh.remove(body[i].stage2.fairingN.base);
		body[i].stage2.fairingN.base.geometry.dispose();
		body[i].stage2.fairingN.base.material.dispose();

		body[i].stage2.fairingZ.mesh.remove(body[i].stage2.fairingZ.base);
		body[i].stage2.fairingZ.base.geometry.dispose();
		body[i].stage2.fairingZ.base.material.dispose();


		body[i].stage2.mesh.remove(body[i].stage2.fairingN.mesh);
		body[i].stage2.fairingN.mesh.geometry.dispose();
		body[i].stage2.fairingN.mesh.material.dispose();

		body[i].stage2.mesh.remove(body[i].stage2.fairingZ.mesh);
		body[i].stage2.fairingZ.mesh.geometry.dispose();
		body[i].stage2.fairingZ.mesh.material.dispose();


		body[i].stage2.mesh.remove(body[i].stage2.paf);
		body[i].stage2.paf.geometry.dispose();
		body[i].stage2.paf.material.dispose();

		body[i].stage2.mesh.remove(body[i].stage2.engine);
		body[i].stage2.engine.geometry.dispose();
		body[i].stage2.engine.material.dispose();

		body[i].mesh.remove(body[i].stage2.mesh);
		body[i].stage2.mesh.geometry.dispose();
		body[i].stage2.mesh.material.dispose();
	}

	// stage 1
	if (body[i].interstage) {
		body[i].mesh.remove(body[i].interstage);
		body[i].interstage.geometry.dispose();
		body[i].interstage.material.dispose();
	}
	if (body[i].tCap) {
		body[i].mesh.remove(body[i].tCap);
		body[i].tCap.geometry.dispose();
		body[i].tCap.material.dispose();
	}
	if (body[i].bCap) {
		body[i].mesh.remove(body[i].bCap);
		body[i].bCap.geometry.dispose();
		body[i].bCap.material.dispose();
	}

	body[i].mesh.geometry.dispose();
	body[i].mesh.material.dispose();

	if (body[i].ellipse) {
		scene.remove(body[i].ellipse);
		body[i].ellipse.geometry.dispose();
		body[i].ellipse.material.dispose();
	}

	view = earth; // not very graceful. would like next or prev, but issues..
	viewFinalize();
	body.splice(i, 1);
}

let resetReq = false;
function reset() {
	resetReq = true;
}
function performReset() {
	// dispose of everything
	for (let i = body.length - 1; i > -1; i--) {
		// pad array indices do not match body array indices, this is different 
		if (pad[i] !== undefined) {
			pad[i].remove(pad[i].surface);
			pad[i].surface.geometry.dispose();
			pad[i].surface.material.dispose();
		}
		if (body[i].type === "Natural") {
			scene.remove(body[i].mesh);
			body[i].mesh.geometry.dispose();
			body[i].mesh.material.dispose();
			if (body[i].ellipse) {
				body[i].ellipse.geometry.dispose();
			}
		} else {
			performRecycle(i);
		}
	}

	timestep = 0.01;
	document.getElementById("hudStep").innerHTML = "1";

	// to save game, save body[]

	initialize();

	resetReq = false;
}

////////////////////////////////////////////////////////////////////////////////

document.querySelector("#allOrbits").checked = false;
let drawOrbits = false;
function toggleAllOrbits() {
	if (drawOrbits) {
		if (drawLocalOrbits) {
			// skip sun
			for (let i = body.length - 1; i > 0; i--) {
				if (body[i].focus !== body[view].focus) {
					body[i].ellipse.visible = false;
				}
			}
		} else {
			// skip sun
			for (let i = body.length - 1; i > 0; i--) {
				body[i].ellipse.visible = false;
			}
		}
	}
	drawOrbits = !drawOrbits;
}

document.querySelector("#localOrbits").checked = false;
let drawLocalOrbits = false;
function toggleLocalOrbits() {
	drawLocalOrbits = !drawLocalOrbits;
	if (!drawOrbits) {
		for (let i = body.length - 1; i > 0; i--) {
			if (body[i].ellipse) {
				body[i].ellipse.visible = false;
			}
		}
	}
}


document.querySelector("#singleOrbit").checked = false;
function toggleSingleOrbit() {
	if (view === 0) {
		return;
	}
	if (!body[view].alwaysShowOrbit) {
		body[view].alwaysShowOrbit = true;
	} else {
		body[view].alwaysShowOrbit = false;
	}
	if (!drawLocalOrbits && !drawOrbits && body[view].ellipse) {
		body[view].ellipse.visible = false;
	}
}

////////////////////////////////////////////////////////////////////////////////
// preAnimate


//let skipDraw = 0;

// keep these variables for navball efficiency
let navM4 = new THREE.Matrix4();
let navQ = new THREE.Quaternion();
const navFunctionalOrientation =
	new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI)
	.multiply(new THREE.Quaternion().setFromAxisAngle(xAxis, -Math.PI / 2));
const navTextureOrientation =
	new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI)
	.multiply(new THREE.Quaternion().setFromAxisAngle(yAxis, Math.PI));


let oldViewX = 0;
let oldViewY = 0;
let oldViewZ = 0;
function preAnimate() {

	if (drawOrbits === true) {
		// skip the sun because it doesn't have orbital parameters
		for (let i = body.length - 1; i > 0; i--) {

			//if (body[i].type === "Artificial") {
			drawEllipse(i, body[i].color, scale);
			body[i].ellipse.visible = true;
/*
			} else {
				if (skipDraw === 0) {
					drawEllipse(i, body[i].color, scale);
					skipDraw = 1000;
				} else {
					skipDraw--;
				}
			}
*/
		}
	} else if (drawLocalOrbits === true) {
		let local = 0;
		if (body[view].type === "Artificial") {
			local = body[view].focus;
		} else {
			local = view;
		}
		for (let i = body.length - 1; i > 0; i--) {
			if (body[i].focus === local || body[i].alwaysShowOrbit) {
				drawEllipse(i, body[i].color, scale);
				body[i].ellipse.visible = true;
			} else {
				if (body[i].ellipse) {
					body[i].ellipse.visible = false;
				}
			}
		}
	} else {
		for (let i = body.length - 1; i > 0; i--) {
			if (body[i].alwaysShowOrbit) {
				drawEllipse(i, body[i].color, scale);
				body[i].ellipse.visible = true;
			}
		}
	}

////////////////////////////////////////////////////////////////////////////////
// NAVBALL

	if (body[view].type === "Artificial") {
		let focus = body[view].focus;
		let enu = getDirections(body[view].cartes.x, body[view].cartes.y,
			body[view].cartes.z, body[focus].mesh.quaternion);

		navM4.makeBasis(enu.northAxisV3, enu.upAxisV3, enu.eastAxisV3);
		navQ.setFromRotationMatrix(navM4);

		navBall.quaternion.copy(
			// functional orientation before applying navQ (world space rotations)
			navFunctionalOrientation.clone()

			// apply nav
			.multiply(navQ)

			// texture orientation after applying nav (local/object space rotations)
			.multiply(navTextureOrientation)
		);

		// apply spacecraft rotation relative to stars
		// swap y and z. must implement in original order.
		navBall.rotateOnWorldAxis(xAxis, body[view].mesh.rotation.x);
		navBall.rotateOnWorldAxis(zAxis, body[view].mesh.rotation.y);
		navBall.rotateOnWorldAxis(yAxis, body[view].mesh.rotation.z);
	}

////////////////////////////////////////////////////////////////////////////////
// HELPERS


	// icrf
	for (let i = body.length - 1; i > -1; i--) {
		if (body[i].axesHelperIcrf) {
			// dev5
			//body[i].axesHelperIcrf.position.copy(body[i].mesh.position);
			body[i].axesHelperIcrf.position.x = body[i].x * scale;
			body[i].axesHelperIcrf.position.y = body[i].y * scale;
			body[i].axesHelperIcrf.position.z = body[i].z * scale;
		}
		if (body[i].axesHelperEci) {
			// dev5
			//body[i].axesHelperEci.position.copy(body[i].mesh.position);
			body[i].axesHelperEci.position.x = body[i].x * scale;
			body[i].axesHelperEci.position.y = body[i].y * scale;
			body[i].axesHelperEci.position.z = body[i].z * scale;
		}
	}


////////////////////////////////////////////////////////////////////////////////
// finish animation

	camera.position.x += body[view].x * scale - oldViewX;
	camera.position.y += body[view].y * scale - oldViewY;
	camera.position.z += body[view].z * scale - oldViewZ;
	oldViewX = body[view].x * scale;
	oldViewY = body[view].y * scale;
	oldViewZ = body[view].z * scale;

	controls.target.x = body[view].x * scale;
	controls.target.y = body[view].y * scale;
	controls.target.z = body[view].z * scale;
}

////////////////////////////////////////////////////////////////////////////////
// main loop

// main loop (separate from animation loop)
function main() {

	// spin, throttle thrust, and drag for rockets
	rocketControl();

	// calculate new velocities for everything (true n-body physics.
	//body = nBodyVelocity(body, GRAVITY, timestep);
	nBodyVelocity();

	// update sun position. relative to system barycenter. no keplerian orbit
	body[mostMassiveBody].x += body[mostMassiveBody].vx * timestep;
	body[mostMassiveBody].y += body[mostMassiveBody].vy * timestep;
	body[mostMassiveBody].z += body[mostMassiveBody].vz * timestep;
	body[mostMassiveBody].mesh.rotateY(
		body[mostMassiveBody].angularVelocity * timestep);
	body[mostMassiveBody].spun +=
		body[mostMassiveBody].angularVelocity * timestep;

	// update everything else's position within the context of a 2-body problem
	keplerPosition();

	// update sun mesh position. relative to system barycenter
	body[mostMassiveBody].mesh.position.x = body[mostMassiveBody].x * scale;
	body[mostMassiveBody].mesh.position.y = body[mostMassiveBody].y * scale;
	body[mostMassiveBody].mesh.position.z = body[mostMassiveBody].z * scale;

	// new rocket
	if (addFalconReq) {
		let i = addFalcon();
		addFalconGraphics(i);
		body[i].pad = addLaunchPad(body[i].gps, body[i].focus);
		addFalconReq = false;
	}

	// stage separation
	while (stageSepReq.length > 0) {
		let i = stageSepReq.pop(); // the first will be last, and the last, first
		if (body[i].stage2 !== undefined && body[i].stage2 !== null) {
			performStageSep(i);
		}
	}

	// fairing separation
	while (fairingSepReq.length > 0) {
		let i = fairingSepReq.pop();
		// just test fairing n for both n and z
		if (body[i].fairingN !== undefined && body[i].fairingN !== null) {
			performFairingSep(i);
		}
	}

	while (recycleReq.length > 0) {
		let i = recycleReq.pop();
		if (body[i] !== undefined && body[i].onSurface === true) {
			performRecycle(i);
		}
	}

	// get everything else's solar system position based on local position
	systemPosition();

	// increment time
	body.date.setMilliseconds(body.date.getMilliseconds() + timestep * 1000);

	displayText();

	preAnimate();


	if (resetReq === true) {
		performReset();
	}
}

function animate() {
	requestAnimationFrame(animate);

	controls.update();

	renderer.clear();
	renderer.render(scene, camera);
	renderer.clearDepth();
	renderer.render(scene2, camera2);
}

let mostMassiveBody = 0;
function initialize() {

	loadBodies();
	// first use of body[]
	makeNaturalBodyGraphics();

	// disable sun shadow
	//body[sun].mesh.castShadow = false;
	//body[sun].mesh.receiveShadow = false;

	// sunlight
	body[sun].sunlight = new THREE.PointLight(0xffffff, 1.5);
	//body[sun].sunlight.castShadow = true;

	//Set up shadow properties for the light
	//body[sun].sunlight.shadow.mapSize.width = 512; // default
	//body[sun].sunlight.shadow.mapSize.height = 512; // default
	//body[sun].sunlight.shadow.camera.near = body[sun].radiusPole - 10000 * scale;
	//body[sun].sunlight.shadow.camera.far = 7500e9 * scale;

	body[sun].mesh.add(body[sun].sunlight);

	//Create a helper for the shadow camera (optional)
	//const shadowHelper = new THREE.CameraHelper(body[sun].sunlight.shadow.camera);
	//scene.add(shadowHelper);


	/* currently hard coded to 0.
	// dynamically assign mostMassiveBody
	{
		let greatestMass = 0;
		for (let i = body.length - 1; i > -1; i--) {
			if (body[i].mass > greatestMass) {
				greatestMass = body[i].mass;
				mostMassiveBody = i;
			}
		}
	}
	*/

	let i = addFalcon();
	// first use of mostMassiveBody
	addFalconGraphics(i);
	body[i].pad = addLaunchPad(body[i].gps, body[i].focus);

	// initialize positions
	body[mostMassiveBody].x = body[mostMassiveBody].cartes.x;
	body[mostMassiveBody].y = body[mostMassiveBody].cartes.y;
	body[mostMassiveBody].z = body[mostMassiveBody].cartes.z;
	body[mostMassiveBody].vx = body[mostMassiveBody].cartes.vx;
	body[mostMassiveBody].vy = body[mostMassiveBody].cartes.vy;
	body[mostMassiveBody].vz = body[mostMassiveBody].cartes.vz;
	body[mostMassiveBody].mesh.position.x = body[mostMassiveBody].x * scale;
	body[mostMassiveBody].mesh.position.y = body[mostMassiveBody].y * scale;
	body[mostMassiveBody].mesh.position.z = body[mostMassiveBody].z * scale;
	systemPosition();
}
