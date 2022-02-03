"use strict";


////////////////////////////////////////////////////////////////////////////////
// n-body initialization

// IMPORTANT! order is important! parent bodies must by given an index lower
// than satellite bodies, for each level. i.e., first the sun, then planets and
// asteroids and comets (sun orbiters), then all moons, then all satellites of
// moons, then (if possible), anything orbiting that, etc. so do not add a
// planet, then its moons, then another planet. instead add both planets, then
// their moons. systemPosition() requires this structure.

let body = [];
let X, Y, Z, VX, VY, VZ;

let sun, earth, planet4, moon, moon401, moon402;

function loadBodies() { // no indentation

body = [];

body.date = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));

body.rocketCount = 0;

// mass in kg, distance in m, sidereal in hours, axial tilt in degrees

// sun ssb kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB
// these lines begin with a space because that's how they're retrieved from nasa
 X =-1.067598502264559E+06, Y =-3.959890535950128E+05, Z =-1.380711260212289E+05
 VX= 9.312570119052345E-03, VY=-1.170150735349599E-02, VZ=-5.251247980405208E-03

sun = body.push({
	name: "10",
	focus: null,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 1.3271244004193938e20, // horizons ephemeris. updated 2018-08-15
	mass: 1988500e+24,
	J2: -6.13e-7,
	radiusEquator: 696000000,
	flattening: 0.00005,
	sidereal: 609.12,

	rightAscension: 286.13,
	declination: 63.87,
	primeMeridian: 84.176,

	map: "graphics/sun_1k.jpg",
	color: 0xffffff,
	emissive: 0xffffff
}) - 1;


// 199 sun-centric kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-1.946172639275932E+07, Y =-5.992796771076561E+07, Z =-2.999277272986019E+07
 VX= 3.699499188030234E+01, VY=-8.529675367206812E+00, VZ=-8.393121028781621E+00

body.push({
	name: "199",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 2.203186855e13,
	mass: 3.302E+23,
	J2: 50.3e-6,
	radiusEquator: 2439.7e+3,
	flattening: 0,
	sidereal: 1407.5112,

	rightAscension: 281.0097,
	declination: 61.4143,
	primeMeridian: 329.5469,

	map: "graphics/planet1_2k.jpg",
	color: 0x848383
});

// 299
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-1.074564940489116E+08, Y =-6.922528830161016E+06, Z = 3.686187037221310E+06
 VX= 1.381906047920155E+00, VY=-3.201781843822535E+01, VZ=-1.449183545721332E+01

body.push({
	name: "299",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 3.24858592e14,
	mass: 48.685e+23,
	J2: 4.458E-6,
	radiusEquator: 6051800,
	flattening: 0,
	sidereal: 5832.443616,

	rightAscension: 92.76,
	declination: -67.16,
	primeMeridian: 160.20 + 180, // iau defines neg as north. adding 180

	surfaceAirDensity: 65,
	scaleHeight: 15900,

	map: "graphics/planet2_2k.jpg",
	color: 0xe4bd7f
});


////////////////////////////////////////////////////////////////////////////////

// earth suncentric kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-2.649903375682292E+07, Y = 1.327574173547878E+08, Z = 5.755671839918904E+07
 VX=-2.979426006719171E+01, VY=-5.018052326235948E+00, VZ=-2.175393803476646E+00

earth = body.push({
	name: "399",
	focus: sun,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 3.98600435436e14,
	mass: 5.9723e+24,
	J2: 1.08263e-3,
	radiusEquator: 6378137,
	flattening: 0.0033528106647,
	sidereal: 23.9344695944,

	rightAscension: 0,
	declination: 90,
	primeMeridian: 190.147,

	surfaceAirDensity: 1.225,
	scaleHeight: 8500,

	segments: 64,
	map: "graphics/planet3_1k.jpg",
	color: 0x419dd9
}) - 1;



////////////////////////////////////////////////////////////////////////////////
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X = 2.080481406481886E+08, Y = 2.096192809566167E+05, Z =-5.529162176566044E+06
 VX= 1.162672383641686E+00, VY= 2.391840970779204E+01, VZ= 1.093917189957652E+01

