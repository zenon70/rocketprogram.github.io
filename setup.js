"use strict";

////////////////////////////////////////////////////////////////////////////////
// gui

function openPopUpMenu() {
	document.querySelector(".popup").classList.add("open");
}
function closePopUpMenu() {
	document.querySelector(".popup").classList.remove("open");
}

/*
// this really works to stop firefox's autohide address bar...
// but it's overkill and prevents scrolling the menu
window.addEventListener('touchmove', event => {
	event.preventDefault();
	event.stopImmediatePropagation();
}, { passive: false });
*/

////////////////////////////////////////////////////////////////////////////////
// set up three.js

THREE.Object3D.DefaultUp.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer: true});

let virtualPixel;
if (window.devicePixelRatio) {
	virtualPixel = window.devicePixelRatio;
} else {
	virtualPixel = 1;
}
renderer.setPixelRatio(virtualPixel);


//renderer.setClearColor("#111111");
renderer.autoClear = false;
//renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const scene2 = new THREE.Scene();

// meters to rendering scale for space scene
let scale = 1e-4;

const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	1e-7,
	1e10
);

// trackball controls
const controls = new THREE.TrackballControls(camera, renderer.domElement);

// increase damping 4x for snappier controls (default 0.2)
controls.dynamicDampingFactor = 0.8;

controls.rotateSpeed = virtualPixel;

// prevent disalignment issue
controls.noPan = true;


const camera2 = new THREE.OrthographicCamera(
	-window.innerWidth / 2,
	window.innerWidth / 2,
	window.innerHeight / 2,
	-window.innerHeight / 2,
	1,
	1000
);

////////////////////////////////////////////////////////////////////////////////
// gui overlay scene

const ambientLight2 = new THREE.AmbientLight (0xffffff, 0.7);

// give navball nice appearance, with bright shine exactly in the center
const pointLight2 = new THREE.PointLight(0xffffff, 0.5);

// sphere geometry north pole is always +y
// the center of image is mapped to +x, with the north pole as +y
let navBall = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16),
	new THREE.MeshPhongMaterial({map:
	new THREE.TextureLoader().load("graphics/navball_blackgrey.png")}));

// add to scene2 later, after navBall rotation is set

////////////////////////////////////////////////////////////////////////////////
// resize 3d graphics setup as needed

function setResizable() {
	renderer.setSize(window.innerWidth, window.innerHeight);
	pointLight2.position.set(
		(window.innerWidth / 2) - 60,
		(window.innerHeight / 2) - 60,
		2500
	);
	navBall.position.set(
		(window.innerWidth / 2) - 60,
		(window.innerHeight / 2) - 60,
		- 300
	);
}
setResizable();


window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	camera2.left = - window.innerWidth / 2;
	camera2.right = window.innerWidth / 2;
	camera2.top = window.innerHeight / 2;
	camera2.bottom = - window.innerHeight / 2;
	camera2.updateProjectionMatrix();

	setResizable();
});

function openFullscreen() {
	if (document.documentElement.requestFullscreen) {
		document.documentElement.requestFullscreen();
	} else if (document.documentElement.webkitRequestFullscreen) { // Safari
		document.documentElement.webkitRequestFullscreen();
	} else if (document.documentElement.msRequestFullscreen) { // IE11
		document.documentElement.msRequestFullscreen();
	}
}

function closeFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) { // Safari
		document.webkitExitFullscreen();
	} else if (document.msExitFullscreen) { // IE11
		document.msExitFullscreen();
	}
}

let fullscreen = false;
function toggleFullscreen() {
	if (fullscreen === false) {
		openFullscreen();
		fullscreen = true;
	}
	else {
		closeFullscreen();
		fullscreen = false;
	}
}


////////////////////////////////////////////////////////////////////////////////
// space scene

// use for setting tilts, etc
const xAxis = new THREE.Vector3(1, 0, 0);
const yAxis = new THREE.Vector3(0, 1, 0);
const zAxis = new THREE.Vector3(0, 0, 1);

