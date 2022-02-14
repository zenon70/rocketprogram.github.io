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

// jpl: jet propulsion laboratories via horizons web interface
// iau: international astronomical union 2009 report
// gsfc: goddard space flight center via nasa fact sheet
// all values of ra, dec, w(primeMeridian) from iau 2009 report
// mass in kg, distance in m, sidereal in hours, axial tilt in degrees

// sun ssb kms icrf frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB
X =-1.067598502264559E+06, Y =-3.959890535950128E+05, Z =-1.380711260212289E+05;
VX= 9.312570119052345E-03, VY=-1.170150735349599E-02, VZ=-5.251247980405208E-03;

sun = body.push({
	name: "10",
	focus: null,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 132712440041.93938e9, // jpl 2018-08-15
	mass: 1988500e+24, // jpl
	J2: -6.13e-7,

	radiusMean: 695700e3, // jpl volumetric
	radiusPhoto: 696500e3, // jpl photosphere
	radiusEquator: 696000e3, // iau
	flattening: 0.00005, // jpl

	sidereal: 25.38 * 24, // jpl
	rightAscension: 286.13,
	declination: 63.87,
	primeMeridian: 84.176,

	surfacePressure: 0.868, // nasafact top of photosphere mb
	surfaceTempK: 4400, // nasafact top of photosphere
	meanTempK: 5772, // jpl effective temp
	baseTempK: 6600, // nasafact bottom of photosphere

	map: "graphics/sun_1k.jpg",
	color: 0xffffff,
	emissive: 0xffffff
}) - 1;


// 199 sun-centric kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-1.946172639275932E+07, Y =-5.992796771076561E+07, Z =-2.999277272986019E+07;
VX= 3.699499188030234E+01, VY=-8.529675367206812E+00, VZ=-8.393121028781621E+00;

body.push({
	name: "199",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 22031.86855e9, // jpl
	mass: 3.302E+23, // jpl
	J2: 50.3e-6,

	//radiusMean: 2440e3, // jpl
	radiusMean: 2439.7e+3, // iau

	sidereal: 58.6463 * 24, // jpl
	rightAscension: 281.0097,
	declination: 61.4143,
	primeMeridian: 329.5469,

	meanTempK: 440, // jpl

	map: "graphics/planet1_2k.jpg",
	color: 0x848383
});

// 299
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-1.074564940489116E+08, Y =-6.922528830161016E+06, Z = 3.686187037221310E+06;
VX= 1.381906047920155E+00, VY=-3.201781843822535E+01, VZ=-1.449183545721332E+01;

body.push({
	name: "299",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 324858.592e9, // jpl
	mass: 48.685e+23, // jpl
	J2: 4.458E-6,

	radiusMean: 6051.8e3, // iau
	sidereal: 243.018484 * 24, // jpl

	rightAscension: 92.76,
	declination: -67.16,
	primeMeridian: 160.20 + 180, // iau defines neg as north. adding 180

	surfaceAirDensity: 65, // gsfc
	scaleHeight: 15900, // gsfc

	map: "graphics/planet2_2k.jpg",
	color: 0xe4bd7f
});


////////////////////////////////////////////////////////////////////////////////

// earth suncentric kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-2.649903375682292E+07, Y = 1.327574173547878E+08, Z = 5.755671839918904E+07;
VX=-2.979426006719171E+01, VY=-5.018052326235948E+00, VZ=-2.175393803476646E+00;

earth = body.push({
	name: "399",
	focus: sun,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 3.98600435436e14,
	mass: 5.9723e+24,
	J2: 1.08263e-3,

	radiusMean: 6371.0084e3, // iau
	radiusEquator: 6378137,
	flattening: 0.0033528106647,
	sidereal: 23.9344695944, // jpl

	rightAscension: 0,
	declination: 90,
	primeMeridian: 190.147,

	surfaceAirDensity: 1.217,
	scaleHeight: 8500,

	segments: 64,
	map: "graphics/planet3_1k.jpg",
	color: 0x419dd9
}) - 1;



