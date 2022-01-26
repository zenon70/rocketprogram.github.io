"use strict";
// revision 62
// return values are not accurate for distances or velocities ~0
// hyperbolic results beyond maxIterations will output NaN values

// ap and pe here are apoapsis and periapsis above mean sea level
// this is a convenience function so users can describe an orbit and get it
function getAxis(ap, pe, msl) {
	return ((ap + msl) + (pe + msl) ) / 2;
}
function getEcc(ap, pe, msl) {
	return 1 - 2 / ((ap + msl)/(pe + msl) + 1);
}

// convert Cartesian State Vectors to Keplerian Orbital Elements
function toKepler(cartes, mu) {
	let {x, y, z, vx, vy, vz} = cartes;

	// distance and speed
	let r = Math.hypot(x, y, z);
	let v = Math.hypot(vx, vy, vz);

	// radial velocity
	// if > 0, spacecraft is flying away from perigee
	// if < 0, spacecraft is flying toward perigee
	let vRadial = (x*vx + y*vy + z*vz) / r;

	// specific angular momentum
	let hx = y*vz - z*vy;
	let hy = z*vx - x*vz;
	let hz = x*vy - y*vx;

	// magnitude of the specific angular momentum
	let h = Math.hypot(hx, hy, hz);

	// inclination
	let i = Math.acos(hz/h);
	if (isNaN(i)) {
		i = 0;
	}

	// define node line, calculate magnitude
	//let nx = 0 * hz - 1 * hy; // simplified: use -hy in place of nx
	//let ny = 1 * hx - 0 * hz; // simplified: use hx in place of ny
	//let nz = 0 * hy - 0 * hx; // simplified: use 0 in place of nz
	//let n = Math.hypot(nx, ny, nz);
	// simplified
	let n = Math.hypot(hy, hx); // use hy not -hy because squared = positive

	// longitude of the ascending node (also known as RAAN or Node)
	let lan = 0;
	if (n !== 0) {
		lan = Math.acos(-hy/n);
		if (hx < 0) {
			lan = 2 * Math.PI - lan;
		}
	} else {
		lan = 0;
	}

	// eccentricity
	let ex = 1/mu * ((v*v - mu/r) * x - r * vRadial * vx);
	let ey = 1/mu * ((v*v - mu/r) * y - r * vRadial * vy);
	let ez = 1/mu * ((v*v - mu/r) * z - r * vRadial * vz);
	//let e = Math.hypot(ex, ey, ez);
	// sample output: 0.17121234628445342

	// eccentricity (depending only on the scalars obtained thus far)
	// this procedure is being chosen because it generates a lower number than the
	//   other procedures. Lower is safer (and more accurate) for ~0 velocities.
	//   This will help to avoid an ~0 velocity ellipse of 0.999... producing
	//   an eccentricity value > 1, which would be a catastrophic failure.
	let e = Math.sqrt(1 + h*h/(mu*mu) * (v*v - 2*mu/r));
	// sample output: 0.17121234628445206

	// eccentricity (using semi-major axis)
	//let aAlternative = 1 / (2/r - v*v/mu);
	//let eTest2 = Math.sqrt(1 - (h*h / mu) / aAlternative);
	// sample output: 0.1712123462844524

	// textbook custom atan2 procedure: must return between 0 and 2 * Math.PI
	function atan2_in_range(y, x) {
		let t = 0;
		if (x === 0) {
			if (y === 0) {
				t = 0;
			} else if (y > 0) {
				t = Math.PI / 2;
			} else {
				t = Math.PI * 1.5;
			}
		} else if (x > 0) {
			if (y >= 0) {
				t = Math.atan(y/x);
			} else {
				t = Math.atan(y/x) + 2 * Math.PI;
			}
		} else if (x < 0) {
			if (y === 0) {
				t = Math.PI;
			} else {
				t = Math.atan(y/x) + Math.PI;
			}
		}
		return t;
	}

	// argument of periapsis/pericenter/perigee/perihelion, etc. (lowercase omega)
	let w = 0;
	if (n !== 0) {
		// why 1e-10 instead of 0 or Number.EPSILON or 1e-14 or 1e-12?
		if (e > 1e-10) {
			// use safety to correct floating point errors and avoid failure
			let wSafety = (-hy*ex + hx*ey) / (n*e);
			if (wSafety < -1) {
				wSafety = -1;
			} else if (wSafety > 1) {
				wSafety = 1;
			}
			w = Math.acos(wSafety);
			if (ez < 0) {
				w = 2 * Math.PI - w;
			}      
		} else {
			// consider the orbit circular. argument of periapsis shall equal zero.
			w = 0;
		}
	} else {
		// without i, and therefore no LAN/RAAN, w is "strictly undefined"
		//w = 0;
		// however, i still need to define it...
		// wikipedia gives a formula with atan2, but it needs to be in range
		// equatorial orbit: define by vernal point, in direction of motion
		w = atan2_in_range(ey, ex);
		if (hz < 0) {
			w = 2 * Math.PI - w;
		}
	}
	// final correction
	if (w === 2 * Math.PI) {
		w = 0;
	}

	// true anomaly (often notated as "theta")
	let truAnom = 0;
	// why 1e-10 instead of 0 or Number.EPSILON or 1e-14 or 1e-12?
	if (e > 1e-10) {
		// use safety to correct floating point errors and avoid failure
		let taSafety = (ex*x + ey*y + ez*z) / (e*r);
		if (taSafety < -1) {
			taSafety = -1;
		} else if (taSafety > 1) {
			taSafety = 1;
		}
		truAnom = Math.acos(taSafety);
		//truAnom = Math.acos((ex*x + ey*y + ez*z) / (e*r));

		if (vRadial < 0) {
			truAnom = 2*Math.PI - truAnom;
		}
	} else {
		if (-hy*y - hx*x >= 0) {
			truAnom = Math.acos(-hy*x + hx*y / (n*r));
		} else {
			truAnom = 2*Math.PI - Math.acos(-hy*x + hx*y / (n*r));
		}
	}
	// don't use 0 or 360, just use 0
	if (truAnom === 2 * Math.PI) {
		truAnom = 0;
	}

	// periapsis. minimum distance from center of mass, NOT from mean sea level
	let periapsis = h*h / mu * (1 / (1 + e));

	// don't calculate parabolas. instead, change e to be hyperbolic or elliptical
	if (e === 1) {
		//if (Math.random() >= 0.5) {
		//  e += Number.EPSILON;
		//} else {
		// ALWAYS GO MINUS TO AVOID COMPLETE MALFUNCTION IN CASE OF ~0 VELOCITY
			e -= Number.EPSILON;
		//}
	}

	//let period;
	let a, apoapsis, eAnom, meanAnom;
	if (e < 1) {
		// ELLIPSE OR CIRCLE ONLY

		apoapsis = h*h / mu * (1 / (1 - e)); // maximum distance from center of mass
		a = 0.5 * (periapsis + apoapsis);
		//a = h*h / mu / (1 - e*e); // alternative way to get semimajor axis
		//b = Math.sqrt(1 - e*e); // semiminor axis, which i don't need

		//period = 2*Math.PI / Math.sqrt(mu) * a**(3/2);

		// rene schwarz paper shows kepler's equation for mean anomaly
		// ONLY WORKS FOR ELLIPSE, NOT PARABOLA OR HYPERBOLA
		eAnom = 2 * Math.atan(Math.tan(truAnom / 2) / Math.sqrt((1+e) / (1-e)));
		// don't let it go negative, put it in range (only intended for ellipse)
		if (eAnom < 0) {
			eAnom += 2 * Math.PI;
		}

		// dependent on elliptical eAnom, obviously
		meanAnom = eAnom - e * Math.sin(eAnom);


		// don't let it go negative, put it in range (only intended for ellipse)
		if (meanAnom < 0) {
			meanAnom += 2 * Math.PI;
		}


	} else if (e > 1) {
		// HYPERBOLA ONLY

		// set variables according to logic
		apoapsis = Infinity;
		//period = Infinity;

		// using a as a positive number (not negtaive for a universal variable)
		//a = h*h / mu / (e*e - 1);
		//b = Math.sqrt(e*e - 1); // i don't need semiminor axis

		// a < 0 for a hyperbola, "universal variable", compatible with nasa
		a = h*h / mu / (1 - e*e);

		// this will give F (hyperbolic eccentric anomaly), not E
		eAnom = 2 * Math.atanh(Math.sqrt((e-1) / (e+1)) * Math.tan(truAnom/2));

		// this is hyperbolic M, sometimes written with a dash above the M.
		meanAnom = e * Math.sinh(eAnom) - eAnom;
	}

	// if hyperbolic: a (semimajor axis) will return positive, while apoapsis and
	//     period will return "Infinity"
	return {a, e, i, lan, w, meanAnom, truAnom, v, periapsis, apoapsis};
}


