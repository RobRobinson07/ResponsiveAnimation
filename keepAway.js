// keepAway.js - JavaScript Code for "Bowling for Frogs" Game  - 2/21/2015 
var canvas, ctx, rect, offsetx, offsety;
var ball, frogSit, frogJump, frogLand, frogFlat, imageCount;
var ballx, bally, frogx, frogy, frogAngle, ballAngle;
var frogWidth, frogHeight, ballWidth, ballHeight, distance, scale;
var timer, millis, counter, bouncer, ballIdle, hopping, mouseisdown, gameOver;
var touchStarted, touchx, touchy;
var frogSitData, frogJumpData,  frogLandData, frogFlatData, frogBackgroundData;
var ballData, ballBackgroundData;

function init( ) {
	// determine the canvas size
	iwidth = window.innerWidth;
	iheight = window.innerHeight;
	widthSpan = document.getElementById('windowWidth');
	widthSpan.innerHTML = "Screen width = " + iwidth;
	if (iwidth >= 700 && iheight > 540 )
	{
		scale = 1.0;
		canvasWidth = 700;
		canvasHeight = 500;
	}
	else
	{
		scalex = iwidth / 700.0;
		scaley = (iheight-40) / 500.0;
		if ( scalex < scaley )
		   scale = scalex;
		else
		   scale = scaley;
		canvasWidth = (700) * scale;
		canvasHeight = (500) * scale;
	}
	// get the canvas element and scale its width and height.
	canvas = document.getElementById('canvas');
	if ( canvas ) {
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		rect = canvas.getBoundingClientRect();
		offsetx = rect.left;
		offsety = rect.top;
		
		// Get a two-dimensional graphics context for the canvas
		ctx = canvas.getContext("2d");
		if ( ctx ) {
			// Start the frog in the center of the canvas 
			// and the ball in the top-left corner
			distance = 40 * scale; // distance of a frog's hop
			frogx = canvasWidth / 2;
			frogy = canvasHeight / 2;
			frogAngle = Math.PI * 7.0 / 4.0;
			ballx = 2;
			bally = 22;
			ballAngle = Math.PI * 7.0 / 4.0;
			xbdist = distance * Math.cos(ballAngle);
			ybdist = distance * Math.sin(ballAngle);
			bouncer = 1;  // bouncer counts the frames in a bounce
			counter = 1;  // counmter coumts the frames in a hop
			ballIdle = true;
			hopping = false;
			mouseisdown = false;
			gameOver = false;
			touchStarted = false;
			millis = 200;   // milliseconds for timer interval.

			// Load the images and set events to count the number 
			// of images that have finished loading into memory.
			imageCount = 0;
			frogSit = new Image();
			frogSit.addEventListener("load", imageLoaded, false);
			frogSit.src = "frogsit.gif";
			frogJump = new Image();
			frogJump.addEventListener("load", imageLoaded, false);
			frogJump.src = "frogjump.gif";
			frogLand = new Image();
			frogLand.addEventListener("load", imageLoaded, false);
			frogLand.src = "frogland.gif";
			frogFlat = new Image();
			frogFlat.addEventListener("load", imageLoaded, false);
			frogFlat.src = "frogflat.gif";
			ball = new Image();
			ball.addEventListener("load", imageLoaded, false);
			ball.src = "ball.gif";
			wait = 0;
				
			// register event listeners for keyboard mouse and touch events
			canvas.focus(); // make the canvas active for keyboard input
			canvas.addEventListener('keydown', keyPushed, false);
			canvas.addEventListener('mousemove', moveMouse, false);
			canvas.addEventListener('mousedown', downMouse, false);
			canvas.addEventListener('mouseup',   upMouse, false);
			canvas.addEventListener("touchstart", startTouch, false);
			canvas.addEventListener("touchend", endTouch, false);
			canvas.addEventListener("touchleave", endTouch, false);
			window.addEventListener('keydown', keyPushed, false);
		}
	}
} // end init()

