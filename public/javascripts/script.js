var canvas = new fabric.Canvas("canvasapp", { width: 1550, height: 850, isDrawingMode: false });
var state = [];
var currentState = 0;
var color = '#000000';
var changingStates = false;
state.push(JSON.stringify(canvas));

$("#colorPicker_box").css('background-color', color);
canvas.freeDrawingBrush.color = color;

$("input.hidden").change(function () {
	color = $("input.hidden")[0].value;
	$("#colorPicker_box").css('background-color', color);

	canvas.freeDrawingBrush.color = color;

});


$("#colorPicker_btn").click(function(){
	$("#colorPicker_btn + input.hidden").focus();
	$("#colorPicker_btn + input.hidden").val(color);
	$("#colorPicker_btn + input.hidden").click();
});

canvas.on(
	'object:modified', function () {
		updateModifications();
	});
canvas.on(
	'object:added', function () {
		if(!changingStates){
		updateModifications();
		}
	});


canvas.on("after:render", function(){ canvas.calcOffset() });

function updateModifications() {
		state = state.slice(0, currentState + 1);
		myjson = JSON.stringify(canvas);
		state.push(myjson);
		currentState++;
		console.log(state);
		
}

function addShape(shape = 'rectangle') {
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


function addImage() {
	fabric.Image.fromURL('images/sonic.png', function (img) {
		canvas.add(img);
		canvas.setActiveObject(img);
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