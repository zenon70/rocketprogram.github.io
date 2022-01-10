```
                    _          _
      _ _ ___   __ | | _  ___ | |_
     | ’_/ _ \ / _|| |/ // _ \| __/
     | || (_) | (_ |   <|  __/| |
     |_| \___/ \__||_|\_\\___| \_\
 _ __  _ _ ___   __ _ _ _ __ _ _ __  __
| '_ \| '_/ _ \ / _` | '_/ _` | '_ \’_ \
| (_) | || (_) | (_| | || (_| | | | | | |
| ,__/|_| \___/ \__, |_| \__,_|_| |_| |_|
|_|             |___/
```

# this is a rocket program

this program simulates rocket launches, orbits, and interplanetary spaceflight.

*orbMech[ver].js can be used to convert between Keplerian Orbital Elements and Cartesian State Vectors*

## main features ##
- n-body physics integrated with keplerian physics
	- lagrange points, lissajous orbits, horseshoe orbits, etc.
	- more accurate and stable than simplectic euler n-body physics

- oblate spheroids and nodal precession
	- acheive special sun-synchronous orbits, etc.

- accurate Global Positioning System, altitude, and surface speed
	- track spacecraft in real-scale space, to millimeter precision

- a navball, affected by both orbital position, and pitch, yaw, and roll
	- a useful tool for monitoring spacecraft orientation

- US Standard Atmosphere air density model and aerodynamic drag
	- simulate MaxQ (maximum aerodynamic pressure), and orbital decay

- NASA space object parameters
	- all space objects are placed according to NASA Horizons space data

- IAU (International Astronomical Union) data for space object axial tilt
	- accurate right ascension, declination, and object rotation in time


## links ##
*development version:*
- Live: https://cubetronic.github.io
- Code: https://github.com/cubetronic/cubetronic.github.io

*stable version:*
- Live: https://rocketprogram.github.io
- Code: https://github.com/rocketprogram/rocketprogram.github.io

---

- many orbital formulas in this program are based on MATLAB scripts from the 2020 textbook _Orbital Mechanics for Engineering Students_ by Curtis. in the practical application of these scripts, necessary adjustments and additions have been made.

- this program was developed from scratch, starting with a simple 1-Dimensional concept of a rocket going up. then it became a 2D simulation with a JavaScript canvas. now it's 3D, with _three.js_ used to render 3D graphics.

## user guide

**orbital info**

symbol|meaning
------|-------
a     | semi-major axis
e     | eccentricity
i     | inclination
Ω     | longitude of the ascending node
ω     | argument of periapsis
M     | mean anomaly
Ap    | apoapsis altitude from center of mass
Pe    | periapsis altitude from center of mass
kms   | kilometers per second*


\* the kms listed with orbital info is orbital speed. this is the ECI (earth centered inertial) frame, which means it does not consider the spin of the planet/moon/etc.

**surface info**

abbv|meaning
----|-------
mass| total mass of object
Ap  | apoapsis altitude from MSL (mean sea level) at Equator
Pe  | periapsis altitude from MSL (mean sea level) at Equator
Lat | latitude
Lon | longitude
Alt | altitude from MSL (mean sea level) at your location
kms | kilometers per second*
drag| newtons of force

\* the kms listed with gps info is surface speed. this is the ECEF (earth-centered earth-fixed) frame, and it does consider the spin of the planet/moon/etc.

### Reference Plane for objects orbiting the sun
this setting allows you to change the data output on the screen for the object you are currently viewing.
- the ecliptic plane is the de facto standard in space literature unless specified.

- body equator: this is what the underlying code uses no matter which presentation option is selected, because the program uses it to calculate the J2 zonal harmonic (gravitational effect of the equatorial bulge). this body equator frame, and plane, of reference is the de facto standard for all objects orbiting anything other than the sun, such as moons and satellites.

- the invariable plane, not to be confused with la place plane, is a plane which is the sum of all angular momentum of a system, or in other words, the average orbit considering the mass of all planets and objects. (the la place plane is essentially the average plane of an orbit when nodal precession (gravity due to equatorial bulge) and other perturbing forces are taken into account.)

- the galactic plane lines up with the milky way.

- the ICRF frame is fixed to the stars, and is based on the earth's equator. this is not usually used in reference to objects orbiting the sun.

### navigation tips

- if you feel *upside down*, you can spin the view. tap (or click) and hold and make a circular motion. go clockwise or counter-clockwise to rotate the view. astronauts are always faced with the challenge of determining which way is _up_. if the ISS (International Space Station) had an axes helper, it would show red forward, roughly east, and blue pointing down towards earth, and green to the right, starboard, which is roughly south because it heads east.

- due to current graphics limitations, the visible surface appears to be below the *actual* surface. so, when a spacecraft is landed on the surface, it will appear to be high up over the surface. trust the gps data, not the graphics.

- the faster time is simulated, the more unstable and unreaslistic the simulation is. the timestep is limited to ~8 million times, which is about as fast as it can reliably run for without quickly ejecting the fourth planet's moons, which is an artificial artifact of warping time, not a realistic feature of space.

- to test the **nodal precession** effect, get an orbit that has a low periapsis (i.e. 200km-2000km), then switch to earth view, and crank up the time multiplier. you should notice that the orbit does not stay fixed with respect to the stars. this effect is weaker when orbiting the moon because the moon is not as oblate as earth.

- hyperbolic trajectories function accurately, however, helper lines are currently NOT rendered. in previous versions that are not online, code was written to visualize *any* projected trajectory, even lissajous orbits. unfortunately, that code was very processor-intensive, so i have left it out of this version until i get around to it. therefore, transitioning between orbiting one thing and another thing can be very disorienting. use the nav-ball, orbital elements, and gps info to guide you. good luck! 


## what is simulated

- it uses n-body physics. this means that every celestial object is having a gravitational effect on every other celestial object. this means that strange orbit types such as lagrangian and horseshoe orbits are possible. even the mass of a spacecraft in this program is calculated to affect the movement of distant planets... yet the numerical precision limits simulating that phenomenon here. still, a spacecraft may have a measurable effect on a very lightweight object nearby.

- it *also* solves the keplerian 2-body problem. it does this between each object and its orbital parent. this increases accuracy dramatically, and also allows for nodal precession. this is probably the trickiest and most unique and innovative aspect of this program. the reasons to implement this are two-fold. firstly, simple n-body physics formulas get very inaccurate the closer objects get to each other. this inaccuracy is avoided by making things that are closest use, instead, the keplerian 2-body formula. simple n-body physics is retained for all other bodies further away. secondly, nodal precession needs to be calculated. this depends on the axial tilt of a body. this is important at close distances, and there are known formulas for calculating nodal precession in conjunction with kepler's equations.

- nodal precession is factored in based on J2 zonal harmonics. this means that the equatorial buldge of each oblate sphereoid (planet, moon, etc.) affects the movement of the orbiting body. nodal precession can be used to acheive the type of sun-sychronous orbit where a satellite is always in direct sunlight, never going into the shade behind the object it is orbiting.

- the x-y-z axes colors for the rocket conform to space conventions.

- all planets are tilted accurately, not just to the correct amount of tilt, but tilted in the correct direction. IAU data was used. these parameters are known as Right Ascension, Declination, and "W". "W" is the parameter for the exact rotational position at a specific moment in time. this is used to make sure that the time is correct with respect to day and night on the planet/moon/etc.

- real NASA Horizons data is used to create starting points for all objects.

- the stars are accurately placed. the images are based on a catalog of all available stars. they are not photos - they are better than photos. different source image brightnesses and resolutions are available in the settings.

- everything is at real scale, with real masses. the rocket's engine thrust has been calibrated to be realistic.

- gps coordinates are accurate, even with oblate spheroid bodies.

- surface speed is accurate, even with oblate sphereoid bodies.

- atmosphere of earth and aerodynamic drag, up to 202,000 km altitude. that's more than half-way to the moon. so even gps and geostationary satellites experience aerodynamic drag.

## what is not simulated

- the actual rotation of the spacecraft is more or less lost during and after multiplying the time. this is actually due to the fact that keeping proper rotation over time requires a complex formula that has not yet been built into this simulation. 

- atmosphere for other planets and moons

- the rings of the 6th planet appear unrealistic in a way: they do not receive the shade of the planet, nor do they cast shade. the three.js JavaScript library does not have a good out-of-the-box solution for this. i have experimented with different possible solutions, but they all look worse than just not simulating shade. eclipse shade is also not simulated.

- relativity and/or the speed of gravity are not currently simulated. upon developing this simulation, i did some research on special and general relativity. from what i understand, NASA's Horizons data is unfortunately muddied with counter-corrections for relativity. it's complicated, and i don't remember all the details right now, but basically, i believe it may be possible for me to produce an extremely accurate simulation - better than perhaps most simulations, by using a proper implementation of Gerber's equation regarding the effect of gravity travelling at the speed of light. this should accurately simulate the anomaly of the precession of the first planet. as far as fifth planet flyby anomalies, that is currently an observed phenomenon that puzzles scientists.

- tidal forces, such as water and land tidal forces, are not simulated.

- solar forces such as electromagnetic storms and heat radiation forces are not simulated.

- tidally locked moons do not gyrate properly. they are simply flagged as 'tidally locked' in the code, and behave accordingly.

- surface terrain such as mountains and valleys are not simulated.

## design choices

- functional programming. wherever possible and practical, *pure* (independent)  functions are written and utilized. this keeps the working pieces of the program separate, and therefore makes the program more reliable and more extensible. it is my goal to make it so that advanced users and programmers can easily understand and use the code.

- the internal structure of the code uses the x, y, and z of space conventions, not cgi graphics animation conventions which is the de facto standard in the threejs 3D library and many other programs. the benefit of using space conventions is that all formulas, source code, data input/output, etc., will not need to be converted. this helps avoid confusion for the advanced users and programmers.

- icrf orientation. the x, y, and z used in the program refer to icrf (international celestial reference frame) orientation. this makes it so the threejs built-in skybox can be used for the stars, as it doesn't have to be rotated. this is the most efficient way to go, and probably makes the most sense.

- the surfaces of planets are used as textures instead of with clouds, if i could find surface textures for the object. for example, the 2nd planet surface texture is used. this will aid in attempting to land in the correct location.

- hyperbolic trajectories escaping the solar system are caclulated to an extent, and then fail when the transendental equation becomes processor-intensive. in other words, it is limited on purpose. it is possible to remove that limit, or, if travelling away from the sun to great distances is your goal, then i would just switch from an asymptotic trajectory to a linear trajectory or something like that.

- this program is designed to allow addition of an unlimited number of celesital objects. the project goal is to include all planets, known moons, dwarf planets, and a good number of asteroids. the program is designed to allow for dynamic transitions where asteroids and moons can be gracefully ejected and become the child of a new planet or celestial object, should the opportunity arise - just like how the rocket can transfer.

- the underlying physics engine is called orbMech, which was written so that the code can be used elsewhere. it converts from keplerian orbital elements to cartesian state vectors, and of course also from cartesian state vectors to keplerian orbital elements. if i find the time, perhaps i will make part of this program dedicated to being a conversion calculator.

- as a side effect of the way this program was developed, it is possible to bore through planets. this program could also be called "boring program".