planet4 = body.push({
	name: "499",
	focus: sun,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 4.2828375214e13,
	mass: 6.4171e+23,
	J2: 1960.45E-6,
	radiusEquator: 3396200,
	flattening: 1/169.779,
	sidereal: 24.622962,

	rightAscension: 317.68143,
	declination: 52.88650,
	primeMeridian: 176.630,

	surfaceAirDensity: 0.02,
	scaleHeight: 11100,

	//segments: 48,
	map: "graphics/planet4_2k.jpg",
	color: 0xb76247
}) - 1;


// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X = 5.985676246570733E+08, Y = 4.093863059842168E+08, Z = 1.608943268775537E+08
 VX=-7.909860298437398E+00, VY= 1.018357408916719E+01, VZ= 4.557755398163733E+00
//LT= 2.477748886094049E+03 RG= 7.428104288688971E+08 RR= 2.258267630831523E-01


// 2459001.000000000 = A.D. 2020-May-31 12:00:00.0000 TDB 
//X = 2.437414293329616E+08 Y =-6.727712214984925E+08 Z =-2.943016126910576E+08
//VX= 1.225516283335866E+01 VY= 4.463771559436948E+00 VZ= 1.614962197323810E+00
//LT= 2.580856001046699E+03 RG= 7.737211642978406E+08 RR=-6.349730892716933E-01


body.push({
	name: "599",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 1.26686531900e17,
	mass: 1898.13e+24,
	J2: 14736E-6,
	radiusEquator: 71492000, // [1 bar level]
	flattening: 0.06487,
	sidereal: 0.41353831018518519,

	rightAscension: 268.056595,
	declination: 64.495393,
	primeMeridian: 284.95,

	surfaceAirDensity: 0.16, // "surface" at 1 bar, not a real surface
	scaleHeight: 27000,

	map: "graphics/planet5_2k.jpg",
	color: 0xada396
});



// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X = 9.583853590115459E+08, Y = 9.237154716694124E+08, Z = 3.403008584790305E+08
 VX=-7.431212960083195E+00, VY= 6.110152325241220E+00, VZ= 2.842799235017410E+00
//LT= 4.582783973784185E+03 RG= 1.373884071983768E+09 RR=-3.715862595752621E-01


// 2459000.500000000 = A.D. 2020-May-31 00:00:00.0000 TDB 
//X = 6.758845926039357E+08 Y =-1.225678487134377E+09 Z =-5.353728050271363E+08
//VX= 8.098807185095518E+00 VY= 4.134236131926362E+00 VZ= 1.359735455021995E+00
//LT= 4.998713421704984E+03 RG= 1.498576583530528E+09 RR=-2.144372739713913E-01


body.push({
	name: "699",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 3.7931206234e16,
	mass: 5.6834e+26,
	J2: 16298E-6,
	radiusEquator: 60268000, // [1 bar level]
	flattening: 0.09796,
	sidereal: 10.656222222222222,

	rightAscension: 40.589,
	declination: 83.537,
	primeMeridian: 38.90,

	surfaceAirDensity: 0.19,
	scaleHeight: 59.5,

	map: "graphics/planet6_2k.jpg",
	ringsMap: "graphics/planet6rings_1k.png",
	ringsRadius: 140415 * 1000,
	color: 0xcfc0a2
});


// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X = 2.158975041926949E+09, Y =-1.870910936600815E+09, Z =-8.499686292784189E+08
 VX= 4.637273675667743E+00, VY= 4.262810644185866E+00, VZ= 1.801376988633542E+00
//LT= 9.942184157007585E+03 RG= 2.980591826317962E+09 RR= 1.695318155211761E-01

// 2459000.500000000 = A.D. 2020-May-31 00:00:00.0000 TDB 
//X = 2.374742857240990E+09 Y = 1.633720606186591E+09 Z = 6.819437397891679E+08
//VX=-4.108213054984245E+00 VY= 4.693626362353952E+00 VZ= 2.113512723289845E+00
//LT= 9.880196609054756E+03 RG= 2.962008426951790E+09 RR=-2.182906456086245E-01


