"use strict";
// revision 15
// getDirections() depends on three.js
//   ECI<->ECEF depends on getDirections


////////////////////////////////////////////////////////////////////////////////
// tilting (rotate/transform) between icrf and body frame (eci)
/*
	// see iau report: WGCCRE2009reprint.pdf
	// for reference, this is how bodies are oriented:
	// setup (threejs creates objects y-up even if defaultUp is z)
	body[moon].mesh.rotation.set(Math.PI / 2, 0, 0);

	// apply dec, then ra, then W eastward
	body[moon].mesh.rotateOnWorldAxis(
		yAxis, (Math.PI / 2) - body[moon].declination);
	body[moon].mesh.rotateOnWorldAxis(zAxis, body[moon].rightAscension);
	body[moon].mesh.rotation.y += (Math.PI / 2) + body[moon].primeMeridian;

// in three.js, tilting could be done like this:

// transform vector from icrf to tilt (z-up)
rotateOnWorldAxis(z, -ra)
rotateOnWorldAxis(y, dec - Math.PI / 2)

// transform vector from tilt to icrf (z-up)
rotateOnWorldAxis(y, Math.PI / 2 - dec)
rotateOnWorldAxis(z, ra)

*/

// to convert orbital coordinates to a local body frame,
// don't rotate to MATCH the body frame,
// but rather rotate in the equal and opposite direction

// transform vectors from icrf to local body frame (all z-up)
function icrfToEci(icrf, ra, dec) {
	let {x, y, z, vx, vy, vz} = icrf;

	// rotate on z axis, -ra
	let x2 = x * Math.cos(-ra) - y * Math.sin(-ra);
	let vx2 = vx * Math.cos(-ra) - vy * Math.sin(-ra);
	let y2 = y * Math.cos(-ra) + x * Math.sin(-ra);
	let vy2 = vy * Math.cos(-ra) + vx * Math.sin(-ra);

	// rotate on y axis (dec - Math.PI / 2) must swap signs
	let angle = -dec + Math.PI / 2;
	let x3 = x2 * Math.cos(angle) - z * Math.sin(angle);
	let vx3 = vx2 * Math.cos(angle) - vz * Math.sin(angle);
	let z2 = z * Math.cos(angle) + x2 * Math.sin(angle);
	let vz2 = vz * Math.cos(angle) + vx2 * Math.sin(angle);

	x = x3;
	vx = vx3;
	y = y2;
	vy = vy2;
	z = z2;
	vz = vz2;

	return {x, y, z, vx, vy, vz};
}

// transform vectors from local body frame to icrf (all z-up)
function eciToIcrf(eci, ra, dec) {
	let {x, y, z, vx, vy, vz} = eci;

	// rotate on y axis (Math.PI / 2 - dec) must swap signs
	let angle = -Math.PI / 2 + dec;
	let x2 = x * Math.cos(angle) - z * Math.sin(angle);
	let vx2 = vx * Math.cos(angle) - vz * Math.sin(angle);
	let z2 = z * Math.cos(angle) + x * Math.sin(angle);
	let vz2 = vz * Math.cos(angle) + vx * Math.sin(angle);

	// rotate on z axis, ra
	let x3 = x2 * Math.cos(ra) - y * Math.sin(ra);
	let vx3 = vx2 * Math.cos(ra) - vy * Math.sin(ra);
	let y2 = y * Math.cos(ra) + x2 * Math.sin(ra);
	let vy2 = vy * Math.cos(ra) + vx2 * Math.sin(ra);

	x = x3;
	vx = vx3;
	y = y2;
	vy = vy2;
	z = z2;
	vz = vz2;

	return {x, y, z, vx, vy, vz};
}


