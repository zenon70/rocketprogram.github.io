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


this program simulates rocket launches, orbits, and interplanetary spaceflight.


## main features
- n-body physics integrated with keplerian physics: lagrange points, lissajous orbits, horseshoe orbits, etc.. more accurate and stable than simplectic euler n-body physics

- oblate spheroids and nodal precession! acheive special sun-synchronous orbits, etc.

- tidal locking. pseudo-realistic tidal locking with horizontal libration as well as vertical

- accurate Global Positioning System, altitude, and surface speed. track spacecraft in real-scale space, to millimeter precision

- a navball, affected by both orbital position, and pitch, yaw, and roll. a useful tool for monitoring spacecraft orientation

- US Standard Atmosphere air density model and aerodynamic drag. simulate MaxQ (maximum aerodynamic pressure), and orbital decay

- NASA space object parameters. all space objects are placed according to NASA Horizons space data

- IAU (International Astronomical Union) data for space object axial tilt. accurate right ascension, declination, and object rotation in time


## links
*development version:*
- live: https://cubetronic.github.io
- code: https://github.com/cubetronic/cubetronic.github.io

*stable version:*
- live: https://rocketprogram.github.io
- code: https://github.com/rocketprogram/rocketprogram.github.io

---

- many orbital formulas in this program are based on MATLAB scripts from the 2020 textbook _Orbital Mechanics for Engineering Students_ by Curtis. in the practical application of these scripts, necessary adjustments and additions have been made.

- this program was developed from scratch, starting with a simple 1-Dimensional concept of a rocket going up. then it became a 2D simulation with a JavaScript canvas. now it's 3D, with _three.js_ used to render 3D graphics.

## user guide

**orbital info**

symbol|meaning
------|-------
period| orbital period, one year is 365.2422 days
a     | semi-major axis: when positive, half the long length of an ellipse
e     | eccentricity: 0=circle, 0-1=ellipse, 1=parabola, >1=hyperbola
i     | inclination: 0=equatorial, 90=polar, 180=retrograde
Ω     | longitude of the ascending node: uppercase omega: degrees from the vernal point, which is the imaginary line drawn from earth to the sun at the moment of the spring equinox. if you have a Ω of 0, then in springtime your spacecraft will be between the earth and sun when it crosses the equator from south to north. 
ω     | argument of periapsis: lowercase omega: degrees from Ω to lowest orbital altitude
M     | mean anomaly: time-weighted degrees from ω to current location
vo    | orbital velocity kilometers per second*
Ap    | apoapsis: furthest distance from center of mass
Pe    | periapsis: closest distance from center of mass

\* the kms listed with orbital info is orbital speed, which is measured in the inertial frame, which is a frame of reference that does not move with the spin of the planet/moon/etc., but instead is purely relative to the speed around the planet/moon/etc. this is how orbital objects such as satellites measure speed.


**surface info**

abbv |meaning
-----|-------
GM   | gravity × mass: the gravitational parameter "μ" (pronounced "moo")
Alt  | altitude from MSL at your exact location
vels | surface velocity kilometers per second*
drag | aerodynamic drag based on drag coefficient and area, in newtons of force
mass | total mass of object with fuel
Lat  | latitude: distance from 90° north to -90° south
Lon  | longitude: distance from 180° east to -180° west
ApEq | surface apoapsis altitude from MSL at Equator
PeEq | surface periapsis altitude from MSL at Equator

\* the kms listed with gps info is surface speed, which is measured in the fixed frame, which means that the measurements are fixed relative to the surface (and atmosphere) of a planet/moon/etc. this is how automobiles measure speed, as well as rockets when they are launching and landing.

MSL: Mean Sea Level  
Right Asc. is Right Ascension  
Sim. Sidereal is the current simulated sidereal rate  
Lon.Libration only measures longitudinal libration

## reference plane for objects orbiting the sun
this setting allows you to change the data output on the screen for the object you are currently viewing.
- the ecliptic plane is the de facto standard in space literature unless specified.

