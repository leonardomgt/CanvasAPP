var canvas = new fabric.Canvas("canvasapp", { width: 1086, height: 600 });
var current;
var list = [];
var state = [];
var index = 0;
var index2 = 0;
var action = false;
var refresh = true;

canvas.on("object:added", function (e) {
    var object = e.target;

    if (action === true) {
        state = [state[index2]];
        list = [list[index2]];

        action = false;
        index = 1;
		}
		
    object.saveState();
    state[index] = JSON.stringify(object.originalState);
    list[index] = object;
    index++;
    index2 = index - 1;
    
    refresh = true;
});

canvas.on("object:modified", function (e) {
    var object = e.target;

    if (action === true) {
        state = [state[index2]];
        list = [list[index2]];

        action = false;
        index = 1;
    }

    object.saveState();

    state[index] = JSON.stringify(object.originalState);
    list[index] = object;
    index++;
    index2 = index - 1;

    refresh = true;
});

function addShape() {
	//addCircle();
	//addRectangle();
	addTriangle();
}

function addCircle() {
	canvas.add(new fabric.Circle({ radius: 30, fill: '#f55', top: 100, left: 100 }));
}

function addRectangle() {
	canvas.add(new fabric.Rect({ width: 60,	height: 60,	fill: '#f55', left: 100, top: 100 }));
}

function addTriangle() {
	canvas.add(new fabric.Triangle({ width: 60,	height: 60,	fill: '#f55', left: 100, top: 100 }));
}

function addImage() {
	fabric.Image.fromURL('images/sonic.png', function(img){
		canvas.add(img);
	});
}

function saveAsImage() {
	$("#canvasapp").get(0).toBlob(function(blob){
		saveAs(blob, "myImage.png");
	});
}

function clearCanvas() { 
	canvas.clear();
}

function undo() { 
	if (index <= 0) {
		index = 0;
		return;
}

if (refresh === true) {
		index--;
		refresh = false;
}

index2 = index - 1;
current = list[index2];
current.setOptions(JSON.parse(state[index2]));

index--;
current.setCoords();
canvas.renderAll();
action = true;
}

function redo() { 
	action = true;
    if (index >= state.length - 1) {
        return;
    }

    index2 = index + 1;
    current = list[index2];
    current.setOptions(JSON.parse(state[index2]));

    index++;
    current.setCoords();
    canvas.renderAll();
}

