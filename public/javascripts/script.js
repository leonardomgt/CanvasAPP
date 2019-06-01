
var canvas = new fabric.Canvas("canvasapp", {
	width: $("#canvas-container").width(),
	height: $("#canvas-container").height(),
	isDrawingMode: false
});

canvas.backgroundColor = "#ffffff";
var state = [];
var currentState = 0;
var color = '#0000ff';
var sound;
var isSoundPlaying = false;
var isCanvasBeingRecorded = false;
var changingStates = false;

var canvasVideoChunks = [];

const stream = $(".canvasapp").get(0).captureStream(); // grab our canvas MediaStream
const rec = new MediaRecorder(stream); // init the recorder
rec.ondataavailable = e => {
	canvasVideoChunks.push(e.data);
	console.log("ondataavailable");
	console.log(canvasVideoChunks);
}
rec.onstop = e => exportVideo(new Blob(canvasVideoChunks, {type: 'video/mp4'}));

fabric.util.requestAnimFrame(function render() {
	canvas.renderAll();
	fabric.util.requestAnimFrame(render);
});
// Create state 0
state.push(JSON.stringify(canvas));

// ==================================
//           Manage color
// ==================================

$("#colorPicker_box").css('background-color', color);
canvas.freeDrawingBrush.color = color;

$("input#color-picker").change(function () {
	color = $("input#color-picker")[0].value;

	$("#colorPicker_box").css('background-color', color);
	canvas.freeDrawingBrush.color = color;

});

$("#colorPicker_btn").click(function () {
	$("input#color-picker").focus();
	$("input#color-picker").click();
});

// ==================================
//           Manage sound
// ==================================

$("#audio-loader-btn").click(function () {
	$("input#audioLoader").focus();
	$("input#audioLoader").click();
});

$("input#audioLoader").change(function () {
	var file = $("input#audioLoader")[0].files[0];
	sound = URL.createObjectURL(file);
	$("audio#player")[0].src = sound;
});


function playSound() {
	if (sound) {
		if (!isSoundPlaying) {

			$("audio#player")[0].play()

			$("#fas_fa-play_button i").removeClass("fa-play")
			$("#fas_fa-play_button i").addClass("fa-pause")

			isSoundPlaying = true;
		}
		else {
			$("audio#player")[0].pause()

			$("#fas_fa-play_button i").removeClass("fa-pause")
			$("#fas_fa-play_button i").addClass("fa-play")
			isSoundPlaying = false;

		}
	}
}

function audioEnded() {
	// alert('Audio ended')

	$("#fas_fa-play_button i").removeClass("fa-pause")
	$("#fas_fa-play_button i").addClass("fa-play")
	isSoundPlaying = false;

}



// ==================================
//     Manage image/video load
// ==================================


$("#file-loader-btn").click(function () {
	console.log("click");

	$("input#fileLoader").focus();
	$("input#fileLoader").click();
});

$("input#fileLoader").change(function () {
	var file = $("input#fileLoader")[0].files[0];

	console.log("file");
	console.log(file.type);

	switch (file.type.substr(0, file.type.indexOf('/'))) {
		case "image":
			addImage(URL.createObjectURL(file))
			break;
		default:
		case "video":
			addVideo(URL.createObjectURL(file))
			break;
	}
});

function createVideoElement(url) {
	var videoE = document.createElement('video');
	videoE.muted = false;
	videoE.crossOrigin = "anonymous";
	var source = document.createElement('source');
	source.src = url;
	source.type = 'video/webm';
	videoE.appendChild(source);

	return videoE;
}


function addVideo(url) {
	var videoE = createVideoElement(url);
	videoE.addEventListener('loadedmetadata', function (e) {
		videoE.width = videoE.videoWidth;
		videoE.height = videoE.videoHeight;

		var fab_video = new fabric.Image(videoE, { left: 0, top: 0 });

		canvas.add(fab_video);
		fab_video.getElement().play();

	});

}