document.getElementById("1kStars").checked = true;
function changeStars(value) {
	if (scene.background) {
		scene.background.dispose();
	}
	switch (value) {
		case "0":
			scene.background = null;
			break;
		case "1":
			// 1k (1024x1024) Low Resolution (from bright 8k TIFF)
			// skybox: icrf breakout with rotations
			scene.background = new THREE.CubeTextureLoader().load([
				"graphics/stars_1kBright/1k-nzLeft.jpg",
				"graphics/stars_1kBright/1k-pzRight.jpg",
				"graphics/stars_1kBright/1k-nx180.jpg",
				"graphics/stars_1kBright/1k-px.jpg",
				"graphics/stars_1kBright/1k-pyRight.jpg",
				"graphics/stars_1kBright/1k-nyRight.jpg"
				]);

			// pixelated and more efficient
			scene.background.magFilter = THREE.NearestFilter;
			scene.background.minFilter = THREE.NearestFilter;

			scene.background.needsUpdate = true;
			break;
		case "2":
			// 2k Medium Resolution (from dark 16k TIFF)
			// skybox: icrf breakout with rotations
			scene.background = new THREE.CubeTextureLoader().load([
				"graphics/stars_2kDark/2k-nzLeft.jpg",
				"graphics/stars_2kDark/2k-pzRight.jpg",
				"graphics/stars_2kDark/2k-nx180.jpg",
				"graphics/stars_2kDark/2k-px.jpg",
				"graphics/stars_2kDark/2k-pyRight.jpg",
				"graphics/stars_2kDark/2k-nyRight.jpg"
				]);

			// pixelated and more efficient
			scene.background.magFilter = THREE.NearestFilter;
			scene.background.minFilter = THREE.NearestFilter;

			scene.background.needsUpdate = true;
			break;
		case "3":
			// TOO LARGE. CRASHES BROWSER ON SMARTPHONE WITH 2GB MEMORY
			// 4k High Resolution (from dark 16k TIFF)
			// skybox: icrf breakout with rotations
			scene.background = new THREE.CubeTextureLoader().load([
				"graphics/stars_4kDark/4k-nzLeft.jpg",
				"graphics/stars_4kDark/4k-pzRight.jpg",
				"graphics/stars_4kDark/4k-nx180.jpg",
				"graphics/stars_4kDark/4k-px.jpg",
				"graphics/stars_4kDark/4k-pyRight.jpg",
				"graphics/stars_4kDark/4k-nyRight.jpg"
				]);

			// pixelated and more efficient
			scene.background.magFilter = THREE.NearestFilter;
			scene.background.minFilter = THREE.NearestFilter;

			scene.background.needsUpdate = true;
			break;
		default:
			scene.background = null;
	}
}
changeStars("1");

// ambient light (stars, etc)
const starlight = new THREE.AmbientLight (0xffffff);
scene.add(starlight);
// initialize in case of refresh
let starlightControl = 0.05;
document.getElementById("starlight").disabled = true;
document.getElementById("starlight").value = 5;
document.getElementById("starlightOutput").innerHTML = "100%";
// Update the current slider value (each time you drag the slider handle)
document.getElementById("starlight").oninput = function() {
	document.getElementById("starlightOutput").innerHTML = this.value * 20 + "%";
	starlightControl = this.value / 100;
	if (body[view].name !== "10") {
		starlight.intensity = starlightControl;
	}
}
document.getElementById("starlightLock").checked = true;
function starlightLock() {
	if (document.getElementById("starlight").disabled === true) {
		document.getElementById("starlight").disabled = false;
	} else {
		document.getElementById("starlight").disabled = true;
	}
}


