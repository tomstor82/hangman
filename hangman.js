/////////////////////////////////////////////////////////////////////////
// Hangman Tom Storebø 3rd of May 2020
//
// Learning coding during
//
//	Coronavirus Pandemic 
//
//	If correct button has been pressed continuing pressing this gives no alert and increases the score
// ***What was really important and caused me much troubleshooting was spurious key inputs solved with the currentKey - previousKey.***
//
//	

"use strict";	// Set the standard for declaring all variables

//////////////////////////////////////////////////////////////////////
// Ajax request and callback from server

function getWord() {
	let wordlist = ajaxreq.responseXML.getElementsByTagName("w");
	let index = (Math.round(Math.random()*wordlist.length));
	word = wordlist[index].firstChild.nodeValue;	// Must make into nodeValue otherwise it displays as an object
	wordLength = word.length;
	//console.log(wordlist);
}

ajaxCallback = getWord;
ajaxRequest("words.xml");

////////////////////////////////////////////////////////////////////////
// Check for mobile browser to display prompt

function detectMob() {
	const toMatch = [ /Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i ];
	return toMatch.some((toMatchItem) => { return navigator.userAgent.match(toMatchItem); });
}

//////////////////////////////////////////////////////////////////////////
// JQuery for link control and styling
$(document).ready(function() {
$(".link")

.mousedown(function(e) { $(this).css( { color: "green" } ); })
.mouseup(function(e) { $(this).css( { color: "red" } ); })
.mouseover(function(e) { $(this).css( { cursor: "pointer" } ); })
.mouseenter(function(e) { $(this).css( { color: "red" } ); })
.mouseleave(function(e) { $(this).css( { color: "blue" } ); });

});

////////////////////////////////////////////////////////////////////////
// Global variables

var hiddenIndexArray = [];
var guessWordArray = [];
var hiddenLettersArray = [];
var inputArray = [];
var word, hideLetters, guessWord, wordLength, currentKey, level, pressed, ctx, keyNum, foundKey, inputKey;
var previousKey = 0;
var round = 0;
var result = 0;
var wrong = 0;
var mobAlert = false;

