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
			body[i].mesh.scale.z = body[i].radiusPole / body[i].radiusEquator;
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

		// turn to z-up, then Dec, thrn RA, then W.
		body[i].mesh.rotation.set(Math.PI / 2, 0, -Math.PI / 2 +
			body[i].declination);
		body[i].mesh.rotateOnWorldAxis(zAxis, body[i].rightAscension);
		body[i].mesh.rotateY(Math.PI / 2 + body[i].primeMeridian);

		scene.add(body[i].mesh);

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
	controls.target = body[view].mesh.position;
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

	//body[view].mesh.attach(camera); // first person?

	// manage check boxes in menu
	if (body[view].alwaysShowOrbit === undefined) {
		document.querySelector("#singleOrbit").checked = false;
	} else {
		document.querySelector("#singleOrbit").checked = body[view].alwaysShowOrbit;
	}
	
	document.querySelector("#localAxes").checked = body[view].axesHelper.visible;
}


function addRocketHelpers(i) {
	body[i].axesHelper = new THREE.AxesHelper(250e3 * scale);
	body[i].axesHelper.position.copy(body[i].mesh.position);
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
		map: new THREE.TextureLoader().load("graphics/triangle-64.png"),
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


// fairing base expansion section, Nadir +Z
const f9fn_baseGeo = new THREE.CylinderGeometry(
	2.6 * scale, 1.83 * scale, 1.3 * scale, 16, 1, true, Math.PI / 2, Math.PI);
const f9fn_baseMat = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});

// fairing base expansion section, Zenith -Z
const f9fz_baseGeo = new THREE.CylinderGeometry(2.6 * scale, 1.83 * scale,
	1.3 * scale, 16, 1, true, Math.PI + Math.PI / 2, Math.PI);
const f9fz_baseMat = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});

const f9fn_texture = new THREE.TextureLoader().load("graphics/f9fairingN.png");
f9fn_texture.magFilter = THREE.NearestFilter;
f9fn_texture.minFilter = THREE.NearestFilter;
const f9fn_midGeo = new THREE.CylinderGeometry(
	2.6 * scale, 2.6 * scale, 6.7 * scale, 16, 1, true, Math.PI / 2, Math.PI);
const f9fn_midMat = new THREE.MeshLambertMaterial({
	side: THREE.DoubleSide, map: f9fn_texture});

// fairing mid section, Zenith
const f9fz_texture = new THREE.TextureLoader().load("graphics/f9fairingZ.png");
f9fz_texture.magFilter = THREE.NearestFilter;
f9fz_texture.minFilter = THREE.NearestFilter;
const f9fz_midGeo = new THREE.CylinderGeometry(2.6 * scale, 2.6 * scale,
	6.7 * scale, 16, 1, true, Math.PI + Math.PI / 2, Math.PI);
const f9fz_midMat = new THREE.MeshLambertMaterial({
	side: THREE.DoubleSide, map: f9fz_texture});


// fairing nose aerodynamic shape, Nadir
const f9fn_noseGeo = new THREE.SphereGeometry(
	2.6 * scale, 16, 8, Math.PI, Math.PI, 0, Math.PI / 2);
const f9fn_noseMat = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});

// fairing nose aerodynamic shape, Zenith
const f9fz_noseGeo = new THREE.SphereGeometry(
	2.6 * scale, 16, 8, 0, Math.PI, 0, Math.PI / 2);