// planets, moons, etc: oblate spheroids (with helpers)
function makeNaturalBodyGraphics() {

	for (let i = body.length - 1; i > -1; i--) {
		if (body[i].type === "Artificial") continue;

		let material;

		if (body[i].map !== undefined && body[i].map !== null && i === earth) {
			material = new THREE.MeshLambertMaterial({
				map: new THREE.TextureLoader().load(body[i].map),
				emissive: 0xffffdd,
				emissiveIntensity: 0.3,
				emissiveMap:
					new THREE.TextureLoader().load("graphics/planet3lights_2k_dark.jpg")
			});

			material.map.magFilter = THREE.NearestFilter;
			material.map.minFilter = THREE.NearestFilter;
			material.emissiveMap.magFilter = THREE.NearestFilter;
			material.emissiveMap.minFilter = THREE.NearestFilter;

		} else if (body[i].map !== undefined && body[i].map !== null) {
			material = new THREE.MeshLambertMaterial({
				map: new THREE.TextureLoader().load(body[i].map)});

			material.map.magFilter = THREE.NearestFilter;
			material.map.minFilter = THREE.NearestFilter;

		} else if (body[i].color !== undefined) {
				material = new THREE.MeshLambertMaterial({
					color: body[i].color});
		} else {
			material = new THREE.MeshLambertMaterial();
		}

		body[i].mesh = new THREE.Mesh(new THREE.SphereGeometry(
			body[i].radiusEquator * scale, body[i].segments, body[i].segments / 2),
			material);

		if (i === earth) {

			// clouds
			let material2 =	new THREE.MeshLambertMaterial({
				map: new THREE.TextureLoader().load("graphics/planet3clouds_512_b.png"),
				side: THREE.DoubleSide,
				transparent: true
			});

			// 8500 is scale height, * 3.75 so it doesn't appear shredded (clip),
			// due to limited segments.
			body[i].clouds = new THREE.Mesh(new THREE.SphereGeometry(
				body[i].radiusEquator * scale + 8500 * 3.75 * scale,
				body[i].segments, body[i].segments / 2),
				material2);

			body[i].clouds.scale.y = body[i].radiusPole / body[i].radiusEquator;

			body[i].mesh.add(body[i].clouds);
			body[i].clouds.visible = false;
		}

		// shadows
		//body[i].mesh.castShadow = true;
		//body[i].mesh.receiveShadow = true;


		if (body[i].emissive !== undefined) {
			body[i].mesh.material.emissive.set(body[i].emissive);
		}

		//body[i].mesh.material.transparent = true;
		//body[i].mesh.material.opacity = 0.8;

		body[i].mesh.scale.y = body[i].radiusPole / body[i].radiusEquator;
		if (body[i].radiusWest !== undefined) {
			body[i].mesh.scale.z = body[i].radiusWest / body[i].radiusEquator;
		}

		// rings
		if (body[i].ringsRadius !== undefined && body[i].ringsMap !== undefined) {
			body[i].rings = new THREE.Mesh(
				new THREE.PlaneGeometry(
					body[i].ringsRadius * 2 * scale, body[i].ringsRadius * 2 * scale),
				new THREE.MeshBasicMaterial({
					map: new THREE.TextureLoader().load(body[i].ringsMap),
					transparent: true,
					side: THREE.DoubleSide})
				);
			body[i].rings.rotation.set(Math.PI / 2, 0, 0);
			//body[i].rings.castShadow = true;
			//body[i].rings.receiveShadow = true;
			body[i].mesh.attach(body[i].rings);
		}

		// turn to z-up, then Dec, then RA, then W.
		body[i].mesh.rotation.set(Math.PI / 2, 0, -Math.PI / 2 +
			body[i].declination);
		body[i].mesh.rotateOnWorldAxis(zAxis, body[i].rightAscension);
		body[i].mesh.rotateY(Math.PI / 2 + body[i].primeMeridian);

		scene.add(body[i].mesh);

// dev1


/*
// prime arrow from vector.. IS ACCURATE even when parent body is scaled
body[i].mesh.scale.set(1, 1, 1);

let prime = new THREE.Vector3();
body[i].mesh.rotateY(Math.PI/2);
body[i].mesh.getWorldDirection(prime);
body[i].mesh.rotateY(-Math.PI/2);
let primeArrow = new THREE.ArrowHelper(
	prime,
	body[i].mesh.position,
	body[i].radiusEquator * 5000 * scale,
	0x00ffff);
body[i].mesh.attach(primeArrow);

body[i].mesh.scale.y = body[i].radiusPole / body[i].radiusEquator;
if (body[i].radiusWest !== undefined) {
	body[i].mesh.scale.z = body[i].radiusWest / body[i].radiusEquator;
}
*/

/*
// prime arrow from vector.. is NOT accurate when parent body is scaled
let prime = new THREE.Vector3();
body[i].mesh.rotateY(Math.PI/2);
body[i].mesh.getWorldDirection(prime);
body[i].mesh.rotateY(-Math.PI/2);

let primeArrow = new THREE.ArrowHelper(
	prime,
	body[i].mesh.position,
	body[i].radiusEquator * 5000 * scale,
	0x00ffff);
body[i].mesh.attach(primeArrow);
*/

/*
let pole = new THREE.Vector3();
body[i].mesh.rotateX(-Math.PI/2);
body[i].mesh.getWorldDirection(pole);
body[i].mesh.rotateX(Math.PI/2);

let poleArrow = new THREE.ArrowHelper(
	pole,
	body[i].mesh.position,
	body[i].radiusEquator * 5000 * scale,
	0xff00ff);
body[i].mesh.attach(poleArrow);
*/




/*
// create prime meridian arrow (scales WITH parent body)
body[i].primeArrow = new THREE.ArrowHelper(
	new THREE.Vector3(1, 0, 0),
	body[i].mesh.position,
	body[i].radiusEquator * 5000 * scale,
	0xff0000);
body[i].mesh.add(body[i].primeArrow);

// create axis arrow
body[i].primeArrow = new THREE.ArrowHelper(
	new THREE.Vector3(0, 1, 0),
	body[i].mesh.position,
	body[i].radiusEquator * 5000 * scale,
	0x00ffff);
body[i].mesh.add(body[i].primeArrow);
body[i].primeArrow.visible = true;
*/

/*
// create prime meridian arrow ---- the hard way
body[i].primeArrow = new THREE.ArrowHelper(
	yAxis,
	body[i].mesh.position,
	body[i].radiusEquator * 5000 * scale,
	0xff0000);

body[i].primeArrow.rotation.set(Math.PI / 2, 0, -Math.PI / 2 +
	body[i].declination);
body[i].primeArrow.rotateOnWorldAxis(zAxis, body[i].rightAscension);
body[i].primeArrow.rotateY(Math.PI / 2 + body[i].primeMeridian);
body[i].primeArrow.rotateZ(-Math.PI / 2);

body[i].mesh.attach(body[i].primeArrow);
body[i].primeArrow.visible = true;
*/






		// create ecef axes helper
		body[i].axesHelper = new THREE.AxesHelper(body[i].radiusEquator * 1.5 *
			scale);
		// same config as spheroid
		body[i].axesHelper.rotation.set(Math.PI / 2, 0, -Math.PI / 2 +
			body[i].declination);
		body[i].axesHelper.rotateOnWorldAxis(zAxis, body[i].rightAscension);
		body[i].axesHelper.rotateY(Math.PI / 2 + body[i].primeMeridian);
		// rotate to appear as z-up (space axes convention)
		body[i].axesHelper.rotateX(-Math.PI / 2);
		body[i].mesh.attach(body[i].axesHelper);
		body[i].axesHelper.visible = false;

		// create eci axes helper
		body[i].axesHelperEci = new THREE.AxesHelper(body[i].radiusEquator * 2.25 *
			scale);
		// same config as spheroid
		body[i].axesHelperEci.rotation.set(Math.PI / 2, 0, -Math.PI / 2 +
			body[i].declination);
		body[i].axesHelperEci.rotateOnWorldAxis(zAxis, body[i].rightAscension);
		//body[i].axesHelperEci.rotateY(Math.PI / 2 + body[i].primeMeridian);
		// rotate to appear as z-up (space axes convention)
		body[i].axesHelperEci.rotateX(-Math.PI / 2);
		scene.add(body[i].axesHelperEci);
		body[i].axesHelperEci.visible = false;

		// create icrf axes helper
		body[i].axesHelperIcrf = new THREE.AxesHelper(
			body[i].radiusEquator * 3 * scale);
		// add to scene so it doesn't rotate with parent. must update position.
		scene.add(body[i].axesHelperIcrf);
		body[i].axesHelperIcrf.visible = false;

		{
			const map = new THREE.TextureLoader().load("graphics/circle-64.png");
			body[i].sprite = new THREE.Sprite(new THREE.SpriteMaterial({
				map: map,
				color: body[i].color,
				sizeAttenuation: false}));
			body[i].sprite.scale.set(100 * scale, 100 * scale, 1);
			body[i].mesh.add(body[i].sprite);
		}
	}
} // end makeNaturalBodyGraphics()

