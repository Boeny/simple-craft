function getElement(id){
	return document.getElementById(id);
};
function addEvent(elem, event, handler){
	elem.addEventListener(event, handler);
}

var components = {
	Element: function(id){
		this.DOM = getElement(id);
		this.update = (text) => {this.DOM.innerHTML = text};
	},
	
	Bar: function(id, count){
		this.DOM = getElement(id);
		this.koef = this.DOM.parentNode.clientWidth / count;
		this.update = (index) => {this.DOM.style.width = this.koef * index + 'px'};
	},
	
	Button: function(id, onClick){
		this.DOM = getElement(id);
		addEvent(this.DOM, 'click', onClick);
		this.show = () => {this.DOM.style.display = 'block'};
	}
};

function Canvas(id, width, height){
	this.DOM = getElement(id);
	this.DOM.width = width;
	this.DOM.height = height;
	
	this.canvas = this.DOM.getContext('2d');
};

Canvas.prototype = {
	getWidth: function(){
		return this.DOM.width;
	},
	getHeight: function(){
		return this.DOM.height;
	},
	
	addEvent: function(event, handler){
		addEvent(this.DOM, event, handler);
	},
	createComponent: function(type, args){
		var comp = {};
		components[type].apply(comp, args);
		return comp;
	},
	initComponents: function(components){
		for (var prop in components){
			this[prop] = components[prop];
		}
	},
	
	createSender: function(data, onLoad){
		this.sender = new XMLHttpRequest();
		this.openSender();
		
		this.sender.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		this.sender.responseType = 'arraybuffer';
		this.sender.onload = onLoad;
		
		this.sender.send(JSON.stringify(data));
	},
	openSender: function(){
		this.sender.open('POST','/calc',true);
	},
	send: function(data){
		this.openSender();
		this.sender.send(data);
	},
	
	createData: function(w,h){
		return this.canvas.createImageData(w || this.getWidth(), h || this.getHeight());
	},
	render: function(img, x,y){
		this.canvas.putImageData(img, x || 0, y || 0);
	},
	nextFrame: function(renderFunc){
		requestAnimationFrame(renderFunc);
	},
	
	getColorAtIndex: function(img,i){
		return {
			r: img.data[i] || 0,
			g: img.data[i+1] || 0,
			b: img.data[i+2] || 0,
			a: img.data[i+3] || 0
		};
	},
	setColorAtIndex: function(img,i,c){
		c = c || {};
		
		img.data[i] = c.r === undefined ? 0 : c.r;
		img.data[i+1] = c.g === undefined ? 0 : c.g;
		img.data[i+2] = c.b === undefined ? 0 : c.b;
		img.data[i+3] = c.a === undefined ? 255 : c.a;
	},
	
	getColorAt: function(img, x,y){
		return this.getColorAtIndex(img, 4*(x + y * this.DOM.width));
	},
	setColorAt: function(p, x,y, c){
		var i = 4*(x + y * this.DOM.width);
		this.setColorAtIndex(p,i,c);
	},
	
	readyForPlaying: function(){
		this.restart_btn.show();
	},
	updateProgress: function(i, count){
		this.bar.update(i);
		this.updateCounter(i+'/'+count);
	},
	updateCounter: function(i){
		this.counter.update(i);
	}
};

addEvent(document, 'DOMContentLoaded', function(){
	var width = global.innerWidth/2 >> 0;
	var height = global.innerHeight/2 >> 0;
	
	var app = new App({
		renderer: new Canvas('canvas', width, height)
	});
	
	app.renderer.initComponents({
		'bar':			new components.Bar('bar', app.frames_count),
		'counter':		new components.Element('counter'),
		'restart_btn':	new components.Button('restart', function(){app.restart()})
	});
	app.renderer.addEvent('mousedown', () => {app.timer ? app.stop() : app.resume()});
	
	app.calc({
		width: width,
		height: height
	});
});