function imageLoaded( )
{	// Called when each image completes loading
	imageCount++;
	if (imageCount == 5)
	{	// All five images are loaded, Set the image size to the scale
		frogWidth = frogSit.width * scale;
		frogHeight = frogSit.height * scale;
		ballWidth = ball.width*scale;
		ballHeight = ball.height*scale;
			
		// Save the background where the images will be drawn.
		frogBackgroundData = ctx.getImageData(frogx, frogy, frogWidth, frogHeight);
		ballBackgroundData = ctx.getImageData(ballx, bally, ballWidth, ballHeight);

		// Draw the images in scale and use getImageData to capture them in a
		// more efficient format to avoid rescaling them each time they're drawn		
		ctx.drawImage(frogJump, frogx, frogy, frogWidth, frogHeight);
		frogJumpData = ctx.getImageData(frogx, frogy, frogWidth, frogHeight);
		ctx.putImageData(frogBackgroundData, frogx, frogy);
		ctx.drawImage(frogLand, frogx, frogy, frogWidth, frogHeight);
		frogLandData = ctx.getImageData(frogx, frogy, frogWidth, frogHeight);
		ctx.putImageData(frogBackgroundData, frogx, frogy);
		ctx.drawImage(frogFlat, frogx, frogy, frogWidth, frogHeight);
		frogFlatData = ctx.getImageData(frogx, frogy, frogWidth, frogHeight);
		ctx.putImageData(frogBackgroundData, frogx, frogy);
		ctx.drawImage(frogSit, frogx, frogy, frogWidth, frogHeight);
		frogSitData = ctx.getImageData(frogx, frogy, frogWidth, frogHeight);
		ctx.drawImage(ball, ballx, bally, ballWidth, ballHeight);
		ballData = ctx.getImageData(ballx, bally, ballWidth, ballHeight);
	}
}

function keyPushed( e )
{
	// The following lines get the code value of the key
	// Which may be recorded differently en each browser.
	var evtobj=window.event? event : e //IE's window.event or Firefox'
	var code=evtobj.charCode? mmevtobj.charCode : evtobj.keyCode
	if (evtobj.preventDefault)
		evtobj.preventDefault();
	evtobj.returnValue = false;
	
	// set the direction to hop. (keys turn in right angles.)
	switch (code) {
		case 37: // left arrow
			frogAngle = Math.PI;
			break;
		case 38: // up arrow
			frogAngle = Math.PI / 2.0;
			break;
		case 39: // right arrow
			frogAngle = 0;
			break;
		case 40: // down arrow
			frogAngle = Math.PI * 3.0 / 2.0;
			break;
		case 27: // Escape key, restart.
			clearInterval( ballTimer );
			ballTimer = 0;
			init( );
			return;
			break;
	}
	hopping = true; // start the frog on any key
	// If this is the first key down, start the ball and timer
	if ( ballIdle )
	{
		ballIdle = false;
		ballTimer = setInterval(hopAndBounce, millis);
	}
}

function downMouse( evt )
{	// Called when the mouse button is pressed down.
	mouseisdown = true; // indicate the start of a click or drag
	moveMouse( evt );
}

function upMouse( evt )
{ // Called when the mouse button is released.
	mouseisdown = false;
}

function moveMouse( evt ) 
{ // Called when the mouse is moved across the canvas.

	if (!evt)
		var evt = event;
	if (mouseisdown) // only act on dragging movements.
	{
		clickx = evt.clientX - offsetx;  // set a new frogAngle
		clicky = evt.clientY - offsety;  // toward the click
		frogAngle = Math.atan2((frogy-frogHeight/2.0-clicky),
		                       (clickx-frogx+frogWidth/2.0));
		if ( gameOver ) // restart game if its over and user clicks on ball 
		{
			if (( clickx >= frogx ) && ( clickx <= frogx + frogWidth )
			 && ( clicky >= frogy ) && ( clicky <= frogy + frogHeight ))
				init();
		}
		else
		{
			hopping = true; // start the frog on any event
			if (ballIdle)   // start the ball if its the first event
			{
				ballIdle = false;
				// ballTimer calls hopAndBounce every "millis" milliseconds
				ballTimer = setInterval(hopAndBounce, millis);
			}
		}
	}
}