function drawPencil() {
	var $ = function(id){return document.getElementById(id)};
  
	var canvas = this.__canvas = new fabric.Canvas('c', {
	  isDrawingMode: true
	});
  
	fabric.Object.prototype.transparentCorners = false;
  
	var drawingModeEl = $('drawing-mode'),
		drawingOptionsEl = $('drawing-mode-options'),
		drawingColorEl = $('drawing-color'),
		drawingShadowColorEl = $('drawing-shadow-color'),
		drawingLineWidthEl = $('drawing-line-width'),
		drawingShadowWidth = $('drawing-shadow-width'),
		drawingShadowOffset = $('drawing-shadow-offset')
  
  
	drawingModeEl.onclick = function() {
	  canvas.isDrawingMode = !canvas.isDrawingMode;
	  if (canvas.isDrawingMode) {
		drawingModeEl.innerHTML = 'Cancel drawing mode';
		drawingOptionsEl.style.display = '';
	  }
	  else {
		drawingModeEl.innerHTML = 'Enter drawing mode';
		drawingOptionsEl.style.display = 'none';
	  }
	};
  
	if (fabric.PatternBrush) {
	  var vLinePatternBrush = new fabric.PatternBrush(canvas);
	  vLinePatternBrush.getPatternSrc = function() {
  
		var patternCanvas = fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = 10;
		var ctx = patternCanvas.getContext('2d');
  
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(0, 5);
		ctx.lineTo(10, 5);
		ctx.closePath();
		ctx.stroke();
  
		return patternCanvas;
	  };
  
	  var hLinePatternBrush = new fabric.PatternBrush(canvas);
	  hLinePatternBrush.getPatternSrc = function() {
  
		var patternCanvas = fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = 10;
		var ctx = patternCanvas.getContext('2d');
  
		ctx.strokeStyle = this.color;
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.moveTo(5, 0);
		ctx.lineTo(5, 10);
		ctx.closePath();
		ctx.stroke();
  
		return patternCanvas;
	  };
  
	  var squarePatternBrush = new fabric.PatternBrush(canvas);
	  squarePatternBrush.getPatternSrc = function() {
  
		var squareWidth = 10, squareDistance = 2;
  
		var patternCanvas = fabric.document.createElement('canvas');
		patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
		var ctx = patternCanvas.getContext('2d');
  
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, squareWidth, squareWidth);
  
		return patternCanvas;
	  };
  
	  var diamondPatternBrush = new fabric.PatternBrush(canvas);
	  diamondPatternBrush.getPatternSrc = function() {
  
		var squareWidth = 10, squareDistance = 5;
		var patternCanvas = fabric.document.createElement('canvas');
		var rect = new fabric.Rect({
		  width: squareWidth,
		  height: squareWidth,
		  angle: 45,
		  fill: this.color
		});
  
		var canvasWidth = rect.getBoundingRect().width;
  
		patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
		rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });
  
		var ctx = patternCanvas.getContext('2d');
		rect.render(ctx);
  
		return patternCanvas;
	  };
  
	  var img = new Image();
	  img.src = '../assets/honey_im_subtle.png';
  
	  var texturePatternBrush = new fabric.PatternBrush(canvas);
	  texturePatternBrush.source = img;
	}
  
	$('drawing-mode-selector').onchange = function() {
  
	  if (this.value === 'hline') {
		canvas.freeDrawingBrush = vLinePatternBrush;
	  }
	  else if (this.value === 'vline') {
		canvas.freeDrawingBrush = hLinePatternBrush;
	  }
	  else if (this.value === 'square') {
		canvas.freeDrawingBrush = squarePatternBrush;
	  }
	  else if (this.value === 'diamond') {
		canvas.freeDrawingBrush = diamondPatternBrush;
	  }
	  else if (this.value === 'texture') {
		canvas.freeDrawingBrush = texturePatternBrush;
	  }
	  else {
		canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
	  }
  
	  if (canvas.freeDrawingBrush) {
		canvas.freeDrawingBrush.color = drawingColorEl.value;
		canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
		canvas.freeDrawingBrush.shadow = new fabric.Shadow({
		  blur: parseInt(drawingShadowWidth.value, 10) || 0,
		  offsetX: 0,
		  offsetY: 0,
		  affectStroke: true,
		  color: drawingShadowColorEl.value,
		});
	  }
	};
  
	drawingColorEl.onchange = function() {
	  canvas.freeDrawingBrush.color = this.value;
	};
	drawingShadowColorEl.onchange = function() {
	  canvas.freeDrawingBrush.shadow.color = this.value;
	};
	drawingLineWidthEl.onchange = function() {
	  canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
	  this.previousSibling.innerHTML = this.value;
	};
	drawingShadowWidth.onchange = function() {
	  canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
	  this.previousSibling.innerHTML = this.value;
	};
	drawingShadowOffset.onchange = function() {
	  canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
	  canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
	  this.previousSibling.innerHTML = this.value;
	};
  
	if (canvas.freeDrawingBrush) {
	  canvas.freeDrawingBrush.color = drawingColorEl.value;
	  canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
	  canvas.freeDrawingBrush.shadow = new fabric.Shadow({
		blur: parseInt(drawingShadowWidth.value, 10) || 0,
		offsetX: 0,
		offsetY: 0,
		affectStroke: true,
		color: drawingShadowColorEl.value,
	  });
	}
  }