const f9fz_noseMat = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});


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


	// fairing base expansion section, Nadir +Z
	body[i].stage2.fairingN.mesh = new THREE.Mesh(f9fn_baseGeo, f9fn_baseMat);
	body[i].stage2.fairingN.mesh.position.set(0, (13.8/2 + 1.3/2) * scale, 0);
	body[i].stage2.mesh.add(body[i].stage2.fairingN.mesh);

	// fairing base expansion section, Zenith -Z
	body[i].stage2.fairingZ.mesh = new THREE.Mesh(f9fz_baseGeo, f9fz_baseMat);
	body[i].stage2.fairingZ.mesh.position.set(0, (13.8/2 + 1.3/2) * scale, 0);
	body[i].stage2.mesh.add(body[i].stage2.fairingZ.mesh);

	// fairing mid section, Nadir
	body[i].stage2.fairingN.mid = new THREE.Mesh(f9fn_midGeo, f9fn_midMat);
	body[i].stage2.fairingN.mid.position.set(0, (1.3/2 + 6.7/2) * scale, 0);
	body[i].stage2.fairingN.mesh.add(body[i].stage2.fairingN.mid);

	// fairing mid section, Zenith
	body[i].stage2.fairingZ.mid = new THREE.Mesh(f9fz_midGeo, f9fz_midMat);
	body[i].stage2.fairingZ.mid.position.set(0, (1.3/2 + 6.7/2) * scale, 0);
	body[i].stage2.fairingZ.mesh.add(body[i].stage2.fairingZ.mid);

	// fairing nose aerodynamic shape, Nadir
	body[i].stage2.fairingN.nose = new THREE.Mesh(f9fn_noseGeo, f9fn_noseMat);
	body[i].stage2.fairingN.nose.position.set(0, (1.3/2 + 6.7) * scale, 0);
	//body[i].stage2.fairingN.nose.rotation.set(0, Math.PI / 2, 0); // for texture
	body[i].stage2.fairingN.nose.scale.y = 2;
	body[i].stage2.fairingN.mesh.add(body[i].stage2.fairingN.nose);

	// fairing nose aerodynamic shape, Zenith
	body[i].stage2.fairingZ.nose = new THREE.Mesh(f9fz_noseGeo, f9fz_noseMat);
	body[i].stage2.fairingZ.nose.position.set(0, (1.3/2 + 6.7) * scale, 0);
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
	controls.target = body[view].mesh.position;
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

		// apply the system coordinates for rendering
		body[i].mesh.position.x = body[i].x * scale;
		body[i].mesh.position.y = body[i].y * scale;
		body[i].mesh.position.z = body[i].z * scale;
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
		Math.round(timestep * 100).toString() + "<br>" + state;
}
function faster() {
	if (timestep < 80000) timestep *= 2;
	showStep();
}
function slower() {
	if (timestep > .01) timestep /= 2;
	if (timestep < .01) timestep = .01;
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
}



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
}

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
}

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

				if (i === view) {
					document.getElementById("hudFuel").innerHTML =
						body[i].fuelMass.toFixed(0) + "<br>kg fuel";
				}

				body[i].onSurface = false;

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
	document.getElementById("hudFuel").innerHTML =
		body[view].fuelMass.toFixed(0) + "<br>kg fuel";
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

const GRAVITY = 6.6743e-11;

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
			let distance = Math.sqrt(distanceX**2 + distanceY**2 + distanceZ**2);

			// avoid division by zero
			if (distance === 0) continue;

			// newton's law of universal gravitation, but only in one direction
			let force = GRAVITY * (body[j].mass / distance**2);

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

		// use the updated vectors and mu to get keplerian elements
		body[i].mu = GRAVITY * (body[focus].mass + body[i].mass);
		body[i].kepler = toKepler(body[i].cartesEci, body[i].mu);


		if (!body[i].onSurface) {
			// increment position (this code IS compatible with hyperbolic)
			// add to mean anomaly (rene schwarz method). units in seconds
			body[i].kepler.meanAnom += timestep *
				Math.sqrt(body[i].mu / Math.abs(body[i].kepler.a)**3);
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
				body[i].nodal = nodalPrecession(body[i].kepler, body[i].mu,
					body[focus].J2, body[focus].radiusEquator);
				body[i].kepler.lan += body[i].nodal.lanRate * timestep;
				body[i].kepler.w += body[i].nodal.wRate * timestep;
			}
		}

		// use the new keplerian elements to get new vectors
		body[i].cartesEci = toCartes(body[i].kepler, body[i].mu);


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
		body[i].mu = GRAVITY * (body[focus].mass + body[i].mass);
		body[i].kepler = toKepler(body[i].cartesEci, body[i].mu);
//	}
//}
*/