document.getElementById("1kEarth").checked = true;
function changeEarth(value) {
	if (body[earth].mesh.material.map) {
		body[earth].mesh.material.map.dispose();
		body[earth].mesh.material.map = null;
	}
	switch (value) {
		case "0":
			body[earth].map = null;
			//body[earth].mesh.material.map = null;
			if (body[earth].color) {
				body[earth].mesh.material.color.setHex(body[earth].color);
			}
			body[earth].mesh.material.needsUpdate = true;
			break;
		case "1":
			body[earth].mesh.material.color.setHex(0xffffff);
			body[earth].map = "graphics/planet3_1k.jpg";
			body[earth].mesh.material.map =
				new THREE.TextureLoader().load(body[earth].map);

			// pixelated and more efficient
			body[earth].mesh.material.map.magFilter = THREE.NearestFilter;
			body[earth].mesh.material.map.minFilter = THREE.NearestFilter;

			body[earth].mesh.material.needsUpdate = true;
			break;
		case "2":
			body[earth].mesh.material.color.setHex(0xffffff);
			body[earth].map = "graphics/planet3_4k.jpg";
			body[earth].mesh.material.map =
				new THREE.TextureLoader().load(body[earth].map);

			// pixelated and more efficient
			body[earth].mesh.material.map.magFilter = THREE.NearestFilter;
			body[earth].mesh.material.map.minFilter = THREE.NearestFilter;

			body[earth].mesh.material.needsUpdate = true;
			break;
		default:
			body[earth].map = null;
			body[earth].mesh.material.map = null;
			if (body[earth].color) {
				body[earth].mesh.material.color.setHex(body[earth].color);
			}
			body[earth].mesh.material.needsUpdate = true;
	} 
}

// initialize in case of refresh
document.getElementById("cityLight").disabled = true;
document.getElementById("cityLight").value = 30;
document.getElementById("cityLightOutput").innerHTML = "100%";
// Update the current slider value (each time you drag the slider handle)
document.getElementById("cityLight").oninput = function() {
	document.getElementById("cityLightOutput").innerHTML =
	Math.round(this.value * 3.3333) + "%";
	body[earth].mesh.material.emissiveIntensity = this.value / 100;
}
document.getElementById("cityLightLock").checked = true;
function cityLightLock() {
	if (document.getElementById("cityLight").disabled === true) {
		document.getElementById("cityLight").disabled = false;
	} else {
		document.getElementById("cityLight").disabled = true;
	}
}


// initialize in case of refresh
document.getElementById("sunlight").disabled = true;
document.getElementById("sunlight").value = 75;
document.getElementById("sunlightOutput").innerHTML = "100%";
// Update the current slider value (each time you drag the slider handle)
document.getElementById("sunlight").oninput = function() {
	document.getElementById("sunlightOutput").innerHTML =
	Math.round(this.value * 1.3333) + "%";
	body[sun].sunlight.intensity = this.value / 50; // range 0 to 2
}
document.getElementById("sunlightLock").checked = true;
function sunlightLock() {
	if (document.getElementById("sunlight").disabled === true) {
		document.getElementById("sunlight").disabled = false;
	} else {
		document.getElementById("sunlight").disabled = true;
	}
}


