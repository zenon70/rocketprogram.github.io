# this is a rocket program.
*it is also the source of orbMech.js, which is the best JavaScript code library on the internet (as far as i know) for converting between keplerian orbital elements and cartesian state vectors*

this is a rocket and space simulator with a unique hybrid n-body/keplerian-elements physics engine that also simulates J2 zonal harmonics with space data from based on NASA and the IAU (International Astronomical Union).

- development version: https://cubetronic.github.io or https://github.com/cubetronic/cubetronic.github.io

- stable version: https://rocketprogram.github.io or https://github.com/rocketprogram/rocketprogram.github.io

_it's not a game. it's a simulator._
---
- the purpose of this program is to simulate a rocket launch from standstill to orbit, and beyond, with maximum realism.

- this program was developed from scratch, starting with the simple concept of a rocket going up. then it was a 2D simulation. now it's 3D. the three.js library is used to render 3D graphics, but other than that, this is all pure JavaScript. some formulas were derived from a reputable 2020 textbook on orbital mechanics, but the textbook formulas were incomplete for this application, so some additional development on the formulas was required.

## user guide

### key

**orbital info**

symbol|meaning
------|-------
a     | semi-major axis
e     | eccentricity
i     | inclination
Ω     | longitude of the ascending node
ω     | argument of periapsis
M     | mean anomaly
Ap    | apoapsis altitude from MSL (mean sea level)
Pe    | periapsis altitude from MSL (mean sea level)
kms   | kilometers per second*

\* the kms listed with orbital info is orbital speed. this is the ECI (earth centered inertial) frame, which means it does not consider the spin of the planet/moon/etc.  


**surface info**

abbv|meaning
----|-------
Lat | latitude
Lon | longitude
Alt | altitude from MSL (mean sea level)
kms | kilometers per second*

\* the kms listed with gps info is surface speed. this is the ECEF (earth-centered earth-fixed) frame, and it does consider the spin of the planet/moon/etc.

- use of this program should be self explanatory, with buttons clearly named.

- if you feel *upside down*, you can spin the view. tap (or click) and hold and make a circular motion. go clockwise or counter-clockwise to rotate the view in different directions.

- due to current graphics limitations, the visible surface and the *actual* surface are different. so if it seems like you're a few miles above the surface, but not moving, that's just because the spherical body is made up of many flat surfaces, and it doesn't align with the exact surface.

- the faster time is simulated, the more unstable and unreaslistic the simulation is. it's pretty stable up to about 8 million times speed, which is the limit because this is about as fast as it can reliably go for a while without ejecting the fourth planet's moons... but that *will* happen if you leave it running at that speed.

- to test the **nodal precession** effect, get an orbit that has a low periapsis (i.e. 200km-2000km), then switch to earth view, and crank up the time multiplier. you should notice that the orbit does not stay fixed with respect to the stars. this effect is weaker when orbiting the moon because the moon is more spherical than earth.

- hyperbolic trajectories are currently NOT rendered. they *exist*, but they are not rendered. i wrote code for this (well, for ANY projected trajectory, even lissajous orbits) in previous versions, which are not available online, but the code that was very processor-intensive to implement so i have left it out of this version until i get around to it. therefore, transitioning between orbiting one thing and another thing can be very disorienting. use the nav-ball and orbital element info to guide you. good luck!


## what is simulated

- it uses n-body physics. this means that every celestial object is having a gravitational effect on every other celestial object. this means that strange orbit types such as lagrangian and horseshoe orbits are possible. even the mass of the spacecraft is affecting the movements of the planets and moons, if the numerical precision will permit, which i suppose it won't, unless a very small object, like an asteroid, is loaded.

- it *also* solves the keplerian 2-body problem. it does this between each object and its orbital parent. this increases accuracy dramatically, and also allows for nodal precession. this is probably the trickiest and most unique and innovative aspect of this program. the reasons to implement this are two-fold. firstly, simple n-body physics formulas get very inaccurate the closer objects get to each other. this inaccuracy is avoided by making things that are closest use, instead, the keplerian 2-body formula. simple n-body physics is retained for all other bodies further away. secondly, nodal precession needs to be calculated. this depends on the axial tilt of a body. this is important at close distances, and there are known formulas for calculating nodal precession in conjunction with kepler's equations.