body.push(
{
	name: "799",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 5.793951256e15,
	mass: 86.813e+24,
	J2: 3343.43E-6,
	radiusEquator: 25559000, // [1 bar level]
	flattening: 0.02293,
	sidereal: 17.24, // [hours] positive pole is below ICRF equator

	rightAscension: 257.311,
	declination: -15.175,
	primeMeridian: 203.81,

	surfaceAirDensity: 0.42,
	scaleHeight: 27.7,

	map: "graphics/planet7_1k.jpg",
	ringsMap: "graphics/planet7rings_512.png",
	ringsRadius: 51149 * 1000,
	color: 0x98afb7
});

// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X = 2.515046471488433E+09, Y =-3.437774106196779E+09, Z =-1.469713518152404E+09
 VX= 4.465275187591427E+00, VY= 2.888286548967659E+00, VZ= 1.071024490222010E+00
//LT= 1.503031351116156E+04 RG= 4.505974632021733E+09 RR=-6.058650977577493E-02
/*
// 2459000.500000000 = A.D. 2020-May-31 00:00:00.0000 TDB 
 X = 4.388897213219954E+09, Y =-7.767856116252367E+08, Z =-4.272247742589144E+08
 VX= 1.049326916193281E+00, VY= 4.978334278333246E+00, VZ= 2.011203650372552E+00
//LT= 1.493545505710293E+04 RG= 4.477536782917418E+09 RR=-2.701183494754109E-02
*/

body.push({
	name: "899",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 6.83509997e15,
	mass: 102.413e+24,
	J2: 3411E-6,
	radiusEquator: 24764000, // [1 bar level]
	flattening: 0.0171,
	sidereal: 16.11,

	rightAscension: 299.36,
	declination: 43.46,
	primeMeridian: 253.18,

	surfaceAirDensity: 0.45,
	scaleHeight: 19.7,

	map: "graphics/planet8_2k.jpg",
	color: 0x364fa7
});

// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-1.477331054174036E+09, Y =-4.185578316848303E+09, Z =-8.607382162350973E+08
 VX= 5.259869708473271E+00, VY=-1.939747281570943E+00, VZ=-2.204071939008186E+00
//LT= 1.508154021829966E+04 RG= 4.521332012469912E+09 RR= 4.966510408247889E-01

// 2459000.500000000 = A.D. 2020-May-31 00:00:00.0000 TDB 
// X = 2.008444000069832E+09 Y =-4.262377536827026E+09 Z =-1.935195748763971E+09
// VX= 5.125280648664118E+00 VY= 1.527076792847321E+00 VZ=-1.082148629054461E+00
//LT= 1.699105308079546E+04 RG= 5.093789567100144E+09 RR= 1.154156585715618E+00


body.push({
	name: "999",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 8.6996e11,
	mass: 1.307e+22,
	J2: 0.000047386359048791577, // rough est. based on lunar j2/sidereal ratio
	radiusEquator: 1188000,
	flattening: 0,
	sidereal: 153.29335198,

	rightAscension: 132.993,
	declination: -6.163,
	// 0 longitude on the map is the left edge, so add 180
	primeMeridian: 237.305 + 180,

	map: "graphics/planet9_2k.jpg",
	color: 0x967a63
});



////////////////////////////////////////////////////////////////////////////////

// moon geocentric kms frame
// 2021-01-01 12:00
 X =-2.415972771741238E+05, Y = 2.630988164221789E+05, Z = 1.432200852614276E+05
 VX=-7.683908247177773E-01, VY=-6.430498549296733E-01, VZ=-2.154173653923662E-01

// moon geocentric kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-2.916083849926414E+05, Y =-2.667168332421485E+05, Z =-7.610248593416973E+04
 VX= 6.435313864033421E-01, VY=-6.660876856217284E-01, VZ=-3.013257041854706E-01

moon = body.push({
	name: "301",
	focus: earth,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 4.902800066e12,
	mass: 7.349e+22,
	J2: 202.7E-6,
	radiusEquator: 1738100,
	flattening: 0.0012,
	sidereal: 655.728, // real data: 655.728
	tidallyLocked: true,

	rightAscension: 269.9949,
	declination: 66.5392,
	primeMeridian: 38.3213,
	
	segments: 64,
	map: "graphics/moon301_2k.jpg",
	//map: "graphics/moon301_1k.jpg",
	color: 0x969392
}) - 1;