////////////////////////////////////////////////////////////////////////////////
// view control

let view = 0;

function throttleShow() {
	if (body[view].throttleOn) {
		document.getElementById("hudThrottle").innerHTML = body[view].throttle +
			"%<br>on";
	// make sure it's false, not undefined as if a "Natural" body
	} else if (body[view].throttleOn === false) {
		document.getElementById("hudThrottle").innerHTML = body[view].throttle +
			"%<br>off";
	} else {
		document.getElementById("hudThrottle").innerHTML = "";
	}
}

function viewFinalize() {
	if (body[view].type === "Natural") {
		controls.minDistance = body[view].radiusEquator * 1.2 * scale;
		scene2.visible = false;
		let panel = document.getElementsByClassName("rocketPanel");
		for (let i = panel.length - 1; i > -1; i--) {
			panel[i].style.visibility = "hidden";
		}
	} else {
		scene2.visible = true;
		document.getElementById("hudFuel").innerHTML =
			body[view].fuelMass.toFixed(0) + "<br>kg fuel";
		document.getElementById("hudPitch").innerHTML =
			Math.round(body[view].xSpin * 10) + "<br>pitch";
		document.getElementById("hudYaw").innerHTML =
			Math.round(- body[view].ySpin * 10) + "<br>yaw";
		document.getElementById("hudRoll").innerHTML =
			Math.round(body[view].zSpin * 10) + "<br>roll";
		let panel = document.getElementsByClassName("rocketPanel");
		for (let i = panel.length - 1; i > -1; i--) {
			panel[i].style.visibility = "visible";
		}
		controls.minDistance = 60 * scale;
	}
	// sun view
	if (view === 0) {
		body[view].mesh.material.emissiveIntensity = 0;
		starlight.intensity = 1;
		document.getElementById("hudView").innerHTML = body[view].name + "<br>@ " +
			"mlky";
		document.querySelector("#singleOrbit").disabled = true;
	}
	else {
		body[mostMassiveBody].mesh.material.emissiveIntensity = 1;
		starlight.intensity = starlightControl;
		document.getElementById("hudView").innerHTML = body[view].name + "<br>@ " +
			body[body[view].focus].name;
		document.querySelector("#singleOrbit").disabled = false;
	}

	// hide throttle slider
	document.getElementById("throttleAdjustContainer").style.visibility =
		"hidden";
	throttleShow();

	// manage check boxes in menu
	if (body[view].alwaysShowOrbit === undefined) {
		document.querySelector("#singleOrbit").checked = false;
	} else {
		document.querySelector("#singleOrbit").checked = body[view].alwaysShowOrbit;
	}
	document.querySelector("#localAxes").checked = body[view].axesHelper.visible;
}

const spriteTriangleMap =
	new THREE.TextureLoader().load("graphics/triangle-64.png");
function addRocketHelpers(i) {
	body[i].axesHelper = new THREE.AxesHelper(250e3 * scale);

	body[i].axesHelper.position.copy(body[i].mesh.position);
/*
	// dev5
	// this doesn't even work
	body[i].axesHelper.position.x = body[i].x * scale;
	body[i].axesHelper.position.y = body[i].y * scale;
	body[i].axesHelper.position.z = body[i].z * scale;
*/
	body[i].axesHelper.rotation.copy(body[i].mesh.rotation);
	// rotate to NED (north, east, down) convention for spacecraft
	// +x forward, -x aft
	// +y starboard, -y port
	// +z nadir, -z zenith
	body[i].axesHelper.rotateX(Math.PI);
	body[i].axesHelper.rotateZ(-Math.PI / 2);
	body[i].mesh.attach(body[i].axesHelper);
	body[i].axesHelper.visible = false;

	// update pointing before using
	body[i].pointingM4.extractRotation(body[i].mesh.matrix);
	// get unit vector of direction
	body[i].pointingV3 =
		body[i].mesh.up.clone().applyMatrix4(body[i].pointingM4);

	body[i].thrustArrow = new THREE.ArrowHelper(
		body[i].pointingV3,
		body[i].mesh.position,
		1000e3 * scale,
		0xff0000);
	body[i].mesh.attach(body[i].thrustArrow);
	body[i].thrustArrow.visible = false;


	body[i].sprite = new THREE.Sprite(new THREE.SpriteMaterial({
		map: spriteTriangleMap,
		color: body[i].color,
		sizeAttenuation: false}));

	// scale sprite for gltf model mk1r2
	//body[i].sprite.scale.set(1000, 1000, 1)
	// scale sprite for cylinder geometry
	body[i].sprite.scale.set(0.01, 0.01, 1);

	body[i].mesh.add(body[i].sprite);
}


// rocket


/*
requires structure of objects:
body[i] = {
	stage2 = {
		fairingN = {}
		fairingZ = {}
		... and maybe  in the future... payload = {}
	}
}

"mesh" is always the master mesh. sub-meshes that will never be independent are
called other things like cap, mid, and nose.
*/

