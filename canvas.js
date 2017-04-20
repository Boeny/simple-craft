module.exports = function(elem){
	this.DOM = $(elem)[0];
	this.canvas = this.DOM.getContext('2d');
};

module.exports.prototype = {
	createData: function(w,h){
		return this.canvas.createImageData(w,h);
	},
	putData: function(data, x,y){
		this.canvas.putImageData(data, x || 0, y || 0);
	},
	
	getColorAtIndex: function(p,i){
		return {
			r: p.data[i] || 0,
			g: p.data[i+1] || 0,
			b: p.data[i+2] || 0,
			a: p.data[i+3] || 0
		};
	},
	setColorAtIndex: function(p,i,c){
		c = c || {};
		
		p.data[i] = c.r === undefined ? 0 : c.r;
		p.data[i+1] = c.g === undefined ? 0 : c.g;
		p.data[i+2] = c.b === undefined ? 0 : c.b;
		p.data[i+3] = c.a === undefined ? 255 : c.a;
	},
	
	getColorAt: function(p, x,y){
		return this.getColorAtIndex(p, 4*(x + y * this.DOM.width));
	},
	setColorAt: function(p, x,y, c){
		var i = 4*(x + y * this.DOM.width);
		this.setColorAtIndex(p,i,c);
	},
	
	//--------------------------------------
	
	setColor: function(color){
		if (!color) return;
		var tmp = is_object(color) ? color : {fill: color, stroke: color};
		if (tmp.stroke) this.canvas.strokeStyle = tmp.stroke;
		if (tmp.fill) this.canvas.fillStyle = tmp.fill;
	},
	
	render: function(){
		this.canvas.closePath();
		this.canvas.stroke();
	},
	
	drawLine: function(x1, y1, x2, y2, color, width){
		this.setColor(color);
		if (width) this.canvas.lineWidth = width;
		if (this.canvas.params.render) this.canvas.beginPath();
		
		this.canvas.moveTo(x1+0.5, y1+0.5);
		this.canvas.lineTo(x2+0.5, y2+0.5);
		
		if (this.canvas.params.render) this.render();
	},
	drawLineTo: function(x, y, init_x, init_y){
		if (init_x) this.init_line_x = init_x;
		if (init_y) this.init_line_y = init_y;
		
		this.drawLine(this.init_line_x, this.init_line_y, x, y);
		
		this.init_line_x = x;
		this.init_line_y = y;
	},
	drawLines: function(lines){
		var l;
		for (var i in lines){
			l = lines[i];
			this.drawLine(l[0], l[1], l[2], l[3], l[4], l[5]);
		}
	},
	drawRect: function(x1, y1, x2, y2, color){
		this.setColor(color);
		if (this.canvas.params.render) this.canvas.beginPath();
		
		this.canvas.fillRect(x1+0.5, y1+0.5, x2+0.5, y2+0.5);
		
		if (this.canvas.params.render) this.render();
	},
	drawText: function(text, x, y, font, color){
		this.setColor(color);
		if (font) this.canvas.font = font;
		this.canvas.fillText(text, x, y);
	},
	drawTexts: function(texts){
		var t;
		for (var i in texts){
			t = texts[i];
			this.drawText(t[0], t[1], t[2], t[3], t[4]);
		}
	}
};