// 401
// mass from https://web.archive.org/web/20131019162634/http://solarsystem.nasa.gov/planets/profile.cfm?Object=Mar_Phobos&Display=Facts

// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-1.989463946057447E+03, Y =-8.743034419032687E+03, Z =-3.181949969502783E+03
 VX= 1.843207370506235E+00, VY=-4.310475264969203E-02, VZ=-1.018331998843603E+00

moon401 = body.push({
	name: "401",
	focus: planet4,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 7.0765e5, // after 2013 flyby. published 2021-12-15 matsumoto
	mass: 1.0603e16, // matsumoto
	radiusEquator: 13.1e3,
	radiusPole: 9.3e3,
	radiusWest: 11.1e3,
	sidereal: 0.319 * 24,
	tidallyLocked: true,

	rightAscension: 317.68,
	declination: 52.90,
	primeMeridian: 35.06,

	map: "graphics/moon401_720x360.jpg",
	color: 0x9a8d84
}) - 1;

// 402
// mass from https://web.archive.org/web/20131019172735/http://solarsystem.nasa.gov/planets/profile.cfm?Object=Mar_Deimos&Display=Facts

// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X = 1.036430106515217E+04, Y =-1.574833981312149E+04, Z =-1.394599172365574E+04
 VX= 1.040923986869151E+00, VY= 8.434501190821236E-01, VZ=-1.789391669940932E-01

moon402 = body.push({
	name: "402",
	focus: planet4,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 96200, // viking 2
	mass: 1476188406600740,
	radiusEquator: 7.5e3,
	radiusPole: 5.2e3,
	radiusWest: 6.1e3,
	sidereal: 1.263 * 24,
	tidallyLocked: true,

	rightAscension: 316.65,
	declination: 53.52,
	primeMeridian: 79.41,

	map: "graphics/moon402_720x360.jpg",
	color: 0xb0aa9f
}) - 1;


// process natural celestial bodies
for (let i = body.length - 1; i > -1; i--) {
	//if (body[i].radiusEquator === undefined) continue;

	if (body[i].J2 === undefined) {
		body[i].J2 = 0;
	}

	body[i].rightAscension *= Math.PI / 180;
	body[i].declination *= Math.PI / 180;
	body[i].primeMeridian *= Math.PI / 180;

	body[i].angularVelocity = 1/(body[i].sidereal * 3600) * 2 * Math.PI;

	if (body[i].flattening === undefined) {
		if (body[i].radiusPole !== undefined) {
			body[i].flattening = (body[i].radiusEquator - body[i].radiusPole) /
				body[i].radiusEquator;
		} else {
			body[i].flattening = 0;
		}
	}
	body[i].e2 = 2 * body[i].flattening - body[i].flattening * body[i].flattening;

	if (body[i].radiusPole === undefined) {
		body[i].radiusPole = body[i].radiusEquator - (body[i].radiusEquator *
			body[i].flattening);
	}

	body[i].spun = Math.PI / 2 + body[i].primeMeridian;
	
	body[i].type = "Natural";


	if (body[i].segments === undefined) {
		body[i].segments = 32;
	}

/*
	// all this to get Sphere of Influence
	if (i === 0) body[0].radiusSoi = Infinity;
	else {
		let focus = body[i].focus;
		body[i].mu = GRAVITY * (body[focus].mass + body[i].mass);
		body[i].kepler = toKepler(body[i].cartes, body[i].mu);
		// assumes a is positive with e < 1 (not hyperbolic)
		body[i].radiusSoi = body[i].kepler.a *
			(body[i].mass / body[focus].mass)**(2/5);
	}
*/
}

} // end loadBodies()

/*
function idNaturalBodies() {
	for (let i = body.length; i > -1; i--) {
		if (body[i].name === "10") sun = i;
		else if (body[i].name === "399") earth = i;
		// etc...
	}
}
*/


