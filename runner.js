
initialize();

// run once to get navBall orientation before adding navBall
main();
scene2.add(ambientLight2);
scene2.add(pointLight2);
scene2.add(navBall);

// start loops
animate();
let loop = setInterval(main, 10);

let running = true;
function playPause() {
	if (running === true) {
		clearInterval(loop);
		running = false;
		showStep();
	}
	else {
		loop = setInterval(main, 10);
		running = true;
		showStep();
	}
}