////////////////////////////////////////////////////////////////////////////////
// Convert Earth-Centered-Earth-Fixed (ECEF) to Lat, Lon, Altitude
// Input is x, y, z in meters
// Returned array contains lat and lon in radians, and altitude in meters
function ecefToGps(ecef, radiusEquator, e2) {
	let {x, y, z} = ecef;

	const a = radiusEquator;
	const a1 = a*e2;
	const a2 = a1*a1;
	const a3 = a1*e2/2;
	const a4 = 2.5*a2;
	const a5 = a1+a3;
	const a6 = 1-e2;

	let s,c,ss;
	let lat;

	let zp = Math.abs( z );
	let w2 = x*x + y*y;
	let w = Math.sqrt( w2 );
	let r2 = w2 + z*z;
	let r = Math.sqrt( r2 );
	const lon = Math.atan2( y, x );       //Lon (final)
	let s2 = z*z/r2;
	let c2 = w2/r2;
	let u = a2/r;
	let v = a3 - a4/r;
	if ( c2 > 0.3 ) {
		s = ( zp/r )*( 1.0 + c2*( a1 + u + s2*v )/r );
		lat = Math.asin( s );      //Lat
		ss = s*s;
		c = Math.sqrt( 1.0 - ss );
	}
	else {
		c = ( w/r )*( 1.0 - s2*( a5 - u - c2*v )/r );
		lat = Math.acos( c );      //Lat
		ss = 1.0 - c*c;
		s = Math.sqrt( ss );
	}
	let g = 1.0 - e2*ss;
	let rg = a/Math.sqrt( g );
	let rf = a6*rg;
	u = w - rg*c;
	v = zp - rf*s;
	let f = c*u + s*v;
	let m = c*v - s*u;
	let p = m/( rf/g + f );
	lat += p;      //Lat
	const alt = f + m*p/2.0;     //Altitude
	if ( z < 0.0 ) {
		lat *= -1.0;     //Lat
	}
	return {lat, lon, alt};    //Return Lat, Lon, Altitude in that order
}

//Convert Lat, Lon, Altitude to Earth-Centered-Earth-Fixed (ECEF)
//Input is lat, lon (rads) and alt (m)
//Returns x, y, z in meters
function gpsToEcef(gps, radiusEquator, e2) {
	let {lat, lon, alt} = gps;
	const a = radiusEquator;
	let n = a/Math.sqrt( 1 - e2*Math.sin( lat )*Math.sin( lat ) );
	const x = ( n + alt )*Math.cos( lat )*Math.cos( lon );
	const y = ( n + alt )*Math.cos( lat )*Math.sin( lon );
	const z = ( n*(1 - e2 ) + alt )*Math.sin( lat );
	const vx = 0;
	const vy = 0;
	const vz = 0;
	return {x, y, z, vx, vy, vz};
}




////////////////////////////////////////////////////////////////////////////////
// COMPASS
/*
	depends:
		three.js r124 (NOT as modules)
	requires:
		position vector (icrf frame, or unspecified) of satellite
	optional:
		celestial body quaternion
	returns:
		ENU unit vectors: East, North, and Up in z-up or y-up

	NOTE: the "up" produced here is "away from the center of mass",
		but not necessarily perpendicular to the surface on an ellipsoid
*/
// re-use instead of recreating
const localPosition = new THREE.Vector3();
let upAxisV3 = new THREE.Vector3();
let eastAxisV3 = new THREE.Vector3();
let northAxisV3 = new THREE.Vector3();
let navAxesFailsafe = false;
// passing a quaternion argument is OPTIONAL, and changes y-up/z-up
function getDirections(x, y, z, quaternion) {

	// uses ICRF (non-tilted), and tilts if specified
	// use local position for nearby object, not system position
	localPosition.set(x, y, z);

	// ENU convention: East, North, Up
	// up is +z, which is different from NED orientation for spacecraft
	// not to be confused with y-up or z-up
	////////// UP: CREATE A UNIT VECTOR
	upAxisV3 = localPosition.normalize();

	// edge case safety: if the rocket has journeyed to the centre of the earth
	if (upAxisV3.x === 0 && upAxisV3.y === 0 && upAxisV3.z === 0) {
		upAxisV3.z = Number.EPSILON;
		navAxesFailsafe = true;
	}
	else {
		navAxesFailsafe = false;
	}

	////////// EAST: CREATE A UNIT VECTOR
	// z is up, but sphere textures load y-up by default
	if (quaternion !== undefined) {
		eastAxisV3.set(0, 1, 0)
			.applyQuaternion(quaternion)
			.cross(localPosition)
			.normalize();
	}
	else {
		// without quaternion. USE Z-UP FOR PURE SPACE DIRECTIONS!!!
		eastAxisV3.set(0, 0, 1)
			.cross(localPosition)
			.normalize();
	}

	// edge case safety: if exactly above the north or south pole.
	if (eastAxisV3.x === 0 && eastAxisV3.y === 0 && eastAxisV3.z === 0) {
		eastAxisV3.x = Number.EPSILON;
		navAxesFailsafe = true;
	}
	else {
		navAxesFailsafe = false;
	}

	////////// NORTH: CREATE A UNIT VECTOR
	northAxisV3 = upAxisV3.clone().cross(eastAxisV3);
	
	return {eastAxisV3, northAxisV3, upAxisV3};
}