////////////////////////////////////////////////////////////////////////////////
// noteworthy rocket vectors
/*
// LRO lunar reconnaisance orbiter geocentric kms frame
// 2021-01-01 12:00
 X =-2.428758379542803E+05, Y = 2.624529692028076E+05, Z = 1.420844359324639E+05
 VX=-1.249780236123540E+00, VY=-1.730644095414864E+00, VZ= 9.128278036423180E-01

// iss geocentric kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-2.090053014379185E+03, Y =-5.522904704730793E+03, Z =-3.284022270901603E+03
 VX= 4.179347954328617E+00, VY=-4.381007125368919E+00, VZ= 4.725905475733050E+00

// Intelsat-901 geocentric kms frame
// 2455198.000000000 = A.D. 2010-Jan-01 12:00:00.0000 TDB 
 X =-5.405605653409561E+03, Y =-4.180316246779086E+04, Z =-2.061177954249511E+00
 VX= 3.050274561890771E+00, VY=-3.943561492961989E-01, VZ=-3.098607080831567E-03

// Voyager 1
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
 X =-3.046470147980248E+09, Y =-1.071907829729028E+10, Z = 2.375878089046673E+09
 VX=-2.158004379031644E+00, VY=-1.674628408569401E+01, VZ= 3.691435233902702E+00

// intelsat hyperbolic test
 X =-5.405605653409561E+03, Y =-4.180316246779086E+04, Z =-2.061177954249511E+00
 VX= 5.050274561890771E+00, VY=-3.943561492961989E-01, VZ=-3.098607080831567E-03
*/

// custom test
// 2455198.000000000 = A.D. 2010-Jan-01 12:00:00.0000 TDB 
X =0, Y =0, Z =0;
VX=0, VY=0, VZ=0;


