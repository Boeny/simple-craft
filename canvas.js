module.exports = function(o){
	this.canvas = $(o.elem)[0].getContext('2d');
	this.canvas.params = o;
	
	if (o.width) this.canvas.lineWidth = o.width;
	this.setColor(o.color);
	if (!o.render) this.canvas.beginPath();
};
module.exports.prototype = {
	/**
	 * x, y, 0-255
	 */
	doWithEachPixel: function(w,h,func){
		var img = this.canvas.getImageData(0,0, w, h);
		
		for (var i in img.data){
			img.data[i] = func(i % w, Math.floor(i/w), img.data[i]);
		}
		
		this.canvas.putImageData(img,0,0);
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