var App = function(elem){
	this.c = new Canvas(elem);

	this.c.DOM.width = this.width = $(window).width();
	this.c.DOM.height = this.height = $(window).height();
	
	this.bar = $('#bar');
};

App.prototype = {
	history: [],
	frame: 0,
	bar: null,
	
	run: function(){
		this.update();
		this.render();
	},
	start: function(){
		this.init();
		//this.resume();
	},
	stop: function(){
		if (!this.timer) return;
		clearInterval(this.timer);
		this.timer = null;
	},
	resume: function(){
		this.timer = setInterval(() => {this.run()}, 20);
	},
	
	//--------------------------
	
	init: function(){
		this.data = this.c.createData(this.width, this.height);
		this.setPoint(this.width/2, this.height/2, 255,0,0);
		this.setRandomPoints(200);
		this.render();
		this.calc(10000);
	},
	
	setPoint: function(x,y, r,g,b,a){
		this.x = x;
		this.y = y;
		this.color(r,g,b,a);
	},
	
	setRandomPoints: function(count){
		this.points = [];
		var w2 = this.width/2;
		var h2 = this.height/2;
		var r = Math.min(w2/2,h2/2);
		
		iterate(count, () => {
			var v = randomInCircle(w2, h2, r);
			this.setPoint(v.x, v.y);
			
			this.points.push({
				x: this.x,
				y: this.y,
				t: 0,
				speed: {x:0,y:0}
			});
		});
	},
	
	clearPoints: function(){
		foreach(this.points, (p) => {
			this.setPoint(p.x,p.y, 0,0,0,0);
		});
	},
	
	color: function(r,g,b,a){
		this.c.setColorAt(this.data, this.x,this.y, r,g,b,a);
	},
	
	apply: function(){
		this.c.putData(this.data);
	},
	
	getSign: function(a){
		return a < 0 ? -1 : 1;
	},
	
	getSpeed: function(v,t){
		var abs = Math.abs(v);
		if (abs < 0.001 || abs < t) return v;
		return  this.getSign(v)*(abs - t);
	},
	
	process: function(){
		var p, p2, l, dx, dy, dxl, dyl;
		var q = 0.001, m = 0.00001;
		
		for (var i=0; i<this.points.length-1; i++){
			p = this.points[i];
			
			//this.setPoint(p.x,p.y, 0,0,0,0);
			
			for (var j=i+1; j<this.points.length; j++){
				p2 = this.points[j];
				
				dx = p2.x - p.x;
				dy = p2.y - p.y;
				
				l = Math.sqrt(dx*dx + dy*dy);
				dxl = m*dx/l;
				dyl = m*dy/l;
				
				if (l > 10){
					p.speed.x += dxl;
					p.speed.y += dyl;
					p2.speed.x -= dxl;
					p2.speed.y -= dyl;
					p.t -= q/100;
					p2.t -= q/100;
				}
				else{
					var g = 10;
					if (l > 1){
						p.speed.x += g*dxl;
						p.speed.y += g*dyl;
						p2.speed.x -= g*dxl;
						p2.speed.y -= g*dyl;
					}
					else {// collision
						p.speed.x -= this.getSign(dxl)*(1-l);
						p.speed.y -= this.getSign(dyl)*(1-l);
						p2.speed.x += this.getSign(dxl)*(1-l);
						p2.speed.y += this.getSign(dyl)*(1-l);
						
						//p2.speed.x = p.speed.x = (this.getSpeed(p.speed.x,q) + this.getSpeed(p2.speed.x,q))/2;
						//p2.speed.y = p.speed.y = (this.getSpeed(p.speed.y,q) + this.getSpeed(p2.speed.y,q))/2;
						
						p.t += g*q;
						p2.t += g*q;
					}
				}
			}
			
			p.x += p.speed.x;
			p.y += p.speed.y;
			//this.setPoint(p.x,p.y, 2550*p.t);
		}
	},
	
	copyPoints: function(){
		var res = [];
		
		for (var i in this.points){
			p = this.points[i];
			res.push({
				x: p.x,
				y: p.y,
				t: p.t,
				speed: {
					x: p.speed.x,
					y: p.speed.y
				}
			});
		}
		
		return res;
	},
	
	calc: function(frames){
		this.history = [this.copyPoints()];
		
		var l = this.bar.parent().width();
		
		$(window).trigger('calc', {
			index: 0,
			frames: frames,
			bar_length: l,
			bar_koef: l / frames
		});
	},
	
	calcStep: function(_data){
		if (_data.index < _data.frames)
		{
			for (var i=0; i < _data.bar_length; i++){
				this.process();
				this.history.push(this.copyPoints());
			}
			_data.index += _data.bar_length;
			$(window).trigger('calc', _data);
		}
		else{
			this.frame = 1;
		}
	},
	
	update: function(){
		var points = this.history[this.frame];
		if (!points) return;
		
		var old = this.history[this.frame-1];
		for (var i in points){
			this.setPoint(old[i].x, old[i].y, 0,0,0,0);
			this.setPoint(points[i].x, points[i].y, 2550*p.t);
		}
		
		this.frame++;
	},
	
	render: function(){
		this.apply();
	}
};

$(function(){
	var app = new App('#canvas');
	
	$(document).on('click', '#canvas', function(){
		if (app.timer)
			app.stop();
		else
			app.resume();
	});
	
	$(window).on('calc', function(e, _data){
		//app.bar.width(_data.bar_koef * _data.index);
		app.bar.html(_data.index+' of '+_data.frames);
		app.calcStep(_data);
	});
	
	app.start();
});
