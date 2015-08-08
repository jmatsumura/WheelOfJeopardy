var Wheel = (function() {

	var timerHandle = 0,
	timerDelay = 33,

	angleCurrent = 0,
	angleDelta = 0,

	size = 185,

	canvasContext = {},

	colors = [ '#ffff00', '#ffc700', '#ff9100', '#ff6301', '#ff0000', '#c6037e',
	           '#713697', '#444ea1', '#2772b2', '#0297ba', '#008e5b', '#8ac819' ],
	variable_sections = [],
	static_sections = {
		"Free Turn" : "getFreeTurn",
		"Bankrupt": "bankrupt",
		"Lose Turn": "loseTurn",
		"Player's Choice": "popupChoiceWindow",
		"Opponents' Choice": "popupChoiceWindow",
		"Spin Again": "spinAgain"
	},
	segments = [],
	players = [],
	players_hash = [0,1,2],
	turn = 0,
	spins = 0,
	maxSpins = 50,

	seg_colors = [], 
	
	maxSpeed = Math.PI / 16,

	upTime = 1000, 
	downTime = 0,

	spinStart = 0,

	frames = 0,

	centerX = 200,
	centerY = 200;

	function randomDowntime() {
		var min = 1000;
		var max = 5000;
		return Math.random() * (max - min) + min;
	}

	function initCanvas() {
		var canvas = $('#wheel #canvas').get(0);

		if ($.browser.msie) {
			canvas = document.createElement('canvas');
			$(canvas).attr('width', 600).attr('height', 400).attr('id', 'canvas').appendTo('.wheel');
			canvas = G_vmlCanvasManager.initElement(canvas);
		}
	}
	function initAudio() {
		var sound = document.createElement('audio');
		sound.setAttribute('src', 'js/wheel.mp3');
		wheel.sound = sound;
	}

	function initWheel() {
		colors;
	}

	function draw() {
		clear();
		drawWheel();
		drawNeedle();
	}

	function clear() {
		var ctx = canvasContext;
		ctx.clearRect(0, 0, 1000, 800);
	}
	
	function getCurrentSegment() {
		var i = segments.length - Math.floor((angleCurrent / (Math.PI * 2))	* segments.length) - 1;
		return segments[i];
	}
	
	function drawNeedle() {
		var ctx = canvasContext;

		ctx.lineWidth = 1;
		ctx.strokeStyle = '#000000';
		ctx.fileStyle = '#ffffff';

		ctx.beginPath();

		ctx.moveTo(centerX + size - 40, centerY);
		ctx.lineTo(centerX + size + 20, centerY - 10);
		ctx.lineTo(centerX + size + 20, centerY + 10);
		ctx.closePath();

		ctx.stroke();
		ctx.fill();

		var i = segments.length - Math.floor((angleCurrent / (Math.PI * 2))	* segments.length) - 1;

		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.fillStyle = '#000000';
		ctx.font = "1em Arial";
		ctx.fillText(getCurrentSegment(), centerX + size + 25, centerY);
	}

	function drawSegment(key, lastAngle, angle) {
		var ctx = canvasContext;

		var len = segments.length;

		var value = segments[key];
		
		ctx.save();
		ctx.beginPath();

		ctx.moveTo(centerX, centerY);
		ctx.arc(centerX, centerY, size, lastAngle, angle, false); 
		ctx.lineTo(centerX, centerY);

		ctx.closePath();

		ctx.fillStyle = colors[key];
		ctx.fill();
		ctx.stroke();

		ctx.save(); 
		ctx.translate(centerX, centerY);
		ctx.rotate((lastAngle + angle) / 2);

		ctx.fillStyle = '#000000';
		ctx.fillText(value.substr(0, 20), size / 2 + 20, 0);
		ctx.restore();

		ctx.restore();
	}

	function drawWheel() {
		var ctx = canvasContext;
		var lastAngle    = angleCurrent;
		var len       = segments.length;
		var colorsLen = colors.length;


		var PI2 = Math.PI * 2;

		ctx.lineWidth    = 1;
		ctx.strokeStyle  = '#003399';
		ctx.textBaseline = "middle";
		ctx.textAlign    = "center";
		ctx.font         = "1em Arial";

		for (var i = 1; i <= len; i++) {
			var angle = PI2 * (i / len) + angleCurrent;
			drawSegment(i - 1, lastAngle, angle);
			lastAngle = angle;
		}

		ctx.beginPath();
		ctx.arc(centerX, centerY, 20, 0, PI2, false);
		ctx.closePath();

		ctx.fillStyle   = '#ffffff';
		ctx.strokeStyle = '#003399';
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(centerX, centerY, size, 0, PI2, false);
		ctx.closePath();

		ctx.lineWidth   = 5;
		ctx.strokeStyle = '#003399';
		ctx.stroke();
	}
	
	function setSegments() {
		var segments_arr = $.map(static_sections, function(v, i){
		  return i;
		})
		segments_arr = segments_arr.concat(variable_sections);
		segments_arr.sort(function() {
		  return .5 - Math.random();
		});
		segments = segments_arr;
	}
	
	function checkCategory() {
		var current = getCurrentSegment();
		return $.inArray(current, variable_sections) > -1;
	}
	
    function onTimerTick() {
		frames++;

		draw();

		var duration = (new Date().getTime() - spinStart);
		var progress = 0;
		var finished = false;
	
		if (duration < upTime) {
			progress = duration / upTime;
			angleDelta = maxSpeed
					* Math.sin(progress * Math.PI / 2);
		} else {
			progress = duration / downTime;
			angleDelta = maxSpeed
					* Math.sin(progress * Math.PI / 2 + Math.PI / 2);
			if (progress >= 1)
				finished = true;
		}

		angleCurrent += angleDelta;
		while (angleCurrent >= Math.PI * 2)
			// Keep the angle in a reasonable range
			angleCurrent -= Math.PI * 2;
		if (finished) {
			wheel.sound.pause();
			clearInterval(timerHandle);
			timerHandle = 0;
			angleDelta = 0;
			var current_segment = getCurrentSegment();
			displaySpins();
			if(checkCategory()) {
				var points = jeopardy.popupQuestion(current_segment);
				if (points) {
					players[turn].calculatePoints(points);
				}
			}
			else {
				handleSpecialTurn(current_segment);
			}
			if(isGameOver()){
				getWinner();
			}
			else if (goNext(points)){
				nextPlayer();
			}
		}
	}
	function goNext(points) {
		var current_segment = getCurrentSegment();
		if (current_segment == "Spin Again") {
			return false;
		}
		else if(points && points == -1) {
			alert("No more questions. Spin again!");
			return false;
		}
		return true;
	}
	function displaySpins() {
		spins++;
		$("#spins span").html(spins);
	}
	function getWinner() {
		alert("Done!");
	}
	function nextPlayer() {
		if (turn == players_hash.length - 1) {
			turn = 0;
		}
		else {
			turn++;
		}
	}
	function handleSpecialTurn(current_segment){
		eval(static_sections[current_segment])();
	}
	
	function getFreeTurn() {
		players[turn].addToken();
	}
	
	function bankrupt() {
		players[turn].setBankrupt();
		players_hash.slice(turn, 1);
	}
	
	function loseTurn() {
		alert("Lost turn!");
		nextPlayer();
	}
	
	function spinAgain() {
		alert("Spin again!");
	}
	
	function popupChoiceWindow() {
		console.log("here");
	}
	
	function isMaxSpins() {
		return spins >= maxSpins;
	}
	
	function noMorePlayers() {
		return players_hash.length < 2;
	}
	
	function isGameOver() {
		return isMaxSpins() || noMorePlayers() || jeopardy.noMoreQuestions();
	}
	
	return {
		spin: function() {
			// Start the wheel only if it's not already spinning
			if (timerHandle == 0) {
				spinStart = new Date().getTime();
				maxSpeed = Math.PI / (16 + Math.random());
				frames = 0;
				wheel.sound.play();
				downTime = randomDowntime();
				timerHandle = setInterval(onTimerTick, timerDelay);
			}
		},
		update: function() {
			var r = 0;
			angleCurrent = ((r + 0.5) / segments.length) * Math.PI * 2;
			draw();
		},
		setCategories: function(categories) {
			variable_sections = categories;
			setSegments();
		},
		setPlayers: function(p1, p2, p3) {
			players = [p1, p2, p3];
		},
		init : function() {
			try {
				initWheel();
				initAudio();
				initCanvas();
				canvas.addEventListener("click", this.spin, false);
				canvasContext = canvas.getContext("2d");
				//wheel.draw();

			} catch (exceptionData) {
				alert('Wheel is not loaded ' + exceptionData);
			}

		}
	};
});