function hopAndBounce()
{ // Called every time the ballTimer event occurs.
	// hop the frog
	if (counter == 1 && hopping)
	{
		ydist = distance * Math.sin(frogAngle);
		xdist = distance * Math.cos(frogAngle);
		// Don't hop if it would end up outside the canvas.
		newx = frogx + xdist;
		newy = frogy - ydist;
		if (( newx < 0 ) || ( newx > canvasWidth - frogWidth ) 
		|| ( newy < 0 ) || ( newy > canvasHeight - frogHeight ))
		{
			hopping = false;
			counter=0;
		}
		else
			hopping = true;
		if (hopping)
		{
			ctx.putImageData(frogBackgroundData, frogx, frogy);
			frogx += xdist / 3.0;
			frogy -= ydist / 3.0;
			frogBackgroundData = ctx.getImageData(frogx, frogy, frogWidth, frogHeight);
			ctx.putImageData(frogJumpData, frogx, frogy);
		}
	}
	else if (counter == 2 && hopping) // erase this spot, land in new spot 
	{
		ctx.putImageData(frogBackgroundData, frogx, frogy);
		frogx += xdist / 3.0;
		frogy -= ydist / 3.0;
		frogBackgroundData = ctx.getImageData(frogx, frogy, frogWidth, frogHeight);
		ctx.putImageData(frogLandData, frogx, frogy);
	}
	else if (counter == 3 && hopping) // erase this spot, sit in new spot
	{
		ctx.putImageData(frogBackgroundData, frogx, frogy);
		frogx += xdist / 3.0;
		frogy -= ydist / 3.0;
		frogBackgroundData = ctx.getImageData(frogx, frogy, frogWidth, frogHeight);
		ctx.putImageData(frogSitData, frogx, frogy);
		counter = 0;
	}
	else
		counter = 0;
	counter++;			

	// bounce the ball, but erase it first in current spot
	ctx.putImageData(ballBackgroundData, ballx, bally);

	ballx += xbdist / 3.0;
	if (bouncer == 1) // draw in high point of bounce
	{
		if (ybdist >= 0)
			bally += ybdist;
		else
			bally -= ybdist * 2;
		ballBackgroundData = ctx.getImageData(ballx, bally, ballWidth, ballHeight);
		ctx.putImageData(ballData, ballx, bally);
	}
	else if (bouncer == 2) // draw in middle point of descent
	{
		if (ybdist >= 0)
			bally -= ybdist;
		else
			bally += ybdist / 2.0;
		ballBackgroundData = ctx.getImageData(ballx, bally, ballWidth, ballHeight);
		ctx.putImageData(ballData, ballx, bally);
	}
	else if (bouncer = 3) // draw in final point of the bounce
	{
		if (ybdist >= 0)
			bally -= ybdist;
		else
			bally -= ybdist / 2.0;
		ballBackgroundData = ctx.getImageData(ballx, bally, ballWidth, ballHeight);
		ctx.putImageData(ballData, ballx, bally);
		ballAngle = Math.atan2((bally-frogy),(frogx-ballx));
		xbdist = distance * 0.5 * Math.cos(ballAngle);  // set the distance for 
		ybdist = distance * 0.5 * Math.sin(ballAngle);  // the next bounce.
		bouncer = 0;
	}
		
	// Check to see if the ball hit the frog
	if ( ballx + ballWidth > frogx && ballx < frogx + frogWidth
	  && bally + ballHeight > frogy && bally < frogy + frogHeight )
	{
		// stop the timer and display a squished frog
		clearInterval(ballTimer);
		ballTimer = 0;
		gameOver = true; 
		ctx.putImageData(ballBackgroundData, ballx, bally);
		ctx.putImageData(frogBackgroundData, frogx, frogy);
		ctx.putImageData(frogFlatData, frogx, frogy);

		// Touching or clicking on the ball will restart the game.
		ctx.fillStyle = "#814a33";
		ctx.font = "14px Arial";
		ctx.fillText("Touch ball", frogx, frogy + frogHeight + 10);
	}
	bouncer++;
}

function startTouch(evt) 
{
	if (!evt)
		var evt = event;
	evt.preventDefault();
	var touches = evt.changedTouches;
	if (touches.length == 1)
	{
		touchx = touches[0].pageX - offsetx;
		touchy = touches[0].pageY - offsety;
		touchStarted = true;
	}
}

function endTouch(evt) 
{
	if (!evt)
		var evt = event;
	evt.preventDefault();
	var touches = evt.changedTouches;
	if (touches.length == 1 && touchStarted)
	{
		newx = touches[0].pageX - offsetx;
		newy = touches[0].pageY - offsety;
		touchStarted = false;
	}
	frogAngle = Math.atan2((touchy - newy),
						   (newx - touchx));
						   
	if ( gameOver )// restart game if its over and user touches ball
	{
		if (( newx >= frogx ) && newx <= (frogx + frogWidth )
		 && ( newy >= frogy ) && newy <= (frogy + frogHeight ))
			init();
	}
	else
	{
		hopping = true; // start the frog on any event
		if (ballIdle)   // start the ball if its the first event
		{
			ballIdle = false;
			// ballTimer calls hopAndBounce every "millis" milliseconds
			ballTimer = setInterval(hopAndBounce, millis);
		}
	}
}