function fallAnimation() {
	obj = canvas.getActiveObject();

	if (!obj) {
		return;
	}
	if(obj.top >= canvas.height - obj.height) {
		return;
	}
	obj.animate({left: obj.left+100}, {
		duration: 1000,
		onChange:canvas.renderAll.bind(canvas)
	});
	obj.animate({top: canvas.height - obj.height}, {
		duration: 1000,
		onChange:canvas.renderAll.bind(canvas),
		easing: fabric.util.ease.easeOutBounce
	});
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function jumpAnimation() {
	obj = canvas.getActiveObject();

	if (!obj) {
		return;
	}
	if(obj.top != canvas.height - obj.height) {
		return;
	}
	obj.animate({top: canvas.height - 500}, {
		duration: 500,
		onChange:canvas.renderAll.bind(canvas),
		easing: fabric.util.ease.easeOutExpo,
		onComplete: function() {
			obj.animate({top: canvas.height - obj.height}, {
				duration: 1000,
				onChange:canvas.renderAll.bind(canvas),
				easing: fabric.util.ease.easeOutBounce
			}); 
		}
	});
	
}

function recordCanvas() {
	if (!isCanvasBeingRecorded) {
		isCanvasBeingRecorded = true;

		$("#fas_fa-video_button i").removeClass("fa-video")
		$("#fas_fa-video_button i").addClass("fa-video-slash")

		$("#fas_fa-video_box").css('background-color', 'red');
		
		startRecording()
	}
	else {
		isCanvasBeingRecorded = false;

		$("#fas_fa-video_button i").removeClass("fa-video-slash")
		$("#fas_fa-video_button i").addClass("fa-video")
		
		$("#fas_fa-video_box").css('background-color', 'orange');
		
		stopRecording()
	}
}

function startRecording() {
	canvasVideoChunks = [];

	rec.start();
}

function stopRecording() {
	rec.stop();	
}

function exportVideo(blob) {

	const recordedCanvas = $('video#recordedCanvas').get(0);

	recordedCanvas.src = URL.createObjectURL(blob);

	const linkToDownload = $("#downloadRecordedCanvas").get(0);

	linkToDownload.href = recordedCanvas.src;

}

function saveAsVideo() {
	// $("#downloadRecordedCanvas").focus();
	console.log($("#downloadRecordedCanvas"));
	
	$("#downloadRecordedCanvas")[0].click();
}


function addImage(url) {
	canvas.isDrawingMode = false;
	fabric.Image.fromURL(url, function (img) {
		if (img.width > canvas.width || img.height > canvas.height) {

			const wFactor = img.width / canvas.width;
			const hFactor = img.height / canvas.height;
			const factor = Math.max(hFactor, wFactor);
			img.scaleToWidth(img.width / factor);
			img.scaleToHeight(img.height / factor);
		}
		canvas.add(img);
		canvas.setActiveObject(img);
	});
}

function saveAsImage() {
	$(".canvasapp").get(0).toBlob(function (blob) {
		saveAs(blob, "myImage.png");
	});
}

// ==================================
//     Manage canvas opperations
// ==================================
function addCanvasState() {
	if (!changingStates) {
		updateModifications();
	}
}
canvas.on('object:added', updateModifications);
canvas.on('object:removed', updateModifications);
canvas.on('object:modified', updateModifications);

canvas.on('object:selected', function (obj) {
	obj.target.bringToFront();
});

// Fabric JS Drawing Offset Error - Remove this code when the bug is resolved
canvas.on('mouse:up', function (e) {
	if (canvas.isDrawingMode && canvas._objects && canvas._objects.length > 0) {
		var drawObj = canvas._objects[canvas._objects.length - 1];
		drawObj.set('left', drawObj.left + canvas.freeDrawingBrush.width / 2.0);
		drawObj.set('top', drawObj.top + canvas.freeDrawingBrush.width / 2.0);
		drawObj.selectable = false;
		drawObj.hoverCursor = 'inherit';
		drawObj.setCoords();
		canvas.renderAll();
	}
});


function updateModifications() {
	if (!changingStates) {
		state = state.slice(0, currentState + 1);
		myjson = JSON.stringify(canvas);
		state.push(myjson);
		currentState++;
		console.log(state);
	}

}

function addTriangle() {
	canvas.isDrawingMode = false;
	obj = new fabric.Triangle({ width: 60, height: 60, fill: color, left: 100, top: 100 });
	canvas.add(obj);
	canvas.setActiveObject(obj);
}

function addRectangle() {
	canvas.isDrawingMode = false;
	obj = new fabric.Rect({ width: 60, height: 60, fill: color, left: 100, top: 100 });
	canvas.add(obj);
	canvas.setActiveObject(obj);
}

function addCircle() {
	canvas.isDrawingMode = false;
	obj = new fabric.Circle({ radius: 30, fill: color, top: 100, left: 100 });
	canvas.add(obj);
	canvas.setActiveObject(obj);
}



function clearCanvas() {
	canvas.clear().renderAll();
	if (currentState > 0) {
		updateModifications()
	}
}

function undo() {
	if (currentState > 0) {
		changingStates = true;
		canvas.clear().renderAll();
		canvas.loadFromJSON(state[--currentState]);
		canvas.renderAll();
		changingStates = false;
	}
}

function redo() {
	if (state.length - 1 > currentState) {
		changingStates = true;
		canvas.clear().renderAll();
		canvas.loadFromJSON(state[++currentState]);
		canvas.renderAll();
		changingStates = false;
	}
}

function deleteObject() {
	if (!canvas.getActiveObject()) {
		return;
	}

	canvas.remove(canvas.getActiveObject());
}

function copyPaste() {
	if (!canvas.getActiveObject()) {
		return;
	}
	canvas.getActiveObject().clone(function (clonedObj) {
		canvas.discardActiveObject();
		clonedObj.set({
			left: clonedObj.left + 10,
			top: clonedObj.top + 10,
			evented: true,
		});
		if (clonedObj.type === 'activeSelection') {
			clonedObj.canvas = canvas;
			clonedObj.forEachObject(function (obj) {
				canvas.add(obj);
			});
			clonedObj.setCoords();
		} else {
			canvas.add(clonedObj);
		}
		clonedObj.top += 10;
		clonedObj.left += 10;
		canvas.setActiveObject(clonedObj);
		canvas.requestRenderAll();
	});
}

function cursor() {
	canvas.isDrawingMode = false;
}

function drawingPencil() {
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.color = color;
	canvas.freeDrawingBrush.width = 3;
}

function drawingPen() {
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.color = color;
	canvas.freeDrawingBrush.width = 10;
}

function drawingEraser() {
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.color = '#FFFFFF';
	canvas.freeDrawingBrush.width = 30;
}