// convert Keplerian Orbital Elements to Cartesian State Vectors
function toCartes(kepler, mu) {
	let {a, e, i, lan, w, meanAnom} = kepler;

	// don't calculate parabolas. instead, change e to be hyperbolic or elliptical
	if (e === 1) {
		//if (Math.random() >= 0.5) {
		//  e += Number.EPSILON;
		//} else {
		// ALWAYS GO MINUS TO AVOID COMPLETE MALFUNCTION IN CASE OF ~0 VELOCITY
			e -= Number.EPSILON;
		//}
	}

	// solve kepler's equation for elliptical (and circular), or hyperbolic
	// requires: meanAnom, e (kepler's equation: solve for eccentric anomaly)
	// requires: a, e, mu (for h)
	let eAnom,
			truAnom,
			h,
			ratio = 1, // start at 1, go down to tolerance or lower

			// error tolerance. 1e-6 is coarse. 0 is fine
			// 0 will not work for hyperbolas, nor will 1e-16, which is JavaScript's
			// maximum fidelity. 1e-15 is maximum precision without integrating a
			// special big number library
			tolerance = 1e-14,

			// for ellipse, should converge to perfect in about 3-5 tries
			// for hyperbola, will reach max with respect to distance
			iterations = 0,

			// safety check. more than ~7 is virtually impossible
			// unless it's a hyperbola, then it will increase infinitely with respect
			// to distance. when max is reached, the physics simulation will break,
			// and it will go super fast, and the numbers it returns will cause NaN
			// and null values, possibly crashing the entire program.
			//
			// therefore, it is necessary to have a catch so that when
			// max is reached, something else happens, like the orbit is defined by
			// another body (i.e., the sun), or else does not use kepler's equations
			// at all, but instead just use a simple rectilinear equation, virtually
			// making it 100% asymptotic.
			//
			// RESULTS BEYOND MAX ITERATIONS WILL RESULT IN NaN OUTPUT
			maxIterations = 9999; 
	if (e < 1) {
		// ELLIPSE OR CIRCLE
		// set up kepler's equation with a good starting value
		if (meanAnom < Math.PI) {
			eAnom = meanAnom + e/2; // eccentric anomaly is known as E when elliptical
		} else {
			eAnom = meanAnom - e/2;
		}
		// kepler's equation for elliptical orbits, and prevent an infinite loop
		while (Math.abs(ratio) > tolerance && iterations < maxIterations) {
			ratio = (eAnom - e * Math.sin(eAnom) - meanAnom) /
					(1 - e * Math.cos(eAnom));
			eAnom -= ratio;
			iterations++;
		}
		// source: rene schwarz paper. requires: e, eAnom
		truAnom = 2 * Math.atan2(Math.sqrt(1+e) * Math.sin(eAnom/2),
				Math.sqrt(1-e) * Math.cos(eAnom/2));
		// specific relative angular momentum for an ellipse/circle
		h = Math.sqrt((1 - e*e) * a * mu);
	} else {
		// HYPERBOLIC
		// eccentric anomaly is known as F when hyperbolic

		/*
			The maximum meanAnom in radians before Infinity is:
			The maximum number Math.sinh can compute (before Infinity output) is:
			Math.sinh(710.475860073943920269812224432826...) =
			Math.sinh(710.4758600739439) = 1.7976931348621744e+308
		*/
		// unreliable initial value
		//eAnom = meanAnom;

		// reliable initial value
		eAnom = Math.PI;

		// kepler's equation for hyperbolic orbits, and prevent an infinite loop
		while (Math.abs(ratio) > tolerance && iterations < maxIterations) {
			ratio = (e * Math.sinh(eAnom) - eAnom - meanAnom) /
					(e * Math.cosh(eAnom) - 1);
			eAnom -= ratio;
			iterations++;
		}

		// true anomaly for a hyperbola. source: valispace cheat sheet
		// this formula seems to perform better
		truAnom = Math.acos((e - Math.cosh(eAnom)) / (e * Math.cosh(eAnom) - 1));


		// experimental!
		if (meanAnom < 0) {
			truAnom = 2 * Math.PI - truAnom;
		}


		// textbook equation
		//let truAnomB = Math.sqrt((e + 1) / (e - 1)) * Math.tanh(eAnom/2);

		// specific relative angular momentum for a hyperbola
		// treat a < 0 for hyperbola: "universal variable" compatible with nasa
		h = Math.sqrt((e*e - 1) * Math.abs(a) * mu);
	}

	// requires: h, e, i, lan, w, truAnom, mu (from this point on)

	// position vector in perifocal coordinates
	let rpx = h*h/mu * (1 / (1 + e*Math.cos(truAnom))) * Math.cos(truAnom);
	let rpy = h*h/mu * (1 / (1 + e*Math.cos(truAnom))) * Math.sin(truAnom);

	// velocity vector in perifocal coordinates
	let vpx = mu / h * -Math.sin(truAnom);
	let vpy = mu / h * (e + Math.cos(truAnom));

	// matrix of the transformation from perifocal to geocentric equatorial
	// coordinates
	let q11 =
		-Math.sin(lan) * Math.cos(i) * Math.sin(w) + Math.cos(lan) * Math.cos(w);
	let q12 =
		-Math.sin(lan) * Math.cos(i) * Math.cos(w) - Math.cos(lan) * Math.sin(w);
	let q21 =
		Math.cos(lan) * Math.cos(i) * Math.sin(w) + Math.sin(lan) * Math.cos(w);
	let q22 =
		Math.cos(lan) * Math.cos(i) * Math.cos(w) - Math.sin(lan) * Math.sin(w);
	let q31 = Math.sin(i) * Math.sin(w);
	let q32 = Math.sin(i) * Math.cos(w);

	// transform rpx and vpx into the geocentric frame
	let x  = q11 * rpx + q12 * rpy,
			y  = q21 * rpx + q22 * rpy,
			z  = q31 * rpx + q32 * rpy,
			vx = q11 * vpx + q12 * vpy,
			vy = q21 * vpx + q22 * vpy,
			vz = q31 * vpx + q32 * vpy;

	return {x, y, z, vx, vy, vz, truAnom};
}