- nodal precession is factored in based on J2 zonal harmonics. this means that the equatorial buldge of each oblate sphereoid (planet, moon, etc.) affects the movement of the orbiting body. nodal precession can be used to acheive the type of sun-sychronous orbit where a satellite is always in direct sunlight, never going into the shade behind the object it is orbiting.

- the x-y-z axes colors for the rocket conform to space conventions

- all planets are tilted accurately, not just to the correct amount of tilt, but tilted in the correct direction. IAU data was used. these parameters are known as Right Ascension, Declination, and "W". "W" is the parameter for the exact rotational position at a specific point in time. this is used to make sure that the time is correct with respect to day and night on the planet/moon/etc.

- real NASA Horizons data was used to create starting points for all objects.

- the stars are accurately placed. from what i remember when i got the images, they are based on a catalog of all available stars, so it is not a photo - it is better than any photo. i chose very high resolution renderings.

- everything is at real scale, with real masses. however, the rocket's engine thrust has not be calibrated to be very realistic yet. it can barely manage a lift-off from earth at 70% throttle, which may even be over-powered still.

- gps coordinates are accurate, even with oblate spheroid bodies.

- surface speed is accurate, even with oblate sphereoid bodies.

## what is not simulated

- atmosphere is not simulated at the moment, but i wrote a bunch of formulas and JavaScript code for it that i look forward to implementing in the future. this atmosphere code is not yet in this project, and makes several calculations based on altitude because the in real life, the natural air temperature goes up and down several times as altitude increases.

- the rings of the 6th planet appear unrealistic in a way: they do not receive the shade of the planet, nor do they cast shade. the three.js JavaScript library does not have a good out-of-the-box solution for this. i have experimented with different possible solutions, but they all look worse than just not simulating shade. eclipse shade is also not simulated.

- relativity and/or the speed of gravity are not currently simulated. upon developing this simulation, i did some research on special and general relativity. from what i understand, NASA's Horizons data is unfortunately muddied with counter-corrections for relativity. it's complicated, and i don't remember all the details right now, but basically, i believe it may be possible for me to produce an extremely accurate simulation - better than perhaps most simulations, by using a proper implementation of Gerber's equation regarding the effect of gravity travelling at the speed of light.

- tidal forces, such as water and land tidal forces, are not simulated.

- solar forces such as heat radiation forces are not simulated.

- tidally locked moons do not gyrate properly. they are simply flagged as 'tidally locked' in the code, and behave accordingly.

- surface features such as mountains and valleys are not simulated.

## design choices

- functional programming. wherever possible and practical, *pure* (independent)  functions are written and utilized. this keeps the working pieces of the program separate, and therefore makes the program more reliable and more extensible. it is my goal to make it so that advanced users and programmers can easily understand and use the code.

- the internal structure of the code uses the x, y, and z of space conventions, not cgi graphics animation conventions which is the de facto standard in the threejs 3D library and many other programs. the benefit of using space conventions is that all formulas, source code, data input/output, etc., will not need to be converted. this helps avoid confusion for the advanced users and programmers.

- icrf orientation. the x, y, and z used in the program refer to icrf (international celestial reference frame) orientation. this makes it so the threejs built-in skybox can be used for the stars, as it doesn't have to be rotated. this is the most efficient way to go, and, imho, makes the most sense.

- the surfaces of planets are used as textures instead of with clouds, if i could find surface textures for the object. for example, the 2nd planet surface texture is used. this will aid in attempting to land in the correct location.

- hyperbolic trajectories escaping the solar system are caclulated to an extent, and then fail when the transendental equation becomes processor-intensive. in other words, it is limited on purpose. it is possible to remove that limit, or, if travelling away from the sun to great distances is your goal, then i would just switch from an asymptotic trajectory to a linear trajectory or something like that.

- this program is designed to allow addition of an unlimited number of celesital objects. the project goal is to include all planets, known moons, dwarf planets, and a good number of asteroids. the program is designed to allow for dynamic transitions where asteroids and moons can be gracefully ejected and become the child of a new planet or celestial object, should the opportunity arise - just like how the rocket can transfer.

- orbMech was written so that the code can be used elsewhere. it simply converts from keplerian orbital elements to cartesian state vectors, and of course also from cartesian state vectors to keplerian orbital elements. if i find the time, perhaps i will make part of this program dedicated to being a conversion calculator.

- as a side effect of the way this program was developed, it is possible to bore through planets. this program could also be called "boring program".