////////////////////////////////////////////////////////////////////////////////
// Earth-Centered-Inertial and Earth-Centered-Earth-Fixed

// depends on gps and getDirections()
// ECI/Orbit (body frame) to ECEF/Surface (body frame) (all z-up)
function eciToEcef(eci, angle, angularVelocity, radiusEquator, e2) {
	let {x, y, z, vx, vy, vz} = eci;
	// rotate on z axis
	let x2 = x * Math.cos(-angle) - y * Math.sin(-angle);
	let vx2 = vx * Math.cos(-angle) - vy * Math.sin(-angle);
	let y2 = y * Math.cos(-angle) + x * Math.sin(-angle);
	let vy2 = vy * Math.cos(-angle) + vx * Math.sin(-angle);
	x = x2;
	vx = vx2;
	y = y2;
	vy = vy2;

	// to modify speed according to planet rotation, first find
	// the surface below the spacecraft
	let gpsNow = ecefToGps({x, y, z}, radiusEquator, e2);
	gpsNow.alt = 0;
	let centerToSurface = gpsToEcef(gpsNow, radiusEquator, e2);

	// surface speed is xy (not xyz) distance from origin to surface
	let distance = Math.hypot(centerToSurface.x, centerToSurface.y);
	let tangentVelocity = angularVelocity * distance;

	// get eastAxisV3 (don't use quaternion!)
	const enu = getDirections(x, y, z);

	// negate planetary spin velocity
	vx -= tangentVelocity * enu.eastAxisV3.x;
	vy -= tangentVelocity * enu.eastAxisV3.y;

	// z and vz pass through unchanged
	return {x, y, z, vx, vy, vz};
}



// depends on gps and getDirections()
// ECEF/Surface (body frame) to ECI (all z-up)
function ecefToEci(ecef, angle, angularVelocity, radiusEquator, e2) {
	let {x, y, z, vx, vy, vz} = ecef;
	// rotate on z axis
	let x2 = x * Math.cos(angle) - y * Math.sin(angle);
	let vx2 = vx * Math.cos(angle) - vy * Math.sin(angle);
	let y2 = y * Math.cos(angle) + x * Math.sin(angle);
	let vy2 = vy * Math.cos(angle) + vx * Math.sin(angle);
	x = x2;
	vx = vx2;
	y = y2;
	vy = vy2;

	// to modify speed according to planet rotation, first find
	// the surface below the spacecraft
	let gpsNow = ecefToGps({x, y, z}, radiusEquator, e2);
	gpsNow.alt = 0;
	let centerToSurface = gpsToEcef(gpsNow, radiusEquator, e2);

	// surface speed is xy (not xyz) distance from origin to surface
	let distance = Math.hypot(centerToSurface.x, centerToSurface.y);
	let tangentVelocity = angularVelocity * distance;

	// get eastAxisV3 (don't use a quaternion!)
	const enu = getDirections(x, y, z);

	// add planetary spin velocity
	vx += tangentVelocity * enu.eastAxisV3.x;
	vy += tangentVelocity * enu.eastAxisV3.y;

	// z and vz pass through unchanged
	return {x, y, z, vx, vy, vz};
}




/*
if possible
use radiusEquator & flattening to get e2 and radiusPole
not radiusEquator & radiusPole to get flattening and e2

reason:

NASA HORIZONS earth data:
a = 6378.137 km
b = 6356.752 km
f = 1/298.257223563
f = 0.0033528106647

// extremely precise
pole radius from eq radius & flattening
diff = a * f = 21.3846857545176639
b = a - diff = 6356.7523142454823361

// inaccurate
flattening from radii
f = (a - b) / a
f = 21.385 / a
f = 0.0033528599338
1 / f = 298.25284078200

*/