// WARNING: don't call this function for sub-orbital objects
function nodalPrecession(kepler, mu, J2, R) {
	let {a, e, i} = kepler;
	// mu = gravitational parameter
	// J2 = second zonal harmonic
	// R = equatorial radius of parent object (the object that is being orbited)
	let lanRate, wRate;
	if (e >= 1) {
		// don't compute for hyperbolic orbits; return no nodal precession effect
		lanRate = 0;
		wRate = 0;
	} else {
		// rate in seconds of the regression of the ascending node
		lanRate = -(1.5 * (Math.sqrt(mu) * J2 * R*R /
		((1 - e*e)**2 * Math.abs(a)**3.5))) * Math.cos(i);
		// rate in seconds of the advance of the argument of perigee
		wRate = lanRate * (2.5 * Math.sin(i)**2 - 2) / Math.cos(i);
	}

	return {lanRate, wRate};
}



// shortened to just get i, lan, and w, for orienting orbit ellipse
function toKepi(cartes, mu) {
	let {x, y, z, vx, vy, vz} = cartes;

	// distance and speed
	let r = Math.hypot(x, y, z);
	let v = Math.hypot(vx, vy, vz);

	// radial velocity
	// if > 0, spacecraft is flying away from perigee
	// if < 0, spacecraft is flying toward perigee
	let vRadial = (x*vx + y*vy + z*vz) / r;

	// specific angular momentum
	let hx = y*vz - z*vy;
	let hy = z*vx - x*vz;
	let hz = x*vy - y*vx;

	// magnitude of the specific angular momentum
	let h = Math.hypot(hx, hy, hz);

	// inclination
	let i = Math.acos(hz/h);
	if (isNaN(i)) {
		i = 0;
	}

	// define node line, calculate magnitude
	//let nx = 0 * hz - 1 * hy; // simplified: use -hy in place of nx
	//let ny = 1 * hx - 0 * hz; // simplified: use hx in place of ny
	//let nz = 0 * hy - 0 * hx; // simplified: use 0 in place of nz
	//let n = Math.hypot(nx, ny, nz);
	// simplified
	let n = Math.hypot(hy, hx); // use hy not -hy because squared = positive

	// longitude of the ascending node (also known as RAAN or Node)
	let lan = 0;
	if (n !== 0) {
		lan = Math.acos(-hy/n);
		if (hx < 0) {
			lan = 2 * Math.PI - lan;
		}
	} else {
		lan = 0;
	}

	// eccentricity
	let ex = 1/mu * ((v*v - mu/r) * x - r * vRadial * vx);
	let ey = 1/mu * ((v*v - mu/r) * y - r * vRadial * vy);
	let ez = 1/mu * ((v*v - mu/r) * z - r * vRadial * vz);
	//let e = Math.hypot(ex, ey, ez);
	// sample output: 0.17121234628445342

	// eccentricity (depending only on the scalars obtained thus far)
	// this procedure is being chosen because it generates a lower number than the
	//   other procedures. Lower is safer (and more accurate) for ~0 velocities.
	//   This will help to avoid an ~0 velocity ellipse of 0.999... producing
	//   an eccentricity value > 1, which would be a catastrophic failure.
	let e = Math.sqrt(1 + h*h/(mu*mu) * (v*v - 2*mu/r));
	// sample output: 0.17121234628445206

	// eccentricity (using semi-major axis)
	//let aAlternative = 1 / (2/r - v*v/mu);
	//let eTest2 = Math.sqrt(1 - (h*h / mu) / aAlternative);
	// sample output: 0.1712123462844524

	// textbook custom atan2 procedure: must return between 0 and 2 * Math.PI
	function atan2_in_range(y, x) {
		let t = 0;
		if (x === 0) {
			if (y === 0) {
				t = 0;
			} else if (y > 0) {
				t = Math.PI / 2;
			} else {
				t = Math.PI * 1.5;
			}
		} else if (x > 0) {
			if (y >= 0) {
				t = Math.atan(y/x);
			} else {
				t = Math.atan(y/x) + 2 * Math.PI;
			}
		} else if (x < 0) {
			if (y === 0) {
				t = Math.PI;
			} else {
				t = Math.atan(y/x) + Math.PI;
			}
		}
		return t;
	}

	// argument of periapsis/pericenter/perigee/perihelion, etc. (lowercase omega)
	let w = 0;
	if (n !== 0) {
		// why 1e-10 instead of 0 or Number.EPSILON or 1e-14 or 1e-12?
		if (e > 1e-10) {
			// use safety to correct floating point errors and avoid failure
			let wSafety = (-hy*ex + hx*ey) / (n*e);
			if (wSafety < -1) {
				wSafety = -1;
			} else if (wSafety > 1) {
				wSafety = 1;
			}
			w = Math.acos(wSafety);
			if (ez < 0) {
				w = 2 * Math.PI - w;
			}      
		} else {
			// consider the orbit circular. argument of periapsis shall equal zero.
			w = 0;
		}
	} else {
		// without i, and therefore no LAN/RAAN, w is "strictly undefined"
		//w = 0;
		// however, i still need to define it...
		// wikipedia gives a formula with atan2, but it needs to be in range
		// equatorial orbit: define by vernal point, in direction of motion
		w = atan2_in_range(ey, ex);
		if (hz < 0) {
			w = 2 * Math.PI - w;
		}
	}
	// final correction
	if (w === 2 * Math.PI) {
		w = 0;
	}
	return {i, lan, w};
}
