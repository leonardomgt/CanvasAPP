
var canvas = new fabric.Canvas("canvasapp", { 
	width: $("#canvas-container").width(), 
	height: $("#canvas-container").height(), 
	isDrawingMode: false });

canvas.backgroundColor = "#ffffff";
var state = [];
var currentState = 0;
var color = '#0000ff';
var sound;
var isSoundPlaying = false;
var changingStates = false;

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

$("#audio-rec-btn").click(function () {
	$("input#recorder").focus();
	$("input#recorder").click();
});

$("input#recorder").change(function () {
	var file = $("input#recorder")[0].files[0];
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
//         Manage image load
// ==================================


$("#image-loader-btn").click(function () {
	$("input#imageLoader").focus();
	$("input#imageLoader").click();
});

$("input#imageLoader").change(function () {
	var file = $("input#imageLoader")[0].files[0];
	// $("audio#player")[0].src = sound;
	addImage(URL.createObjectURL(file))
});


// ==================================
//     Manage canvas opperations
// ==================================

canvas.on('object:modified', function () {
	if (!changingStates) {
		updateModifications();
	}
});

canvas.on('object:added', function () {
	if (!changingStates) {
		updateModifications();
	}
});

canvas.on('mouse:up', function (e) {
	if (canvas.isDrawingMode && canvas._objects && canvas._objects.length > 0) {
		var drawObj = canvas._objects[canvas._objects.length - 1];
		drawObj.set('left', drawObj.left + canvas.freeDrawingBrush.width / 2.0);
		drawObj.set('top', drawObj.top + canvas.freeDrawingBrush.width / 2.0);
		drawObj.selectable = false; 
		drawObj.hoverCursor = 'inherit';
		drawObj.setCoords();
		canvas.renderAll();
		console.log(drawObj);
		
	}
});


function updateModifications() {
	state = state.slice(0, currentState + 1);
	myjson = JSON.stringify(canvas);
	state.push(myjson);
	currentState++;
	console.log(state);

}

function addShape(shape = 'rectangle') {
	canvas.isDrawingMode = false;
	switch (shape) {
		case "circle":
			obj = new fabric.Circle({ radius: 30, fill: color, top: 100, left: 100 });
			break;
		case "triangle":
			obj = new fabric.Triangle({ width: 60, height: 60, fill: color, left: 100, top: 100 });
			break;
		default:
		case "rectangle":
			obj = new fabric.Rect({ width: 60, height: 60, fill: color, left: 100, top: 100 });
			break;
	}
	canvas.add(obj);
	canvas.setActiveObject(obj);
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
	canvas.freeDrawingBrush.width = 1;
}

function drawingPen() {
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.color = color;
	canvas.freeDrawingBrush.width = 30;
}

function drawingEraser() {
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.color = '#FFFFFF';
	canvas.freeDrawingBrush.width = 30;
}