/*
use sidereal to get angular velocity (rot. rate rad/s)
not the other way around

reason:

NASA HORIZONS earth data:
Mean sidereal day, hr    = 23.9344695944
Rot. Rate (rad/s)        = 0.00007292115

// accurate
rotRate from siderealHr:
23.9344695944 * 60 * 60 = 86,164.09053984 = x
1/x * 2π = 0.0000729211585454

// inaccurate
siderealHr from rotRate:
0.00007292115 / (2π) = 0.0000116057614784
x = 86164.100637527 / 60 / 60 = 23.934472399313

*/

/*
// fyi... the reverse conversion is:
sidereal = (1/((angularVelocity/Math.PI)/2))/3600;
*/


// PURE FUNCTION
// Formula accurate if (altitude < 86000)
// but still provides value if (altitude < 178325)
// input altitude in meters
function earthAirData(altitude) {

	// https://physics.nist.gov/cgi-bin/cuu/Value?r
	const UNIVERSAL_GAS = 8.314462618; // J

	// https://physics.nist.gov/cgi-bin/cuu/Value?gn
	const EARTH_GRAVITY_SEA = 9.80665; // m/s^2

	// https://www.engineeringtoolbox.com/air-composition-d_212.html
	const EARTH_MOLAR_MASS = 0.0289647; // kg/mol

	let airPressure = 0;  // 101325 Pa at sea level
	let airDensity = 0;  // 1.225 kg/m^3 at sea level
	let airAccurate = true;
	let airFormula = "nonzero";

	if (altitude < 86000) {
		airAccurate = true;
	}
	else {
		airAccurate = false;
	}

	if (altitude >= 178325) {
		airFormula = "out of range";
		return {airPressure, airDensity, airAccurate, airFormula};
	}
	else {
		let base;
		let staticPressure;
		let massDensity;
		let standardTemperature;
		let lapse;

				 if (altitude < 11000) { base = 0;     staticPressure = 101325;   massDensity = 1.2250;   standardTemperature = 288.15; lapse = -0.0065 }
		else if (altitude < 20000) { base = 11000; staticPressure = 22632.10; massDensity = 0.36391;  standardTemperature = 216.65; lapse = 0 }
		else if (altitude < 32000) { base = 20000; staticPressure = 5474.89;  massDensity = 0.08803;  standardTemperature = 216.65; lapse = 0.001 }
		else if (altitude < 47000) { base = 32000; staticPressure = 868.02;   massDensity = 0.01322;  standardTemperature = 228.65; lapse = 0.0028 }
		else if (altitude < 51000) { base = 47000; staticPressure = 110.91;   massDensity = 0.00143;  standardTemperature = 270.65; lapse = 0 }
		else if (altitude < 71000) { base = 51000; staticPressure = 66.94;    massDensity = 0.00086;  standardTemperature = 270.65; lapse = -0.0028 }
		else                       { base = 71000; staticPressure = 3.96;     massDensity = 0.000064; standardTemperature = 214.65; lapse = -0.002 }

		if (lapse != 0) {
			airFormula = "nonzero";
			airPressure = staticPressure * Math.pow((standardTemperature / (standardTemperature + (lapse * (altitude - base)))),
					((EARTH_GRAVITY_SEA * EARTH_MOLAR_MASS) / (UNIVERSAL_GAS * lapse)));
			airDensity = massDensity * Math.pow((standardTemperature / (standardTemperature + (lapse * (altitude - base)))),
					(1 + ((EARTH_GRAVITY_SEA * EARTH_MOLAR_MASS) / (UNIVERSAL_GAS * lapse))));
			return {airPressure, airDensity, airAccurate, airFormula};
		}
		else {
			airFormula = "zero";
			airPressure = staticPressure * Math.exp((-EARTH_GRAVITY_SEA * EARTH_MOLAR_MASS * (altitude - base)) / (UNIVERSAL_GAS * standardTemperature));
			airDensity = massDensity * Math.exp((-EARTH_GRAVITY_SEA * EARTH_MOLAR_MASS * (altitude - base)) / (UNIVERSAL_GAS * standardTemperature));
			return {airPressure, airDensity, airAccurate, airFormula};
		}
	}
}






