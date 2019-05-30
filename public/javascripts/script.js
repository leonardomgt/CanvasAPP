var canvas = new fabric.Canvas("canvasapp", { width: 750, height: 400, isDrawingMode: false });
var state = [];
var currentState = 0;
var color = '#0000ff';
var sound;

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

$("#colorPicker_btn").click(function(){
	$("input#color-picker").focus();
	$("input#color-picker").click();
});

// ==================================
//           Manage sound
// ==================================

$("#audio-rec-btn").click(function(){
	$("input#recorder").focus();
	$("input#recorder").click();
});

$("input#recorder").change(function() {
	var file = $("input#recorder")[0].files[0];
	sound = URL.createObjectURL(file);
	$("audio#player")[0].src = sound;
});


function playSound() {
	$("audio#player")[0].play()

	$("#fas_fa-play_button i").removeClass("fa-play")
	$("#fas_fa-play_button i").addClass("fa-pause")
}

function audioEnded() {
	// alert('Audio ended')

	$("#fas_fa-play_button i").removeClass("fa-pause")
	$("#fas_fa-play_button i").addClass("fa-play")
}

// ==================================
//     Manage canvas opperations
// ==================================
canvas.on(
	'object:modified', function () {
		updateModifications(true);
	},
	'object:added', function () {
		updateModifications(true);
	});

function updateModifications(savehistory) {
	if (savehistory === true) {
		state = state.slice(0, currentState + 1);
		myjson = JSON.stringify(canvas);
		state.push(myjson);
		currentState++;
	}
}

function addShape(shape = 'rectangle') {
	//addCircle();
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
	updateModifications(true);
	canvas.setActiveObject(obj);
}


function addImage() {
	fabric.Image.fromURL('images/sonic.png', function (img) {
		canvas.add(img);
		canvas.setActiveObject(img);
		updateModifications(true);
	});
}

function saveAsImage() {
	$("#canvasapp").get(0).toBlob(function (blob) {
		saveAs(blob, "myImage.png");
	});
}

function clearCanvas() {
	canvas.clear().renderAll();
	if (currentState > 0) {
		updateModifications(true);
	}
}

function undo() {
	if (currentState > 0) {
		canvas.clear().renderAll();
		canvas.loadFromJSON(state[--currentState]);
		canvas.renderAll();
	}
}

function redo() {
	if (state.length - 1 > currentState) {
		canvas.clear().renderAll();
		canvas.loadFromJSON(state[++currentState]);
		canvas.renderAll();
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
		updateModifications(true);
	});
}

function cursor() {
	canvas.isDrawingMode = false;
}

function drawingPencil() {
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.width = 1;
}

function drawingPen() {
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.width = 30;
}

function drawingEraser() {
	canvas.isDrawingMode = true;
	canvas.freeDrawingBrush.color = '#FFFFFF';
	canvas.freeDrawingBrush.width = 30;
}