function addFalcon() {
	body.rocketCount++;
	const i = body.push({
		name: "f9" + "#" + String(body.rocketCount),
		focus: earth,
		mass: 549054,
		fuelMass: 411000,
		burnTime: 162,
		thrustVac: 8227000,
		thrustSea: 7607000,
		sidereal: null,
		xSpin: 0,
		ySpin: 0,
		zSpin: 0,
		rcs: true,
		throttleOn: false,
		throttle: 100,
		cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
			vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},
		drag: 0,
		dragCoefficient: 0.5,
		pointingV3: new THREE.Vector3(0, 1, 0), // loads y-up
		pointingM4: new THREE.Matrix4(),
		type: "Artificial",
		color: 0xe5e7e7,

		stage2: {
			name: "f9s2" + "#" + String(body.rocketCount),
			focus: earth,
			mass: 92670 + 3900,
			fuelMass: 92670,
			burnTime: 397,
			thrustVac: 981000,
			thrustSea: 845000,
			sidereal: null,
			xSpin: 0,
			ySpin: 0,
			zSpin: 0,
			rcs: true,
			throttleOn: false,
			throttle: 100,
			cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
				vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},
			drag: 0,
			dragCoefficient: 0.5,
			pointingV3: new THREE.Vector3(0, 1, 0), // loads y-up
			pointingM4: new THREE.Matrix4(),
			type: "Artificial",
			color: 0xe5e7e7,

			fairingN: {
				name: "fairingPZ" + "#" + String(body.rocketCount),
				focus: earth,
				mass: 100,
				fuelMass: 0,
				burnTime: 0,
				thrustVac: 0,
				thrustSea: 0,
				sidereal: null,
				xSpin: 0,
				ySpin: 0,
				zSpin: 0,
				throttleOn: false,
				throttle: 0,
				cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
					vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},
				drag: 0,
				dragCoefficient: 2.2,
				pointingV3: new THREE.Vector3(0, 1, 0), // loads y-up
				pointingM4: new THREE.Matrix4(),
				type: "Artificial",
				color: 0xe5e7e7,
			},

			fairingZ: {
				name: "fairingMZ" + "#" + String(body.rocketCount),
				focus: earth,
				mass: 100,
				fuelMass: 0,
				burnTime: 0,
				thrustVac: 0,
				thrustSea: 0,
				sidereal: null,
				xSpin: 0,
				ySpin: 0,
				zSpin: 0,
				throttleOn: false,
				throttle: 0,
				cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
					vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},
				drag: 0,
				dragCoefficient: 2.2,
				pointingV3: new THREE.Vector3(0, 1, 0), // loads y-up
				pointingM4: new THREE.Matrix4(),
				type: "Artificial",
				color: 0xe5e7e7,
			}
		}
	}) - 1;


	// launch from ground
	let focus = body[i].focus;






	// automatic tour
	if (deployLocation === "tour") {
		if (body.rocketCount === 1) deployLocation = "kourou";
		else if (body.rocketCount === 2) deployLocation = "boca";
		else if (body.rocketCount === 3) deployLocation = "kennedy";
		else if (body.rocketCount === 4) deployLocation = "baikonur";
		else deployLocation = "random";
	}

	if (deployLocation === "kourou") {
		// guiana space center, kourou, french guiana
		body[i].gps = {
			lat: 5.236 * Math.PI / 180,
			lon: -52.775 * Math.PI / 180,
			alt: 0  // actual unknown
		};
		camera.position.set(-200 * scale, 0 * scale, -350 * scale); // kourou
		camera.up.set(0.62, -0.5, 2); // kourou
	} else if (deployLocation === "boca") {
		// boca chica, texas
		body[i].gps = {
			lat: 25.997354305760496 * Math.PI / 180,
			lon: -97.15698039306052 * Math.PI / 180,
			alt: 0
		};
	} else if (deployLocation === "kennedy") {
		// kennedy launch pad 39a
		body[i].gps = {
			lat: 28.60838889 * Math.PI / 180,
			lon: -80.60444444 * Math.PI / 180,
			alt: 0
		};
	} else if (deployLocation === "baikonur") {
		// baikonur cosmodrome, kazakhstan
		body[i].gps = {
			lat: 45.92 * Math.PI / 180,
			lon: 63.342 * Math.PI / 180,
			alt: 0  // actually 90 meters, but this program doesn't have terrain yet
		};
	} else if (deployLocation === "custom") {
		//document.getElementById("customLat").value !== undefined &&
		//document.getElementById("customLon").value !== undefined) {
		let latDeg = document.getElementById("customLat").value;
		let lonDeg = document.getElementById("customLon").value;
		latDeg = parseFloat(latDeg);
		lonDeg = parseFloat(lonDeg);
		if (latDeg >= -90 && latDeg <= 90) {
			// ok
		} else {
			latDeg = 0;
		}
		if (lonDeg >= -180 && latDeg <= 180) {
			// ok
		} else {
			lonDeg = 0;
		}
		console.log("User requested location: " + latDeg + " and " + lonDeg);
		if (latDeg > 89.5) {
			latDeg = 89.5;
		} else if (latDeg < -89.5) {
			latDeg = -89.5;
		}
		console.log("Deploying at location: " + latDeg + " and " + lonDeg);
		body[i].gps = {
			lat: latDeg * Math.PI / 180,
			lon: lonDeg * Math.PI / 180,
			alt: 0
		};
	} else {
		body[i].gps = {
			lat: (Math.acos(Math.random() * 2 - 1) - Math.PI / 2),
			lon: (Math.random() * (180 - -180) + -180) * Math.PI / 180,
			alt: 0
		};
	}




