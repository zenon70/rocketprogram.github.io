"use strict";

// the only reason this file is separate from main is so that bodies.js can be
// loaded after main.js, proving that main.js can load without body[].

// this file represents things to be done AFTER body[] is loaded.

// begin using body[]
initialize();

// run once to get navBall orientation before adding navBall
main();
scene2.add(ambientLight2);
scene2.add(pointLight2);
scene2.add(navBall);

// start loops
animate();
let loop = setInterval(main, 10);

// now that loop is defined, define a function that depends on it.
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