////////////////////////////////////////////////////////////////////////////////
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X = 2.080481406481886E+08, Y = 2.096192809566167E+05, Z =-5.529162176566044E+06;
VX= 1.162672383641686E+00, VY= 2.391840970779204E+01, VZ= 1.093917189957652E+01;

planet4 = body.push({
	name: "499",
	focus: sun,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 4.2828375214e13,
	mass: 6.4171e+23,
	J2: 1960.45E-6,

	radiusMean: 3389.5e3, // iau
	radiusEquator: 3396200,
	flattening: 1/169.779,
	sidereal: 24.622962, // jpl

	rightAscension: 317.68143,
	declination: 52.88650,
	primeMeridian: 176.630,

	surfaceAirDensity: 0.02,
	scaleHeight: 11100,

	//segments: 48,
	map: "graphics/planet4_2k.jpg",
	color: 0xb76247
}) - 1;

// 599
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X = 5.985676246570733E+08, Y = 4.093863059842168E+08, Z = 1.608943268775537E+08;
VX=-7.909860298437398E+00, VY= 1.018357408916719E+01, VZ= 4.557755398163733E+00;
//LT= 2.477748886094049E+03 RG= 7.428104288688971E+08 RR= 2.258267630831523E-01;

// 2459001.000000000 = A.D. 2020-May-31 12:00:00.0000 TDB 
//X = 2.437414293329616E+08 Y =-6.727712214984925E+08 Z =-2.943016126910576E+08;
//VX= 1.225516283335866E+01 VY= 4.463771559436948E+00 VZ= 1.614962197323810E+00;
//LT= 2.580856001046699E+03 RG= 7.737211642978406E+08 RR=-6.349730892716933E-01;


let planet5 = body.push({
	name: "599",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 1.26686531900e17,
	mass: 1898.13e+24,
	J2: 14736E-6,

	radiusMean: 69911e3, // iau
	radiusEquator: 71492000, // [1 bar level]
	flattening: 0.06487,
	sidereal: 9.92491944, // jpl

	rightAscension: 268.056595,
	declination: 64.495393,
	primeMeridian: 284.95,

	surfaceAirDensity: 0.16, // "surface" at 1 bar, not a real surface
	scaleHeight: 27000,

	map: "graphics/planet5_2k.jpg",
	color: 0xada396
}) - 1;



// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X = 9.583853590115459E+08, Y = 9.237154716694124E+08, Z = 3.403008584790305E+08;
VX=-7.431212960083195E+00, VY= 6.110152325241220E+00, VZ= 2.842799235017410E+00;
//LT= 4.582783973784185E+03 RG= 1.373884071983768E+09 RR=-3.715862595752621E-01;


// 2459000.500000000 = A.D. 2020-May-31 00:00:00.0000 TDB 
//X = 6.758845926039357E+08 Y =-1.225678487134377E+09 Z =-5.353728050271363E+08;
//VX= 8.098807185095518E+00 VY= 4.134236131926362E+00 VZ= 1.359735455021995E+00;
//LT= 4.998713421704984E+03 RG= 1.498576583530528E+09 RR=-2.144372739713913E-01;


let planet6 = body.push({
	name: "699",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 3.7931206234e16,
	mass: 5.6834e+26,
	J2: 16298E-6,

	radiusMean: 58232e3, // iau
	radiusEquator: 60268000, // [1 bar level]
	flattening: 0.09796,
	sidereal: 10.656222222222222, // jpl

	rightAscension: 40.589,
	declination: 83.537,
	primeMeridian: 38.90,

	surfaceAirDensity: 0.19,
	scaleHeight: 59500,

	map: "graphics/planet6_2k.jpg",
	ringsMap: "graphics/planet6rings_1k.png",
	ringsRadius: 140415 * 1000,
	color: 0xcfc0a2
}) - 1;


// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X = 2.158975041926949E+09, Y =-1.870910936600815E+09, Z =-8.499686292784189E+08;
VX= 4.637273675667743E+00, VY= 4.262810644185866E+00, VZ= 1.801376988633542E+00;
//LT= 9.942184157007585E+03 RG= 2.980591826317962E+09 RR= 1.695318155211761E-01;

// 2459000.500000000 = A.D. 2020-May-31 00:00:00.0000 TDB 
//X = 2.374742857240990E+09 Y = 1.633720606186591E+09 Z = 6.819437397891679E+08;
//VX=-4.108213054984245E+00 VY= 4.693626362353952E+00 VZ= 2.113512723289845E+00;
//LT= 9.880196609054756E+03 RG= 2.962008426951790E+09 RR=-2.182906456086245E-01;


let planet7 = body.push(
{
	name: "799",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 5.793951256e15,
	mass: 86.813e+24,
	J2: 3343.43E-6,

	radiusMean: 25362e3, // iau
	radiusEquator: 25559000, // [1 bar level]
	flattening: 0.02293,
	sidereal: 17.24, // [hours] positive pole is below ICRF equator

	rightAscension: 257.311,
	declination: -15.175,
	primeMeridian: 203.81,

	surfaceAirDensity: 0.42,
	scaleHeight: 27700,

	map: "graphics/planet7_1k.jpg",
	ringsMap: "graphics/planet7rings_512.png",
	ringsRadius: 51149 * 1000,
	color: 0x98afb7
}) - 1;

// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X = 2.515046471488433E+09, Y =-3.437774106196779E+09, Z =-1.469713518152404E+09;
VX= 4.465275187591427E+00, VY= 2.888286548967659E+00, VZ= 1.071024490222010E+00;
//LT= 1.503031351116156E+04 RG= 4.505974632021733E+09 RR=-6.058650977577493E-02;
/*
// 2459000.500000000 = A.D. 2020-May-31 00:00:00.0000 TDB 
X = 4.388897213219954E+09, Y =-7.767856116252367E+08, Z =-4.272247742589144E+08;
VX= 1.049326916193281E+00, VY= 4.978334278333246E+00, VZ= 2.011203650372552E+00;
//LT= 1.493545505710293E+04 RG= 4.477536782917418E+09 RR=-2.701183494754109E-02;
*/