// STAGE 1

// stage 1
const f9s1_geo = new THREE.CylinderGeometry(
	1.83 * scale, 1.83 * scale, 37.88 * scale, 16);
const f9s1_texture = new THREE.TextureLoader().load("graphics/f9s1.png");
f9s1_texture.magFilter = THREE.NearestFilter;
f9s1_texture.minFilter = THREE.NearestFilter;
const f9s1_mat = new THREE.MeshLambertMaterial({
	map: f9s1_texture});

// bottom cap to hide stage 1 graphics wrap
const f9s1_bCapGeo = new THREE.CylinderGeometry(
	1.83 * scale, 1.83 * scale, 0.02 * scale, 16);
const f9s1_bCapMat = new THREE.MeshLambertMaterial({color:0x333333});

// top cap to hide stage 1 graphics wrap
const f9s1_tCapGeo = new THREE.CylinderGeometry(
	1.83 * scale, 1.83 * scale, 0.02 * scale, 16);
const f9s1_tCapMat = new THREE.MeshLambertMaterial({color:0x555555});

// interstage
const f9s1_intGeo = new THREE.CylinderGeometry(
	1.83 * scale, 1.83 * scale, 4.7 * scale, 16, 1, true);
const f9s1_intMat = new THREE.MeshLambertMaterial({
	side: THREE.DoubleSide, color:0x000000});


// STAGE 2

// add stage 2 mesh
const f9s2_geo = new THREE.CylinderGeometry(
	1.83 * scale, 1.83 * scale, 13.8 * scale, 16);
const f9s2_texture = new THREE.TextureLoader().load("graphics/f9stage2.png");
f9s2_texture.magFilter = THREE.NearestFilter;
f9s2_texture.minFilter = THREE.NearestFilter;
const f9s2_mat = new THREE.MeshLambertMaterial({map: f9s2_texture});

// stage 2 engine
const f9s2_engGeo = new THREE.CylinderGeometry(
	0.7 * scale, 1.6 * scale, 4 * scale, 16, 1, true);
const f9s2_engMat = new THREE.MeshLambertMaterial({
	side: THREE.DoubleSide, color:0x888888});

// payload attachment fitting
const f9s2_pafGeo = new THREE.CylinderGeometry(
	1 * scale, 1.83 * scale, 1.3 * scale, 16);
const f9s2_pafMat = new THREE.MeshLambertMaterial({
	side: THREE.DoubleSide, color:0xaaaaaa});


// plain lambert double-sided material
const f9f_lamDouble = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});


// NADIR FAIRING

// fairing base expansion section, Nadir
const f9fn_baseGeo = new THREE.CylinderGeometry(
	2.6 * scale, 1.83 * scale, 1.3 * scale, 16, 1, true, Math.PI / 2, Math.PI);

// fairing mid section, Nadir
const f9fn_texture = new THREE.TextureLoader().load("graphics/f9fairingN.png");
f9fn_texture.magFilter = THREE.NearestFilter;
f9fn_texture.minFilter = THREE.NearestFilter;
const f9fn_midGeo = new THREE.CylinderGeometry(
	2.6 * scale, 2.6 * scale, 6.7 * scale, 16, 1, true, Math.PI / 2, Math.PI);
const f9fn_midMat = new THREE.MeshLambertMaterial({
	side: THREE.DoubleSide, map: f9fn_texture});

// fairing nose aerodynamic shape, Nadir
const f9fn_noseGeo = new THREE.SphereGeometry(
	2.6 * scale, 16, 8, Math.PI, Math.PI, 0, Math.PI / 2);


// ZENITH FAIRING

// fairing base expansion section, Zenith
const f9fz_baseGeo = new THREE.CylinderGeometry(2.6 * scale, 1.83 * scale,
	1.3 * scale, 16, 1, true, Math.PI + Math.PI / 2, Math.PI);

// fairing mid section, Zenith
const f9fz_texture = new THREE.TextureLoader().load("graphics/f9fairingZ.png");
f9fz_texture.magFilter = THREE.NearestFilter;
f9fz_texture.minFilter = THREE.NearestFilter;
const f9fz_midGeo = new THREE.CylinderGeometry(2.6 * scale, 2.6 * scale,
	6.7 * scale, 16, 1, true, Math.PI + Math.PI / 2, Math.PI);
const f9fz_midMat = new THREE.MeshLambertMaterial({
	side: THREE.DoubleSide, map: f9fz_texture});

// fairing nose aerodynamic shape, Zenith
const f9fz_noseGeo = new THREE.SphereGeometry(
	2.6 * scale, 16, 8, 0, Math.PI, 0, Math.PI / 2);