// https://en.wikipedia.org/wiki/Drag_equation
// No attempt to address sound barrier resistance
//let drag_now = 0; // N
function dragEquation(airDensity, velocity, mass, dragCoefficient) {
	//const dragCoefficient = 0.342; // nosecone. avg of 0.237 and 0.447
	//const dragCoefficient = 2.2; // cube sat
	if (!dragCoefficient) { dragCoefficient = 2.2 }
	//const payloadDiameter = 5.2; // meters. falcon 9 with payload fairing
	//const payloadDiameter = 9; // meters. starship
	const payloadDiameter = 1.5; // meters. sputnik 1 is 58cm with whiskers
	const dragArea = (payloadDiameter / 2)**2 * Math.PI; // m^2

	return (airDensity * (velocity * velocity) *
		(dragCoefficient * dragArea/mass)) / 2;
}

// https://www.spaceacademy.net.au/watch/debris/atmosmod.htm
// https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
function isothermalAirDensity(surfaceAirDensity, scaleHeight, altitude) {
	// 1.225 is kg/m^3 air density at sea level of earth

	//const k = 1.38e-23; // boltz
	// T is temperature Kelvin
	// m is mean molecular mass
	//const g = 9.80665; // for earth
	//const H = ( k * T ) / ( m * g );
	// H is scale height. nasa says 8.5km for earth

	return surfaceAirDensity * Math.exp( - altitude / scaleHeight);

	// easily a function for any planet if 3 arguments are used

	// way too weak for high LEO orbits
}



// US Standard Atmosphere 1976
// Orbital Mechanics for Engineering Students, Curtis, 2020, pg. e144 D.39
// input altitude in meters above earth MSL
function earthAtmosphere(altitude) {

	// convert from meters to km for this function
	altitude /= 1000;

	const height = [0, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140,
		150, 180, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000];
	const density = [
		1.225, 4.008e-2, 1.841e-2, 3.996e-3, 1.027e-3, 3.097e-4, 8.283e-5,
		1.846e-5, 3.416e-6, 5.606e-7, 9.708e-8, 2.222e-8, 8.152e-9, 3.831e-9,
		2.076e-9, 5.194e-10, 2.541e-10, 6.073e-11, 1.916e-11, 7.014e-12, 2.803e-12,
		1.184e-12, 5.215e-13, 1.137e-13, 3.070e-14, 1.136e-14, 5.759e-15, 3.561e-15
		];
	// the book was missing data for index 27, so 283 is a guess estimate
	const scaleHeight = [7.310, 6.427, 6.546, 7.360, 8.342, 7.583, 6.661,
		5.927, 5.533, 5.703, 6.782, 9.973, 13.243, 16.322,
		21.652, 27.974, 34.934, 43.342, 49.755, 54.513, 58.019,
		60.980, 65.654, 76.377, 100.587, 147.203, 208.020, 283]; // 283 is a guess

	let i;
	for (let j = 0; j < 27; j++) {
		if (altitude >= height[j] && altitude < height[j + 1]) {
			i = j;
		}
	}
	if (altitude >= 1000) {
		i = 27;
	} else if (altitude < 0) {
		i = 0;
	}

	// outputs air density in kg/m**3
	return density[i] * Math.exp( - (altitude - height[i]) / scaleHeight[i]);
}


function secondsToYears(seconds) {
	if (isNaN(seconds)) seconds = 0;
//function s(seconds) {
	let y = 0;
	let d = 0;
	let h = 0;
	let m = 0;

	while (seconds >= 3600*24*365.2422) {
		seconds -= 3600*24*365.2422;
		y++;
	}
	while (seconds >= 3600*24) {
		seconds -= 3600*24;
		d++;
	}
	while (seconds >= 3600) {
		seconds -= 3600;
		h++;
	}
	while (seconds >= 60) {
		seconds -= 60;
		m++;
	}

	h = String(h).padStart(2, "0"); // "09"
	m = String(m).padStart(2, "0"); // "09"
	seconds = String(Math.floor(seconds)).padStart(2, "0"); // "09"


	return y + "y " + d + "d " + h + ":" + m + ":" + seconds;

	/*
	// nice but doesn't work well with non-integer year values
	let y = Math.floor(seconds / (3600*24*365));
	let d = Math.floor(seconds % (3600*24*365) / (3600*24));
	let h = Math.floor(seconds % (3600*24) / 3600);
	let m = Math.floor(seconds % 3600 / 60);
	let s = Math.floor(seconds % 60);
	return y + "y " + d + "d " + h + ":" + m + ":" + s;
	*/
}