let planet8 = body.push({
	name: "899",
	focus: 0,
	cartes: {x:X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 6.83509997e15,
	mass: 102.413e+24,
	J2: 3411E-6,

	radiusMean: 24622e3, // iau
	radiusEquator: 24764000, // [1 bar level]
	flattening: 0.0171,
	sidereal: 16.11,

	rightAscension: 299.36,
	declination: 43.46,
	primeMeridian: 253.18,

	surfaceAirDensity: 0.45,
	scaleHeight: 19700,

	map: "graphics/planet8_2k.jpg",
	color: 0x364fa7
}) - 1;

// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-1.477331054174036E+09, Y =-4.185578316848303E+09, Z =-8.607382162350973E+08;
VX= 5.259869708473271E+00, VY=-1.939747281570943E+00, VZ=-2.204071939008186E+00;
//LT= 1.508154021829966E+04 RG= 4.521332012469912E+09 RR= 4.966510408247889E-01;

// 2459000.500000000 = A.D. 2020-May-31 00:00:00.0000 TDB 
//X = 2.008444000069832E+09 Y =-4.262377536827026E+09 Z =-1.935195748763971E+09;
//VX= 5.125280648664118E+00 VY= 1.527076792847321E+00 VZ=-1.082148629054461E+00;
//LT= 1.699105308079546E+04 RG= 5.093789567100144E+09 RR= 1.154156585715618E+00;


let planet9 = body.push({
	name: "999",
	focus: 0,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 8.6996e11,
	mass: 1.307e+22,

	radiusMean: 1195e3, // iau
	//radiusEquator: 1188000,

	sidereal: 153.29335198,

	rightAscension: 132.993,
	declination: -6.163,
	// 0 longitude on the map is the left edge, so add 180
	primeMeridian: 237.305 + 180,

	surfaceAirDensity: 0.000079174,
	scaleHeight: 50000,

	map: "graphics/planet9_2k.jpg",
	color: 0x967a63
}) - 1;



////////////////////////////////////////////////////////////////////////////////
/*
// moon local geocentric icrf kms frame
// 2021-01-01 12:00
X =-2.415972771741238E+05, Y = 2.630988164221789E+05, Z = 1.432200852614276E+05;
VX=-7.683908247177773E-01, VY=-6.430498549296733E-01, VZ=-2.154173653923662E-01;
*/
// moon local geocentric icrf kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-2.916083849926414E+05, Y =-2.667168332421485E+05, Z =-7.610248593416973E+04;
VX= 6.435313864033421E-01, VY=-6.660876856217284E-01, VZ=-3.013257041854706E-01;

moon = body.push({
	name: "301",
	focus: earth,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 4.902800066e12,
	mass: 7.349e+22,
	J2: 202.7e-6,

	radiusMean: 1737.4e3, // iau
	radiusEquator: 1738100,
	flattening: 0.0012,

	sidereal: 655.728,
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
// local icrf frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-1.989463946057447E+03, Y =-8.743034419032687E+03, Z =-3.181949969502783E+03;
VX= 1.843207370506235E+00, VY=-4.310475264969203E-02, VZ=-1.018331998843603E+00;

moon401 = body.push({
	name: "401",
	focus: planet4,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 7.0765e5, // matsumoto: after 2013 flyby. published 2021-12-15
	mass: 1.0603e16, // matsumoto

	radiusMean: 11.08, // iau
	radiusEquator: 13.0e3, // iau
	radiusPole: 9.1e3, // iau
	radiusWest: 11.1e3,
	sidereal: 0.319 * 24,
	tidallyLocked: true,

	rightAscension: 317.68,
	declination: 52.90,
	primeMeridian: 35.06,
	
	segments: 32,
	map: "graphics/moon401_720x360.jpg",
	color: 0x9a8d84
}) - 1;

// 402
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X = 1.036430106515217E+04, Y =-1.574833981312149E+04, Z =-1.394599172365574E+04;
VX= 1.040923986869151E+00, VY= 8.434501190821236E-01, VZ=-1.789391669940932E-01;

moon402 = body.push({
	name: "402",
	focus: planet4,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 96200, // viking 2
	mass: 1476188406600740,

	radiusMean: 6.2e3, // iau
	radiusEquator: 7.8e3, // iau
	radiusPole: 5.1e3, // iau
	radiusWest: 6.1e3,
	sidereal: 1.263 * 24,
	tidallyLocked: true,

	rightAscension: 316.65,
	declination: 53.52,
	primeMeridian: 79.41,
	
	segments: 32,
	map: "graphics/moon402_720x360.jpg",
	color: 0xb0aa9f
}) - 1;


// 501
//2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X = 3.997142363295730E+05, Y = 1.143582337934756E+05, Z = 6.120266694087301E+04;
VX=-5.397081715786772E+00, VY= 1.496898532269375E+01, VZ= 7.040742588937143E+00;


body.push({
	name: "501",
	focus: planet5,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 5959.9155e9,
	mass: 89.32e21,

	radiusMean: 1821.49e3, // jpl & iau
	radiusEquator: 1829.4e3, // iau
	radiusPole: 1815.7e3, // iau
	sidereal: 1.77 * 24,
	tidallyLocked: true,

	rightAscension: 268.05,
	declination: 64.50,
	primeMeridian: 200.39,

	map: "graphics/moon501_1024.jpg",
	color: 0xac9e62
});

// 502
//2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-5.612444737473305E+05, Y =-3.194938652420691E+05, Z =-1.580864244536325E+05;
VX= 7.462294847234357E+00, VY=-1.063755742098116E+01, VZ=-4.848776619880565E+00;

body.push({
	name: "502",
	focus: planet5,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm:  3202.7121e9,
	mass: 48e21,

	radiusMean: 1560.8e3, // jpl & iau
	radiusEquator: 1562.6e3, // iau
	radiusPole: 1559.5e3, // iau

	sidereal: 3.55 * 24,
	tidallyLocked: true,

	rightAscension: 268.08,
	declination: 64.51,
	primeMeridian: 36.022,

	map: "graphics/moon502_1440.jpg",
	color: 0xcec5ab
});


// 503
// 503 relative to 500@599 local, and icrf frame.. correct!
//2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-8.213450948603005E+05, Y =-6.150856733875166E+05, Z =-3.043381213722880E+05;
VX= 6.987637098645384E+00, VY=-7.557915765882209E+00, VZ=-3.527820805670810E+00;


body.push({
	name: "503",
	focus: planet5,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 9887.8328e9,
	mass: 1.4819e23,

	radiusMean: 2631.2e3, // iau
	sidereal: 7.155 * 24,
	tidallyLocked: true,

	rightAscension: 268.20,
	declination: 64.57,
	primeMeridian: 44.064,

	// thin oxygen atmosphere

	map: "graphics/moon503_1800.jpg",
	color: 0x867a6b
});

//2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X = 3.250797306331359E+05, Y = 1.673657388398113E+06, Z = 7.961980648559552E+05;
VX=-8.072972273722810E+00, VY= 1.381786782005837E+00, VZ= 5.353865241984859E-01;


body.push({
	name: "504",
	focus: planet5,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 7179.2834e9,
	mass: 107.6e21,

	radiusMean: 2410.3e3, // iau & jpl

	sidereal: 16.691 * 24,
	tidallyLocked: true,

	rightAscension: 268.72,
	declination: 64.83,
	primeMeridian: 259.51,

	map: "graphics/moon504_1024.jpg",
	color: 0x7c6e57
});


//2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-9.468029384488795E+05, Y = 8.240982253187533E+05, Z = 2.708223040694325E+04;
VX=-3.561343519356833E+00, VY=-4.045247016129760E+00, VZ= 5.842850270130896E-01;

body.push({
	name: "606",
	focus: planet6,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 8978.14e9,
	mass: 134.5e21,

	radiusMean: 2574.73e3, // iau
	radiusEquator: 2575.15e3, // iau subplanet
	radiusPole: 2574.47e3, // iau
	//radiusMean: 2575.5e3, // nasa mean radius

	sidereal: 15.945421 * 24, // jpl orbital period. britannica confirms synchr.
	tidallyLocked: true,

	rightAscension: 39.4827,
	declination: 83.4279,
	primeMeridian: 186.5855,

	surfaceAirDensity: 1.813, // wikipedia: est 1.48x earth due to 1.48x pressure
	scaleHeight: 32500, // wikipedia 15-50km averaged

	//segments: 32,
	map: "graphics/moon606_1024.jpg",
	//color: 0xc28226 // surface color used to colorize image
	color: 0xc5aa58 // atmosphere color
}) - 1;


// 801
//2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-2.056859098669719E+05, Y = 1.000801046762462E+04, Z = 2.888777868159909E+05;
VX= 2.990459061974825E+00, VY= 2.480478871793398E+00, VZ= 2.043322978505724E+00;

body.push({
	name: "801",
	focus: planet8,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 1428.495e9,
	mass: 21.39e21,

	radiusMean: 1352.6e3, // jpl & iau mean

	sidereal: -5.876854 * 24, // NEGATIVE VALUE!!! WEST IS EASY LAUNCH DIR.
	tidallyLocked: true,

	rightAscension: 299.36,
	declination: 41.17,
	primeMeridian: 296.53,

	map: "graphics/moon801_1024.jpg",
	color: 0xaba9ae
});



// moon template
/*
body.push({
	name: "000",
	focus: planet000,
	cartes: {x: X * 1000, y: Y * 1000, z: Z * 1000,
		vx: VX * 1000, vy: VY * 1000, vz: VZ * 1000},

	gm: 000e9,
	mass: 000,
	J2: 000,
	radiusEquator: 000,
	radiusPole: 000,
	sidereal: 000 * 24,
	tidallyLocked: true,

	rightAscension: 000,
	declination: 000,
	primeMeridian: 000,
	surfaceAirDensity: 000,
	scaleHeight: 000,


	map: "graphics/moon000_1024.jpg",
	color: 0x000000
});
*/


// process natural celestial bodies
for (let i = body.length - 1; i > -1; i--) {
	//if (body[i].radiusEquator === undefined) continue;

	body[i].rightAscension *= Math.PI / 180;
	body[i].declination *= Math.PI / 180;
	body[i].primeMeridian *= Math.PI / 180;

	body[i].angularVelocity = 1/(body[i].sidereal * 3600) * 2 * Math.PI;

	if (body[i].radiusEquator === undefined) {
		body[i].radiusEquator = body[i].radiusMean;
	}

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

	// if no accurate data, automatically add J2 via crude wikipedia formula
	// formula accurate for earth-like bodies, not 599-like fast spinners
	if (body[i].J2 === undefined) {
		body[i].J2 = 2 * body[i].flattening / 3 -
			body[i].radiusEquator**3 *
			(body[i].angularVelocity * body[i].angularVelocity) /
			(3 * body[i].gm);
	}

	body[i].spun = Math.PI / 2 + body[i].primeMeridian;
	
	body[i].type = "Natural";

	if (body[i].segments === undefined) {
		body[i].segments = 64;
	}
}
} // end loadBodies()


/*
// this is a VERY inaccurate formula
function getScaleHeight(tempKelvin, mass, meanRadius, GRAVITY) {
	//const k = 1.38e-23; // boltz constant
	// m is mean molecular mass
	// H is scale height. nasa says 8.5km for earth
	//const H = ( k * T ) / ( m * g );
	//return (k * tempKelvin) / (meanMolecularMass * g);

	if (GRAVITY === undefined) {
		GRAVITY = 6.6743e-11; // 2018 codata
	}
	// molar gas constant from 2018 codata
	const R = 8.31446261815324;

	//const g = 9.80665; // for earth
	const g = GRAVITY * (mass / (meanRadius * meanRadius));

	// this gives 243.1116589644915 for earth, which is ~35x less... 
	let pre = R * tempKelvin / g;

	return pre * 34.96335813841613;
}
*/


/*
	// get Sphere of Influence
	if (i === 0) body[0].radiusSoi = Infinity;
	else {
		let focus = body[i].focus;
		body[i].kepler = toKepler(body[i].cartes, body[focus].gm);
		// assumes a is positive with e < 1 (not hyperbolic)
		body[i].radiusSoi = body[i].kepler.a *
			(body[i].mass / body[focus].mass)**(2/5);
	}
*/


/*
function idNaturalBodies() {
	for (let i = body.length; i > -1; i--) {
		if (body[i].name === "10") sun = i;
		else if (body[i].name === "399") earth = i;
		// etc...
	}
}
*/


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





////////////////////////////////////////////////////////////////////////////////
// noteworthy rocket vectors
/*
// LRO lunar reconnaisance orbiter geocentric kms frame
// 2021-01-01 12:00
X =-2.428758379542803E+05, Y = 2.624529692028076E+05, Z = 1.420844359324639E+05;
VX=-1.249780236123540E+00, VY=-1.730644095414864E+00, VZ= 9.128278036423180E-01;

// iss geocentric kms frame
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-2.090053014379185E+03, Y =-5.522904704730793E+03, Z =-3.284022270901603E+03;
VX= 4.179347954328617E+00, VY=-4.381007125368919E+00, VZ= 4.725905475733050E+00;

// Intelsat-901 geocentric kms frame
// 2455198.000000000 = A.D. 2010-Jan-01 12:00:00.0000 TDB 
X =-5.405605653409561E+03, Y =-4.180316246779086E+04, Z =-2.061177954249511E+00;
VX= 3.050274561890771E+00, VY=-3.943561492961989E-01, VZ=-3.098607080831567E-03;

// Voyager 1
// 2451545.000000000 = A.D. 2000-Jan-01 12:00:00.0000 TDB 
X =-3.046470147980248E+09, Y =-1.071907829729028E+10, Z = 2.375878089046673E+09;
VX=-2.158004379031644E+00, VY=-1.674628408569401E+01, VZ= 3.691435233902702E+00;

// intelsat hyperbolic test
X =-5.405605653409561E+03, Y =-4.180316246779086E+04, Z =-2.061177954249511E+00;
VX= 5.050274561890771E+00, VY=-3.943561492961989E-01, VZ=-3.098607080831567E-03;
*/

// custom test
// 2455198.000000000 = A.D. 2010-Jan-01 12:00:00.0000 TDB 
X =0, Y =0, Z =0;
VX=0, VY=0, VZ=0;


function addFalcon() {
	body.rocketCount++;
	const i = body.push({
		name: "f9s1" + "#" + String(body.rocketCount),
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
				name: "f9fn" + "#" + String(body.rocketCount),
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
				name: "f9fz" + "#" + String(body.rocketCount),
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
		else if (body.rocketCount === 4) deployLocation = "mahia";
		else if (body.rocketCount === 5) deployLocation = "baikonur";
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
	} else if (deployLocation === "mahia") {
		// Rocket Lab LC1, Māhia, New Zealand
		body[i].gps = {
			lat: -39.261500 * Math.PI / 180,
			lon: 177.864876 * Math.PI / 180,
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
		let latDeg = document.getElementById("customLat").value;
		let lonDeg = document.getElementById("customLon").value;
		let customBody = document.getElementById("customBody").value;
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
		console.log(
			"Deploy request: " + latDeg + ", " + lonDeg + " @" + customBody
		);
		for (let j = body.length - 1; j > -1; j--) {
			if (body[j].type === "Natural" && body[j].name === customBody) {
				body[i].focus = j;
				focus = j;
				break;
			}
		}
		if (latDeg > 89.5) {
			latDeg = 89.5;
		} else if (latDeg < -89.5) {
			latDeg = -89.5;
		}
		console.log(
			"Deploying at: " + latDeg + ", " + lonDeg + " @" + customBody
		);
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

	// offset due to origin currently being in the center of stage 1
	//body[i].gps.alt = 20;



	// convert to ecef then to cartes
	body[i].ecef = gpsToEcef(body[i].gps, body[focus].radiusEquator,
		body[focus].e2);
	body[i].cartesEci = ecefToEci(body[i].ecef, body[focus].spun,
		body[focus].angularVelocity, body[focus].radiusEquator, body[focus].e2);

	body[i].kepler = toKepler(body[i].cartesEci, body[focus].gm);

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

	body[i].cartesEci = toCartes(body[i].kepler, body[focus].gm);
	body[i].ecef = eciToEcef(body[i].cartesEci,
		body[focus].spun,
		body[focus].angularVelocity,
		body[focus].radiusEquator, body[focus].e2);
	body[i].gps = ecefToGps(body[i].ecef, body[focus].radiusEquator,
		body[focus].e2);
	body[i].cartes = eciToIcrf(body[i].cartesEci, body[focus].rightAscension,
		body[focus].declination);
*/

	return i;
} // end addFalcon()
