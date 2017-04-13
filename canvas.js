module.exports = function(o){
	if (!is_object(o)) o = {elem: o};
	o.elem = $(o.elem);
	this.canvas = o.elem[0].getContext('2d');
	this.canvas.params = o;
	
	if (o.width) this.canvas.lineWidth = o.width;
	this.setColor(o.color);
	if (!o.render) this.canvas.beginPath();
};

module.exports.prototype = {
	createData: function(w,h){
		return this.canvas.createImageData(w, h);
	},
	createPixel: function(r,g,b,a){
		var p = this.createData(1, 1);
		p.data[0] = r || 0;
		p.data[1] = g || 0;
		p.data[2] = b || 0;
		p.data[3] = a || 255;
		return p;
	},
	putData: function(data){
		this.canvas.putImageData(data, 0, 0);
	},
	
	setColorAt: function(p, x,y, r,g,b,a){
		var i = x + y * this.canvas.width;
		p.data[i] = r || 0;
		p.data[i+1] = g || 0;
		p.data[i+2] = b || 0;
		p.data[i+3] = a || 255;
	},
	
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