function addFalconGraphics(i) {

	// stage 1
	body[i].mesh = new THREE.Mesh(f9s1_geo, f9s1_mat);

	// bottom cap to hide stage 1 graphics wrap
	body[i].bCap = new THREE.Mesh(f9s1_bCapGeo, f9s1_bCapMat);
	body[i].bCap.position.set(0, - (37.88/2 + 0.01) * scale, 0);
	body[i].mesh.add(body[i].bCap);

	// top cap to hide stage 1 graphics wrap
	body[i].tCap = new THREE.Mesh(f9s1_tCapGeo, f9s1_tCapMat);
	body[i].tCap.position.set(0, (37.88/2 + 0.01) * scale, 0);
	body[i].mesh.add(body[i].tCap);

	// interstage
	body[i].interstage = new THREE.Mesh(f9s1_intGeo, f9s1_intMat);
	body[i].interstage.position.set(0, (37.88/2 + 0.02 + 4.7/2) * scale, 0);
	body[i].mesh.add(body[i].interstage);


	//let s2 = 37.88/2 + 0.02 + 4.7 + 13.8/2; // 30.56
	// add stage 2 mesh
	body[i].stage2.mesh = new THREE.Mesh(f9s2_geo, f9s2_mat);
	body[i].stage2.mesh.position.set(0, 30.56 * scale, 0);
	body[i].mesh.add(body[i].stage2.mesh);

	// stage 2 engine
	body[i].stage2.engine = new THREE.Mesh(f9s2_engGeo, f9s2_engMat);
	body[i].stage2.engine.position.set(0, - (13.8/2 + 4/2) * scale, 0);
	body[i].stage2.mesh.add(body[i].stage2.engine);

	// payload attachment fitting
	body[i].stage2.paf = new THREE.Mesh(new THREE.CylinderGeometry(
		1 * scale, 1.83 * scale, 1.3 * scale, 16),
		new THREE.MeshLambertMaterial({side: THREE.DoubleSide, color:0xaaaaaa}));
	body[i].stage2.paf.position.set(0, (13.8/2 + 1.3/2) * scale, 0);
	body[i].stage2.mesh.add(body[i].stage2.paf);


	// fairing mid section, Nadir
	body[i].stage2.fairingN.mesh = new THREE.Mesh(f9fn_midGeo, f9fn_midMat);
	body[i].stage2.fairingN.mesh.position.set(
		0, (13.8/2 + 1.3 + 6.7/2) * scale, 0);
	body[i].stage2.mesh.add(body[i].stage2.fairingN.mesh);

	// fairing base expansion section, Nadir
	body[i].stage2.fairingN.base = new THREE.Mesh(f9fn_baseGeo, f9f_lamDouble);
	body[i].stage2.fairingN.base.position.set(0, - (6.7/2 + 1.3/2) * scale, 0);
	body[i].stage2.fairingN.mesh.add(body[i].stage2.fairingN.base);

	// fairing nose aerodynamic shape, Nadir
	body[i].stage2.fairingN.nose = new THREE.Mesh(f9fn_noseGeo, f9f_lamDouble);
	body[i].stage2.fairingN.nose.position.set(0, (6.7/2) * scale, 0);
	//body[i].stage2.fairingN.nose.rotation.set(0, Math.PI / 2, 0); // for texture
	body[i].stage2.fairingN.nose.scale.y = 2;
	body[i].stage2.fairingN.mesh.add(body[i].stage2.fairingN.nose);



	// fairing mid section, Zenith
	body[i].stage2.fairingZ.mesh = new THREE.Mesh(f9fz_midGeo, f9fz_midMat);
	body[i].stage2.fairingZ.mesh.position.set(
		0, (13.8/2 + 1.3 + 6.7/2) * scale, 0);
	body[i].stage2.mesh.add(body[i].stage2.fairingZ.mesh);

	// fairing base expansion section, Zenith
	body[i].stage2.fairingZ.base = new THREE.Mesh(f9fz_baseGeo, f9f_lamDouble);
	body[i].stage2.fairingZ.base.position.set(0, - (6.7/2 + 1.3/2) * scale, 0);
	body[i].stage2.fairingZ.mesh.add(body[i].stage2.fairingZ.base);

	// fairing nose aerodynamic shape, Zenith
	body[i].stage2.fairingZ.nose = new THREE.Mesh(f9fz_noseGeo, f9f_lamDouble);
	body[i].stage2.fairingZ.nose.position.set(0, (6.7/2) * scale, 0);
	//body[i].stage2.fairingZ.nose.rotation.set(0, Math.PI / 2, 0); // for texture
	body[i].stage2.fairingZ.nose.scale.y = 2;
	body[i].stage2.fairingZ.mesh.add(body[i].stage2.fairingZ.nose);


	//body[i].mesh.receiveShadow = true;

	body[i].mesh.up.set(0, 1, 0);
	body[i].stage2.mesh.up.set(0, 1, 0);
	body[i].stage2.fairingN.mesh.up.set(0, 1, 0);
	body[i].stage2.fairingZ.mesh.up.set(0, 1, 0);
	

	// rotate mesh so it's standing up on the ground:
	// get the direction vector that defines up relative to ground...
	// the cheap and easy way is for a sphere, not oblate spheroid
	// and this way also aligns with the navball
	const focus = body[i].focus;
	let enu = getDirections(body[i].cartes.x, body[i].cartes.y, body[i].cartes.z,
		body[focus].mesh.quaternion);
	let navM4 = new THREE.Matrix4().makeBasis(
		enu.northAxisV3, enu.upAxisV3, enu.eastAxisV3);
	body[i].mesh.quaternion.setFromRotationMatrix(navM4);

	// set so pitching down points east
	body[i].mesh.rotateY(Math.PI);

	// update thrust vector
	body[i].pointingM4.extractRotation(body[i].mesh.matrix);
	// get unit vector of direction
	body[i].pointingV3 =
		body[i].mesh.up.clone().applyMatrix4(body[i].pointingM4);

	scene.add(body[i].mesh);

	addRocketHelpers(i);

	// post-setup global adjustments
	view = i;
	viewFinalize();
	controls.minDistance = 75 * scale;
}