/*
	if (body.rocketCount === 1) {
		// guiana space center, kourou, french guiana
		body[i].gps = {
			lat: 5.236 * Math.PI / 180,
			lon: -52.775 * Math.PI / 180,
			alt: 0  // actual unknown
		};
		camera.position.set(-200 * scale, 0 * scale, -350 * scale); // kourou
		camera.up.set(0.62, -0.5, 2); // kourou
	} else if (body.rocketCount === 2) {
		// boca chica, texas
		body[i].gps = {
			lat: 25.997354305760496 * Math.PI / 180,
			lon: -97.15698039306052 * Math.PI / 180,
			alt: 0
		};
	} else if (body.rocketCount === 3) {
		// kennedy launch pad 39a
		body[i].gps = {
			lat: 28.60838889 * Math.PI / 180,
			lon: -80.60444444 * Math.PI / 180,
			alt: 0
		};
	} else if (body.rocketCount === 4) {
		// baikonur cosmodrome, kazakhstan
		body[i].gps = {
			lat: 45.92 * Math.PI / 180,
			lon: 63.342 * Math.PI / 180,
			alt: 0  // actually 90 meters, but this program doesn't have terrain yet
		};
	} else {
		// anywhere
		body[i].gps = {
			//lat: (Math.random() * (90 - -90) + -90) * Math.PI / 180,
			lat: Math.acos(Math.random() * 2 - 1) - Math.PI / 2,
			lon: (Math.random() * (180 - -180) + -180) * Math.PI / 180,
			alt: 0
		};
	}
*/



	// convert to ecef then to cartes
	body[i].ecef = gpsToEcef(body[i].gps, body[focus].radiusEquator,
		body[focus].e2);
	body[i].cartesEci = ecefToEci(body[i].ecef, body[focus].spun,
		body[focus].angularVelocity, body[focus].radiusEquator, body[focus].e2);

	body[i].mu = GRAVITY * (body[focus].mass + body[i].mass);
	body[i].kepler = toKepler(body[i].cartesEci, body[i].mu);

	// not necessary for earth, but should be standard practice
	body[i].cartes = eciToIcrf(body[i].cartesEci,
		body[focus].rightAscension, body[focus].declination);


	// OVERWRITE PREVIOUS... do this instead..
/*
	// sputnik 1 orbit
	let aTemp = getAxis(947000, 228000, body[focus].radiusEquator);
	let eTemp = getEcc(947000, 228000, body[focus].radiusEquator);
	body[i].kepler = {
		a: aTemp,
		e: eTemp,
		i: 61 * Math.PI / 180,
		lan: 5 * Math.PI / 180,
		w: 5 * Math.PI / 180,
		meanAnom: 5 * Math.PI / 180
	}

	// high orbit
	let aTemp = getAxis(322000999, 418000999, body[focus].radiusEquator);
	let eTemp = getEcc(322000999, 418000999, body[focus].radiusEquator);
	body[i].kepler = {
		a: aTemp,
		e: eTemp,
		i: 20 * Math.PI / 180,
		lan: 12 * Math.PI / 180,
		w: 61 * Math.PI / 180,
		meanAnom: 146 * Math.PI / 180
	}

	// 401 orbit
	body[i].focus = 11;
	focus = 11;
	let aTemp = getAxis(300, 200, body[focus].radiusEquator);
	let eTemp = getEcc(300, 200, body[focus].radiusEquator);
	body[i].kepler = {
		a: aTemp,
		e: eTemp,
		i: 89.99 * Math.PI / 180,
		lan: 1 * Math.PI / 180,
		w: 1 * Math.PI / 180,
		meanAnom: 1 * Math.PI / 180
	}
*/
/*
	// zero testing
	body[i].focus = 3;
	focus = 3;
	let aTemp = getAxis(500000, 500000, body[focus].radiusEquator);
	let eTemp = getEcc(500000, 500000, body[focus].radiusEquator);
	body[i].kepler = {
		a: aTemp,
		e: eTemp,
		i: 0 * Math.PI / 180,
		lan: 0 * Math.PI / 180,
		w: 0 * Math.PI / 180,
		meanAnom: 0 * Math.PI / 180
	}

	body[i].mu = GRAVITY * (body[focus].mass + body[i].mass);
	body[i].cartesEci = toCartes(body[i].kepler, body[i].mu);
	body[i].ecef = eciToEcef(body[i].cartesEci,
		body[focus].spun,
		body[focus].angularVelocity,
		body[focus].radiusEquator, body[focus].e2);
	body[i].gps = ecefToGps(body[i].ecef, body[focus].radiusEquator,
		body[focus].e2);
	body[i].cartes = eciToIcrf(body[i].cartesEci, body[focus].rightAscension,
		body[focus].declination);
*/

	document.getElementById("hudFuel").innerHTML =
		body[i].fuelMass.toFixed(0) + "<br>kg fuel";
	return i;
} // end addFalcon()