////////////////////////////////////////////////////////////////////////////////

		/*
		if (body[i].cartesEci.iterations === body[i].cartesEci.maxIterations) {
			console.log(body[i].name + " is being ejected.");
			body.splice(i);
			continue;
			// what if it is a focus when ejected? potential bug
		}
		*/

		/*
		{
			let {x, y, z, vx, vy, vz} = body[i].cartesEci;

			if (isNaN(x) || isNaN(y) || isNaN(z) ||
				isNaN(vx) || isNaN(vy) || isNaN(vz)) {

				console.log("ERROR. index: " + i + ", name: " + body[i].name);
				//console.log(ct);
				//console.log(kt);
				console.log("onSurface: " + body[i].onSurface);
				//console.log(m1, m2);
				console.log(body[i].kepler);
				console.log(body[i].cartesEci);
				console.log(x, y, z, vx, vy, vz);

				clearInterval(loop);
				return;
				//playPause();
				//debugger;
				//throw new Error("just stop...");
				//failerFunction();
				//new new;
			}
		}
		*/

		// celestial body rotations
		if (body[i].type === "Natural") {
			if (body[i].tidallyLocked !== true) {
				body[i].mesh.rotateY(body[i].angularVelocity * timestep);
				body[i].spun += body[i].angularVelocity * timestep;
				if (i === earth) {
					body[i].clouds.rotateY(body[i].angularVelocity * timestep / 12);
				}
			} else {
				// cartes.truAnom is new, kepler.truAnom is old
				body[i].mesh.rotateY(body[i].cartesEci.truAnom -
					body[i].kepler.truAnom);
				body[i].spun += body[i].cartesEci.truAnom - body[i].kepler.truAnom;
			}
			body[i].spun %= 2 * Math.PI;
		} else {
		//if (body[i].type === "Artificial") {

		// get Earth-Centered-Earth-Fixed and GPS coordinates
			if (!body[i].onSurface) {
				body[i].ecef = eciToEcef(body[i].cartesEci,
					body[focus].spun,
					body[focus].angularVelocity,
					body[focus].radiusEquator, body[focus].e2);
				body[i].gps = ecefToGps(body[i].ecef, body[focus].radiusEquator,
					body[focus].e2);
				if (body[i].gps.alt < 0) {
					// pop back up to surface (this has issues)
					//body[i].gps.alt = 0;

					// obstruction of ground eliminates velocity
					body[i].ecef.vx = 0;
					body[i].ecef.vy = 0;
					body[i].ecef.vz = 0;
					body[i].onSurface = true;
					
					//if (body[i].name === "fairingN" || body[i].name === "fairingZ") {
						body[i].xSpin = 0;
						body[i].ySpin = 0;
						body[i].zSpin = 0;
					//}
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

					let velocity = Math.sqrt(
						body[i].ecef.vx**2 +
						body[i].ecef.vy**2 +
						body[i].ecef.vz**2);

					// this should be specific to spacecraft
					// do this for now
					let dragCoefficient = 0.5; // drag coefficient for a cone
					if (body[i].gps.alt > 100000) {
						dragCoefficient = 2.2; // cubesat standard coefficient
						//dragCoefficient = 0.75; // irregular sphere est. for sputnik 1
					}

					body[i].drag = dragEquation(density, velocity, body[i].mass,
						dragCoefficient);

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
	let kepi = toKepi(body[draw].cartes, body[draw].mu);

	// use absolute for safety in case of hyperbola
	const a = Math.abs(body[draw].kepler.a) * scale;
	const e = body[draw].kepler.e;
	const i = kepi.i;
	const lan = kepi.lan;
	const w = kepi.w;

	const b = a * Math.sqrt(1 - e**2);
	const c = -Math.sqrt(a**2 - b**2);

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

	const focus = body[draw].focus;

	body[draw].ellipse.position.copy(body[focus].mesh.position);

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

let verbose = false;
document.querySelector("#toggleHud").checked = false;
function toggleHud() {
	if (verbose === false) {
		document.getElementById("hudDateOrbit").style.height = "142px";
		document.getElementById("hudGpsInfo").style.height = "110px";
		document.getElementById("hudDateOrbit").style.visibility = "visible";
		document.getElementById("hudGpsInfo").style.visibility = "visible";
		verbose = true;
		displayText();
	} else {
		document.getElementById("hudDateOrbit").style.height = "36px";
		document.getElementById("hudGpsInfo").style.height = "24px";
		verbose = false;
		displayText();
	}
}

function simpleHud() {
	if (body[view].type !== "Artificial") {
		document.getElementById("hudDateOrbit").style.visibility = "hidden";
		document.getElementById("hudGpsInfo").style.visibility = "hidden";
		return;
	}
	document.getElementById("hudDateOrbit").style.visibility = "visible";
	document.getElementById("hudGpsInfo").style.visibility = "visible";
	let vFocus = body[view].focus;
	// show mission time
	document.getElementById("hudDateOrbit").innerHTML =
	"T+ " + secondsToYears(body[view].missionTime) +
	"<br>Apoapsis  " + ((body[view].kepler.apoapsis -
		body[vFocus].radiusEquator)
		/ 1000).toFixed(3) + " km" +
	"<br>Periapsis " + ((body[view].kepler.periapsis -
		body[vFocus].radiusEquator) / 1000).toFixed(3) + " km";

	document.getElementById("hudGpsInfo").innerHTML =
		"Altitude " + (body[view].gps.alt / 1000).toFixed(1) + " km" +
		"<br>Speed    " + (Math.sqrt(body[view].ecef.vx**2 +
			body[view].ecef.vy**2 +
			body[view].ecef.vz**2) * 3.6).toFixed(0) + " km/h";
}

function displayText() {

	if (verbose === false) {
		simpleHud();
		return;
	}

	let vFocus = body[view].focus;

	if (view === mostMassiveBody) {
		document.getElementById("hudDateOrbit").innerHTML =
			body.date.toISOString() +
			"<br>r " +
			(Math.sqrt(body[view].x**2 + body[view].y**2 + body[view].z**2) / 1000).
			toFixed(3) + " km" +
			"<br>x " + (body[view].x / 1000).toFixed(3) + " km" +
			"<br>y " + (body[view].y / 1000).toFixed(3) + " km" +
			"<br>z " + (body[view].z / 1000).toFixed(3) + " km" +
			"<br>vx " + (body[view].vx / 1000).toFixed(3) + " km/s" +
			"<br>vy " + (body[view].vy / 1000).toFixed(3) + " km/s" +
			"<br>vz " + (body[view].vz / 1000).toFixed(3) + " km/s" +
			"<br>v " +
			(Math.sqrt(body[view].vx**2 + body[view].vy**2 + body[view].vz**2) /
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
				keplerShow = toKepler(cartesAltPlane, body[view].mu);
			} else if (reportPlane === "icrf") {
				// currently in icrf frame
				keplerShow = toKepler(body[view].cartes, body[view].mu);
			} else if (reportPlane === "galactic") {
				const cartesAltPlane = icrfToEci(body[view].cartes,
					0.38147085502186906, // 21.85667 deg
					0.4735078260660616); // 27.13 deg
				keplerShow = toKepler(cartesAltPlane, body[view].mu);
			} else { // invariable
				const cartesAltPlane = icrfToEci(body[view].cartes,
					4.779584156586472, // 273.85 deg
					1.1691960659110012); // 66.99 deg
				keplerShow = toKepler(cartesAltPlane, body[view].mu);
			}
		} else {
			keplerShow = body[view].kepler;
		}
		document.getElementById("hudDateOrbit").innerHTML =
			body.date.toISOString() +
			"<br>period " + secondsToYears(
				2*Math.PI / Math.sqrt(body[view].mu) * keplerShow.a**(3/2)) +
			"<br>a " + (keplerShow.a / 1000).toFixed(3) + " km" +
			"<br>e " + (keplerShow.e).toFixed(9) +
			"<br>i " + (keplerShow.i * 180 / Math.PI).toFixed(7) + "°" +
			"<br>Ω " + (keplerShow.lan * 180 / Math.PI).toFixed(5) + "°" +
			"<br>ω " + (keplerShow.w * 180 / Math.PI).toFixed(7) + "°" +
			"<br>M " + (keplerShow.meanAnom * 180 / Math.PI).toFixed(5) + "°" +
			"<br>v<sub>o</sub> " + (keplerShow.v * 3.6).toFixed(0) + " km/h" +
			"<br>Ap " + (keplerShow.apoapsis / 1000).toFixed(3) + " km" +
			"<br>Pe " + (keplerShow.periapsis / 1000).toFixed(3) + " km";
	}

	if (body[view].type === "Artificial") {
		document.getElementById("hudGpsInfo").innerHTML =
			"Alt " + (body[view].gps.alt / 1000).toFixed(6) + " km" +
			"<br>v<sub>s</sub> " + (Math.sqrt(body[view].ecef.vx**2 +
				body[view].ecef.vy**2 +
				body[view].ecef.vz**2) * 3.6).toFixed(0) + " km/h" +
			"<br>drag " + body[view].drag.toExponential(2) + " m/s²" +
			"<br>Mass " + body[view].mass.toExponential(3) + " kg" +
			"<br>Lat " + (body[view].gps.lat * 180 / Math.PI).toFixed(6) + "°" +
			"<br>Lon " + (body[view].gps.lon * 180 / Math.PI).toFixed(6) + "°" +
			"<br>Ap<sub>Eq</sub>  " + ((body[view].kepler.apoapsis -
				body[vFocus].radiusEquator)
				/ 1000).toFixed(3) + " km" +
			"<br>Pe<sub>Eq</sub> " + ((body[view].kepler.periapsis -
				body[vFocus].radiusEquator) / 1000).toFixed(3) + " km";
		if (body[view].s1refuelCount) {
			document.getElementById("hudGpsInfo").innerHTML +=
			"<br>s1 refueled: " + body[view].s1refuelCount;
		}
		if (body[view].refuelCount) {
			document.getElementById("hudGpsInfo").innerHTML +=
			"<br>refueled: " + body[view].refuelCount;
		}
	} else {
		document.getElementById("hudGpsInfo").innerHTML =
			"Mass " + body[view].mass.toExponential(3) + " kg" +
			"<br>EqRad " + (body[view].radiusEquator / 1000).toFixed(0) + " km" +
			"<br>PoRad " + (body[view].radiusPole / 1000).toFixed(0) + " km" +
			"<br>Sidereal " + body[view].sidereal.toFixed(2) + " hr";
	}

	// update in case object is now orbiting something else
	if (view !== 0) {
		document.getElementById("hudView").innerHTML = body[view].name + "<br>@ " +
			body[body[view].focus].name;
	} else {
		document.getElementById("hudView").innerHTML = body[view].name + "<br>@ " +
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

// save requests to process when ready. limit 1 during pause.
//let deployLocation = "random";
let addFalconReq = false;
function deploy() {
	//deployLocation = document.getElementById("deployLocation").value;
	addFalconReq = true;
}

function prepStats(j) {
	// prep stats for displayText
	let focus = body[j].focus;
	body[j].cartesEci = icrfToEci(body[j].cartes, body[focus].rightAscension,
		body[focus].declination);
	body[j].mu = GRAVITY * (body[focus].mass + body[j].mass);
	body[j].kepler = toKepler(body[j].cartesEci, body[j].mu);
	body[j].ecef = eciToEcef(body[j].cartesEci,
		body[focus].spun,
		body[focus].angularVelocity,
		body[focus].radiusEquator, body[focus].e2);
	body[j].gps = ecefToGps(body[j].ecef, body[focus].radiusEquator,
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

	body[i].fairingN.cartes.x += body[i].pointingV3.x * 7.55;
	body[i].fairingN.cartes.y += body[i].pointingV3.y * 7.55;
	body[i].fairingN.cartes.z += body[i].pointingV3.z * 7.55;

	// separate
	body[i].mesh.remove(body[i].fairingN.mesh);
	let j = body.push(body[i].fairingN) - 1;
	body[i].fairingN = null;
	scene.add(body[j].mesh);

	body[i].mass -= body[j].mass;
	addRocketHelpers(j);

	// pneumatic separation
	let pneu = 20; // m/s² impulse
	let pneuForward = 10;
	
	let enu = getDirections(body[j].cartes.x, body[j].cartes.y,
		body[j].cartes.z, body[j].mesh.quaternion);
	body[j].cartes.vx -= enu.northAxisV3.x * pneu;
	body[j].cartes.vy -= enu.northAxisV3.y * pneu;
	body[j].cartes.vz -= enu.northAxisV3.z * pneu;
	
	body[j].cartes.vx += enu.upAxisV3.x * pneuForward;
	body[j].cartes.vy += enu.upAxisV3.y * pneuForward;
	body[j].cartes.vz += enu.upAxisV3.z * pneuForward;

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
	body[i].fairingZ.cartes.x += body[i].pointingV3.x * 7.55;
	body[i].fairingZ.cartes.y += body[i].pointingV3.y * 7.55;
	body[i].fairingZ.cartes.z += body[i].pointingV3.z * 7.55;

	// separate
	body[i].mesh.remove(body[i].fairingZ.mesh);
	j = body.push(body[i].fairingZ) - 1;
	body[i].fairingZ = null;
	scene.add(body[j].mesh);

	body[i].mass -= body[j].mass;
	addRocketHelpers(j);

	// pneumatic separation
	body[j].cartes.vx += enu.northAxisV3.x * pneu;
	body[j].cartes.vy += enu.northAxisV3.y * pneu;
	body[j].cartes.vz += enu.northAxisV3.z * pneu;

	body[j].cartes.vx += enu.upAxisV3.x * pneuForward;
	body[j].cartes.vy += enu.upAxisV3.y * pneuForward;
	body[j].cartes.vz += enu.upAxisV3.z * pneuForward;

	body[j].xSpin = 0.4;

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

	// what if it's fairingN? or fairingZ?
	if (body[i].mid) {
		body[i].mesh.remove(body[i].mid);
		body[i].mid.geometry.dispose();
		body[i].mid.material.dispose();

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

			body[i].fairingZ.mesh.remove(body[i].fairingZ.nose);
			body[i].fairingZ.nose.geometry.dispose();
			body[i].fairingZ.nose.material.dispose();

			body[i].fairingN.mesh.remove(body[i].fairingN.mid);
			body[i].fairingN.mid.geometry.dispose();
			body[i].fairingN.mid.material.dispose();

			body[i].fairingZ.mesh.remove(body[i].fairingZ.mid);
			body[i].fairingZ.mid.geometry.dispose();
			body[i].fairingZ.mid.material.dispose();

			body[i].mesh.remove(body[i].fairingN.mesh);
			body[i].fairingN.mesh.geometry.dispose();
			body[i].fairingN.mesh.material.dispose();
	
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


		body[i].stage2.fairingN.mesh.remove(body[i].stage2.fairingN.mid);
		body[i].stage2.fairingN.mid.geometry.dispose();
		body[i].stage2.fairingN.mid.material.dispose();

		body[i].stage2.fairingZ.mesh.remove(body[i].stage2.fairingZ.mid);
		body[i].stage2.fairingZ.mid.geometry.dispose();
		body[i].stage2.fairingZ.mid.material.dispose();


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
let navQ = new THREE.Quaternion();
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
			if (body[i].focus === local) {
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

		let navM4 = new THREE.Matrix4().makeBasis(
			enu.northAxisV3, enu.upAxisV3, enu.eastAxisV3);

		navQ.setFromRotationMatrix(navM4);

		navBall.quaternion.copy(
			// functional orientation before applying navQ (rotations in world space)
			new THREE.Quaternion().setFromAxisAngle(zAxis, Math.PI)
			.multiply(new THREE.Quaternion().setFromAxisAngle(xAxis, -Math.PI / 2))

			// apply nav
			.multiply(navQ)

			// texture orientation after applying nav (rotations in local/object space)
			.multiply(new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI))
			.multiply(new THREE.Quaternion().setFromAxisAngle(yAxis, Math.PI))
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
			body[i].axesHelperIcrf.position.copy(body[i].mesh.position);
		}
		if (body[i].axesHelperEci) {
			body[i].axesHelperEci.position.copy(body[i].mesh.position);
		}
	}




////////////////////////////////////////////////////////////////////////////////
// finish animation

	// attach/add camera as child to object doesn't work so well
	// keep the camera relative to its target
	camera.position.x += body[view].mesh.position.x - oldViewX;
	camera.position.y += body[view].mesh.position.y - oldViewY;
	camera.position.z += body[view].mesh.position.z - oldViewZ;
	oldViewX = body[view].mesh.position.x;
	oldViewY = body[view].mesh.position.y;
	oldViewZ = body[view].mesh.position.z;
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