- body equator: this is what the underlying code uses no matter which presentation option is selected, because the program uses it to calculate the J2 zonal harmonic (gravitational effect of the equatorial bulge). this body equator frame, and plane, of reference is the de facto standard for all objects orbiting anything other than the sun, such as moons and satellites.

- the invariable plane, not to be confused with la place plane, is a plane which is the sum of all angular momentum of a system, or in other words, the average orbit considering the mass of all planets and objects. (the la place plane is essentially the average plane of an orbit when nodal precession (gravity due to equatorial bulge) and other perturbing forces are taken into account.)

- the galactic plane lines up with the milky way.

- the ICRF frame is fixed to the stars, and is based on the earth's equator. this is not usually used in reference to objects orbiting the sun.

## axes
for spacecraft:
- red points in the Forward +X direction (-X is Aft), the axis of roll.
- blue points Nadir +Z (and -Z is Zenith), the axis of yaw.
- green points Starboard +Y (and -Y is Port), the axis of pitch.

for natural bodies:
- shows ICRF axes (long): blue is +Z and points roughly to the north star (Polaris). red is +X and points to the Vernal Point (the imaginary line drawn from Earth to the Sun at the moment of the Spring Equinox). green is +Y and points to 90° Right Ascension. these axes are used for reference. they are fixed to the stars.
- and ECEF axes (short): blue is +Z goes through the positive pole (usually called north, more on that later). red is +X and goes through the Prime Meridian, and is the center point for most maps. green is +Y and goes through 90° East.

the IAU convention states that the "north" pole of a planet or moon or object is whichever pole is located on the same side of the solar system's invariable plane as earth's north pole. this usually means that its north pole is its positive pole, but not for 299, 799, and 999, for example.

however, this program does not follow that convention, because it is arbitrary and breaks other definitions like the definitions of east and west.

therefore, instead, this program considers a planet, moon, or object's "north" pole to be its positive pole, which is defined by its rotation. if standing on a planet facing east, the positive pole will be to the left. this is the convention used for exoplanets, and thus is a uniform standard that has no exceptions, and thus is easier to rely upon and use for navigation. it also does not require redefining east and west. for example, in this program, when launching, pointing east will _always_ be an easier orbit to acheive because it will always be a prograde orbit.

UPDATE:  
moon 801 has just been added and its orientation is strange and currently has a westerly rotation, so launching west from 801 is easier right now, until perhaps i flip the polar convention to match the convention of this program.

note that which way the sun rises and sets is another matter. usually, if a planet's "north" pole is its positive pole, the sun should rise in the east. yet some planets rotate so slowly that the sunrise and sunset may also be a matter of not just the planet's own rotation, but also its revolution around the sun. for example, 199 has an other-worldly sunrise sunset pattern.

## graphics

in reality, the sun is just pure white. it only appears orange when viewing it with special equipment. therefore, in this program the sun is pure white, unless specifically viewing it.
the sun does not rotate like planets. its equator rotates more rapidly than its poles, which is not simulated here, but the general rotation speed is simulated.

## navigation tips


- hyperbolic trajectories (apoapsis of infinity) function accurately, however, helper lines are currently NOT rendered. in this situation, *orbital velocity* ("vo" in verbose) is very useful. if your reduce your orbital velocity, you will acheive an orbit around something.

- if you feel *upside down*, you can spin the view. tap (or click) and hold and make a circular motion. go clockwise or counter-clockwise to rotate the view. astronauts are always faced with the challenge of determining which way is _up_. if the ISS (International Space Station) had an axes helper, it would show red forward, roughly east, and blue pointing down towards earth, and green to the right, starboard, which is roughly south because it heads east.

- due to current graphics limitations, the visible surface appears to be below the *actual* surface. so, when a spacecraft is landed on the surface, it will appear to be high up over the surface. trust the gps data, not the graphics.

- the faster time is simulated, the more unstable and unreaslistic the simulation is. the timestep is limited to ~8 million times, which is about as fast as it can reliably run for without quickly ejecting the fourth planet's moons, which is an artificial artifact of warping time, not a realistic feature of space.