/////////////////////////////////////////////////////////////////////////
// Select level
function initiate(x) {
	if (round === 0) {
		document.getElementById("level").innerHTML = "<div style='text-align: center'>Ready to save the day?<p>Select letters with your keyboard</p></div>";
	}
	keyNum = 0;
	hiddenIndexArray = [];
	guessWordArray = [];
	hiddenLettersArray = [];
	inputArray = [];
	level = x;
	setTimeout(function() {
	hideLetters = Math.round(x * 0.2 * wordLength);	// level 1: 20%, 2: 40%, 3: 60%, 4: 80%
	//console.log("Letters to hide "+hideLetters+"\n");
	makeWord(wordLength, hideLetters)}, 3000);
}
//////////////////////////////////////////////////////////////////////////
// Hide letters
function makeWord(wordLength, hideLetters) {
	if (hideLetters === 1) hiddenIndexArray[0] = Math.floor(Math.random()*wordLength);	// Must remain at floor. Otherwise with round or ceil wordLength - 1
	else {
		hiddenIndexArray[0] = wordLength-3+(Math.round(Math.random()*2));	// First letter can be at 3 variable positions from the third last to last index positions. -1 for index 0 + -2 for the positions
		for (let i = 1; i < hideLetters; i++) {
			hiddenIndexArray[i] = hiddenIndexArray[i-1] - (Math.ceil(Math.random()*wordLength/hideLetters));	// Finds the index of the ramining hidden letters and add them to this array
		}
	}
	// Placing letters to be hidden into array
	for (let i = 0; i < hideLetters; i++) {
		hiddenLettersArray[i] = word.charAt(hiddenIndexArray[i]);
	}
	guessWordArray = word.split("");	// makes word string into array
	for (let i = 0; i < hiddenIndexArray.length; i++) {
		guessWordArray[hiddenIndexArray[i]] = "_";	// Puts blank spaces where hidden index array indicates
	}
	let firstWord = guessWordArray.toString();	// Guess word array becomes string
	guessWord = firstWord.replace(/,/g, " ");	// Removes commas from string. They appear when converting array to string
	startGame();
}
//////////////////////////////////////////////////////////////////////////
// Start game and detect key inputs
function startGame() {
	document.getElementById("level").innerHTML = '<p style="font-size: 200%;">' + guessWord + '</p><input type="text" id="hiddenTextBox" size="1" autofocus style="opacity: 0; position: absolute; left: 27%; font-size: 150pt; top: 27%;"></input>';	// ADDED INPUT TO ALLOW AUTOMAIC POP UP OF ANDROID KEYBOARD ******************************
	pressed = document.getElementById("keys");	// Get position to write pressed keys
	if (detectMob() === true && mobAlert === false) {
		alert("Some mobile devices might be unsupported, press word to open keyboard");
		mobAlert = true;
	}
	// Detect keyboard input
	window.addEventListener('keydown', function keyDuration (event) {
		currentKey = Date.now();
		if (previousKey === 0 || (currentKey - previousKey) > 400) {	// If no previous key presses
			if (!event) event = window.event;	// if not event alas IE, event becomes window.event
			foundKey = false;
			inputKey = event.key;
			keyNum++;	// increase index in input array for storing keys to avoid them being recorded twice as score
		}
		for (let i = 0; i < inputArray.length; i++) {	// Search input array for current key pressed
			if (inputKey === inputArray[i]) foundKey = true;
		}
		inputArray[keyNum-1] = inputKey;
		if (foundKey === false && (/^([a-z0-9]{1,1})$/.test(inputKey) === true)) {
			pressed.style.display = "block";
			pressed.lastChild.innerHTML += inputKey + " ";
			checkAnswer(inputKey);
		}
	});
}
//////////////////////////////////////////////////////////////////////////
// Check answers
function checkAnswer(inputKey) {
	let points = 0;
	let key = inputKey.toLowerCase();
	let foundLetters = false;
	for (let i = 0; i < hiddenLettersArray.length; i++) {	// Checking if key input is in hiddenLettersArray and if found adds increments to foundLetters
		if (key === hiddenLettersArray[i]) {
			foundLetters = true;
			//console.log("Found "+foundLetters +" correct letters\n");
		}
	}
	previousKey = currentKey;	// Highly important to measure time between key press to avoid unintentional triggering of wrong counter
	// Wrong answer
	if (foundLetters === false) {
		points = -1;
		wrong++;
		//console.log("Found "+foundLetters + " correct letters\n" +"number of wrong answers " +wrong+"\n");
		score(points);//document.getElementById("score").innerHTML = "Score:<br />" + score(points);
//console.log("initial points "+points+"\n");
		wrongAnswer(wrong, points);
	}
	// Right answer
	else {
		foundLetters = false;
		points = 1;	// Number of right answers
		score(points);//document.getElementById("score").innerHTML = "Score:<br />" + score(points);
//console.log("initial points "+points+"\n");
		rightAnswer(key, points);
	}
}
////////////////////////////////////////////////////////////////////////////
// Keeping score
function score(points) {
	//if (!previousRound) { var previousRound; }	// let does not work here
	let previousPoints;
	if (round % 5 === 0 && keyNum === 1) result += (level*round*10);	// Level bonus
	result += (points*10*level);
	//previousRound = round;
	previousPoints = points;
	console.log("Game level "+level + ", key Number is: "+keyNum +", game results = " + (level*round*10) + ", round points = " + points + ", score "+ result + ", round number "+round +"\n");
	return document.getElementById("score").innerHTML = "Score:<br />" + result;
}
////////////////////////////////////////////////////////////////////////////
// Wrong answer
function wrongAnswer(wrong, points) {
	//document.getElementById("score").innerHTML = "Score:<br />" + score(0);
	let messages = ["WRONG!<br />4 chances left.", "WRONG!<br />3 chances left.", "WRONG!<br />2 chances left.", "WRONG AGAIN?! Get your dictionary!<br />1 chance left.", "GAME OVER!<br />You clearly need a dictionary to save lives."];
	if (wrong < messages.length) {
		document.getElementById("level").innerHTML = '<p style="text-align: center; font-size: 200%; color:red;">' + messages[wrong-1] + '</p>';
		drawShape();
	}
	else {	// Game over
		document.getElementById("level").innerHTML = '<p style="text-align: center; font-size: 200%; color:red;">' + messages[wrong-1] + '</p>';
		drawShape();
		result = 0;
	}
}
////////////////////////////////////////////////////////////////////////////
// Right answer
function rightAnswer(key, points) {
	// If one or more matches were found search guessWordArray for index of next letter to be guessed
	let hiddenLettersArray = word.split("");
	let nextIndex = [];
	let found = 0;
	for (let i = 0; i < hiddenLettersArray.length; i++) {
		if (key === hiddenLettersArray[i]) {
			guessWordArray[i] = hiddenLettersArray[i];
		}
	}
	let firstWord = guessWordArray.toString();
	guessWord = firstWord.replace(/,/g, " ");	// Replaces comma with blank space
	for (let i = 0; i < guessWordArray.length; i++) {	// Searching guessWordArray for spaces for more guesswork
		if ("_" === guessWordArray[i]) {
			nextIndex = i;
			found++;
		}
	}
	if (found > 0) {	// If any matches found and more spaces are empty in guessWordArray return to game
		for (let i = 0; i < nextIndex.length; i++) {
			guessWordArray[nextIndex[i]] = key;
		}
		startGame();
	}
	else {	// Game finished - No more spaces for answers
		guessWord = word;
		if (round === undefined) round = 1;
		else round++;
		//document.getElementById("score").innerHTML = "Score:<br />" + score();
		document.getElementById("level").innerHTML = '<p style="font-size: 250%; color: green;">' + guessWord + '<br /><span style="color: black;">Excellent job!</span></p>';
		// After 5 rounds at level 4 Game is completed
		if (round % 5 === 0 && level === 4) {	// Stops game after 5 successful rounds at level 4
			setTimeout(function() {
				alert("AMAZING! YOU MIGHT AS WELL TOSS YOUR DICTIONARY.");
				prompt("Highscore name?");
				//games = 0;	//******************************************************************** IS THIS NEEDED WITH A PAGE RELOAD?
				window.location.reload(false)
			}, 3000);
		}
		// Game is rolling
		else {
			setTimeout(function() {
				ajaxRequest("words.xml");
				wrong = 0;	// Must go to zero to clear canvas
				drawShape(1);	// Clears canvas
				pressed.lastChild.innerHTML = " ";
				// After 5 rounds change to next level
				if (round % 5 === 0) {
					alert("GREAT JOB! READY FOR LEVEL " + ++level + "?");
					initiate(level);
				}
				// Next round at same level until reaching 5 rounds
				else initiate(level);
			}, 3000);
		}
	}
}
/////////////////////////////////////////////////////////////////////////////
// Draw canvas
function drawShape(clear) {
	// get the canvas element using the DOM
	var canvas = document.getElementById('canvas');
	// Make sure we don't execute when canvas isn't supported
	if (canvas.getContext) {
		// use getContext to use the canvas for drawing
		ctx = canvas.getContext('2d');
	}
	ctx.beginPath();
	switch(wrong) {
	case 1:	// Draw hilltop and vertical pole
		ctx.lineWidth = 12;
		ctx.arc(canvas.width/2, 500, canvas.width/2, 0, Math.PI, true);
		ctx.moveTo(canvas.width/2, 350);
		ctx.lineTo(canvas.width/2, 0);
		break;
	case 2:	// Draw top beam	
		ctx.lineWidth = 16;
		ctx.moveTo(canvas.width/2, 8);
		ctx.lineTo(250, 8);
		break;
	case 3:	// Draw support beam
		ctx.lineWidth = 12;
		ctx.moveTo(canvas.width/2, 50);
		ctx.lineTo(200, 0);
		break;
	case 4:	// Draw rope and loop
		ctx.lineWidth = 4;
		ctx.moveTo(250, 0);	// Rope start
		ctx.arc(250, 90, 20, 3/2*Math.PI, 7/2*Math.PI);	// Loop
		break;
	case 5:	// Draw person
		ctx.lineWidth = 4;
		ctx.arc(250, 90, 25, 1/2*Math.PI, 6/2*Math.PI);	// Head 	// center x, y, radius, start angle, end angle, counterclockwise
		ctx.lineWidth = 10;
		ctx.lineTo(250, 250);	// Torso
		ctx.closePath();
		ctx.lineWidth = 1;
		ctx.moveTo(246, 89);		// Right eye inner
		ctx.lineTo(238, 91);		// Right eye outer
		ctx.closePath();
		ctx.moveTo(253, 89);		// Left eye inner
		ctx.lineTo(260, 90);		// Left eye outer
		ctx.closePath();
		ctx.moveTo(240, 99);		// Mouth right corner
		ctx.lineTo(254, 101);	// Mouth line
		ctx.closePath();
		ctx.lineWidth = 8;
		ctx.moveTo(235, 375);	// Right foot
		ctx.lineTo(240, 367);	// Right ankle
		ctx.lineTo(249, 250);	// Pelvis
		ctx.lineTo(260, 370);	//	Left ankle
		ctx.lineTo(255, 375);	// Left foot
		ctx.closePath();
		ctx.lineWidth = 6;
		ctx.moveTo(231, 260);	// Right hand
		ctx.lineTo(235, 133);	// Right shoulder
		ctx.lineTo(249, 126);	// Neck
		ctx.lineTo(270, 130);	// Left shoulder
		ctx.lineTo(273, 256);	// Left hand

		setTimeout(function() {
			prompt("Highscore Name");
			window.location.reload(false);
		}, 5000);
	}
	if (clear === 1) {	// Clears canvas only if switch(wrong) is set to zero
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		clear = 0;
	}															// Canvas = 300x400
	ctx.stroke();
	setTimeout(function() { startGame()}, 3000);
}