// gray "of course i still love you" launch pad
const ofcPad_geo = new THREE.PlaneGeometry(200 * scale, 200 * scale);
const ofcPad_mat = new THREE.MeshLambertMaterial({
		map: new THREE.TextureLoader().load("graphics/ofcpadg.png"),
		side: THREE.DoubleSide,
		transparent: true
});

let pad = [];
function addLaunchPad(gps, i) {

	if (i === undefined) {
		i = earth;
	}

	let p = pad.push(new THREE.Group()) - 1;

	let ecef = gpsToEcef(gps, body[i].radiusEquator,
		body[i].e2);

	let	cartesEci = ecefToEci(ecef, body[i].spun,
		body[i].angularVelocity, body[i].radiusEquator, body[i].e2);

	// not necessary for earth, but should be standard practice
	let cartes = eciToIcrf(cartesEci,
		body[i].rightAscension, body[i].declination);

	pad[p].position.set(
		cartes.x * scale,
		cartes.y * scale,
		cartes.z * scale
	);

	let enu = getDirections(cartes.x, cartes.y, cartes.z,
		body[i].mesh.quaternion);
	let navM4 = new THREE.Matrix4().makeBasis(
		enu.northAxisV3, enu.upAxisV3, enu.eastAxisV3);
	pad[p].quaternion.setFromRotationMatrix(navM4);

	pad[p].rotateX(Math.PI / 2 + Math.PI);
	pad[p].rotateZ(- Math.PI / 2);

	// should be globalized to share resource
	pad[p].surface = new THREE.Mesh(ofcPad_geo, ofcPad_mat);
	pad[p].surface.material.map.magFilter = THREE.NearestFilter;
	pad[p].surface.material.map.minFilter = THREE.NearestFilter;
	pad[p].surface.position.set(0, 0, - (37.88/2 + 0.02) * scale);
	pad[p].add(pad[p].surface);

	// zero-out mesh position so the pad will be added in the right place
	let x = body[i].mesh.position.x;
	let y = body[i].mesh.position.y;
	let z = body[i].mesh.position.z;
	body[i].mesh.position.set(0, 0, 0);

	// attach (as opposed to add) to retain world transform
	body[i].mesh.attach(pad[p]);

	// restore original mesh position
	body[i].mesh.position.set(x, y, z);

	return p;
}



document.querySelector("#clouds").checked = false;
function toggleClouds() {
	if (body[earth].clouds.visible === false) {
		body[earth].clouds.visible = true;
	} else {
		body[earth].clouds.visible = false;
	}
}

document.querySelector("#sprites").checked = true;
function toggleSprites() {
	if (body[0].sprite.visible === true) {
		for (let i = body.length - 1; i > -1; i--) {
			body[i].sprite.visible = false;
		}
	} else {
		for (let i = body.length - 1; i > -1; i--) {
			body[i].sprite.visible = true;
		}
	}
}


document.querySelector("#localAxes").checked = false;
function toggleAxes() {
	if (body[view].type === "Artificial") {
		if (body[view].axesHelper.visible === true) {
			body[view].axesHelper.visible = false;
			body[view].thrustArrow.visible = false;
		} else {
			body[view].axesHelper.visible = true;
			body[view].thrustArrow.visible = true;
		}
	} else {
		if (body[view].axesHelper.visible === true) {
			body[view].axesHelper.visible = false;
			body[view].axesHelperIcrf.visible = false;
			body[view].axesHelperEci.visible = false;
		} else {
			body[view].axesHelper.visible = true;
			body[view].axesHelperIcrf.visible = true;
			body[view].axesHelperEci.visible = true;
		}
	}
}

// create solar system barycenter icrf axes helper
document.querySelector("#ssbAxes").checked = false;
let ssbAxesHelperIcrf = new THREE.AxesHelper(25e9 * scale);
ssbAxesHelperIcrf.visible = false;
scene.add(ssbAxesHelperIcrf);
function toggleSsbAxes() {
	if (ssbAxesHelperIcrf.visible) {
		ssbAxesHelperIcrf.visible = false;
	} else {
		ssbAxesHelperIcrf.visible = true;
	}
}