- to test the **nodal precession** effect, get an orbit that has a low periapsis (i.e. 200km-2000km), then switch to earth view, and crank up the time multiplier. you should notice that the orbit does not stay fixed with respect to the stars. this effect is weaker when orbiting the moon because the moon is not as oblate as earth. The 6th planet is very oblate.


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

- atmosphere of earth and aerodynamic drag, up to 202,000 km altitude. that's more than half-way to the moon. even gps and geostationary satellites experience aerodynamic drag.

- atmosphere for other planets. the atmosphere for foreign planets is crudely simulated without considering temperature. and as for the gas giants, scientifically speaking, 1 bar of pressure is considered the surface of the gas giants, both for altitude measurements and planet radius measurements. however, 1 bar of pressure is by no means an actual surface. the galilean probe went 132km below the 1 bar pressure altitude before it lost contact. this simulation currently uses the 1 bar convention for radius and it is simulated as a hard surface, even though it definitely is not.

- tidal locking is pseudo-simulated with a custom formula. libration in this program may be more than in real life. in real life, the moon has about a 7° maximum horizontal aka longitudinal libration.

## what is not simulated

- the actual rotation of the spacecraft is more or less lost during and after multiplying the time. this is actually due to the fact that keeping proper rotation over time requires a complex formula that has not yet been built into this simulation. 

- the rings of the 6th planet appear unrealistic in a way: they do not receive the shade of the planet, nor do they cast shade. the three.js JavaScript library does not have a good out-of-the-box solution for this. i have experimented with different possible solutions, but they all look worse than just not simulating shade. eclipse shade is also not simulated.

- the speed of gravity is currently not simulated. therefore gravitational effects are immediate (infinite speed), whereas in reality gravitational effects take time to reach the destination they influence. the realistic speed of gravity is around the speed of light.

- tidal forces other than tidal locking, such as water and land tidal forces, are not simulated.

- solar forces such as electromagnetic storms and heat radiation forces are not simulated.

- surface terrain such as mountains and valleys are not simulated.

- moons 401 and 402 gps surface and graphics are different beyond normal issue of limited segments due to non-'oblate-spheroid' shape: they have different dimensions on all three axes, and there is no gps formula here for that. 401 (and 402) are actually better depicted as complicated 3d models, but that is currently out of scope for this project.

## design choices

- functional programming. wherever possible and practical, *pure* (independent)  functions are written and utilized. this keeps the working pieces of the program separate, and therefore makes the program more reliable and more extensible. it is my goal to make it so that advanced users and programmers can easily understand and use the code.

- the internal structure of the code uses the x, y, and z of space conventions, not cgi graphics animation conventions which is the de facto standard in the threejs 3D library and many other programs. the benefit of using space conventions is that all formulas, source code, data input/output, etc., will not need to be converted. this helps avoid confusion for the advanced users and programmers.

- icrf orientation. the x, y, and z used in the program refer to icrf (international celestial reference frame) orientation. this makes it so the threejs built-in skybox can be used for the stars, as it doesn't have to be rotated. this is the most efficient way to go, and probably makes the most sense.

- the surfaces of planets are used as textures instead of with clouds, if surface textures for the object were avaiable. for example, the 2nd planet surface texture is used. this will aid in attempting to land in the correct location.

- hyperbolic trajectories escaping the solar system are caclulated to an extent, and then fail when the transendental equation becomes processor-intensive. in other words, it is limited on purpose. it is possible to remove that limit in the code in the orbMech file. if travelling away from the sun to great distances is your goal, then i recommend switching from using keplerian elements to only using cartesian state vectors.

- this program is designed to allow addition of other celesital objects such as moons, comets, and asteroids.

- the underlying orbital mechanics physics are in the orbMech Javascript file, which was written so that the code can be used elsewhere. it can convert keplerian orbital elements to cartesian state vectors, and cartesian state vectors to keplerian orbital elements.

- one very unique feature of this program is that it is possible to bore through planets and moons. this program could also be called "boring program".
