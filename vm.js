var App = function(elem){
	this.c = new Canvas(elem);

	this.c.DOM.width = this.width = $(window).width();
	this.c.DOM.height = this.height = $(window).height();
	
	this.bar = $('#bar');
	this.restart_btn = $('.restart');
};

App.prototype = {
	history: [],
	frame: 0,
	bar: null,
	x: 0,
	y: 0,
	points: [],
	
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
		if (!this.frame) this.stopCalc();
		this.timer = setInterval(() => {this.run()}, 20);
	},
	restart: function(){
		this.stop();
		this.frame = 1;
		this.resume();
	},
	
	//--------------------------
	
	init: function(){
		this.data = this.c.createData(this.width, this.height);
		this.setPoint(this.width/2, this.height/2, 255,0,0);
		this.setRandomPoints(500);
		this.render();
		this.calc(1000);
	},
	
	setPoint: function(x,y, r,g,b,a){
		this.x = x;
		this.y = y;
		this.color(r,g,b,a);
	},
	
	setRandomPoints: function(count){
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
		var abs = {x: Math.abs(v.x), y: Math.abs(v.y)};
		var l = vlen(abs);
		if (l < 0.001 || l < t) return v;
		return {x: this.getSign(v.x)*(abs.x - t), y: this.getSign(v.y)*(abs.y - t)};
	},
	
	process: function(){
		var p, p2, l, d, s;
		var q = 0.001, m = 0.0001;
		
		for (var i=0; i<this.points.length-1; i++){
			p = this.points[i];
			
			if (!this.inScr(p)) continue;
			
			//this.setPoint(p.x,p.y, 0,0,0,0);
			
			for (var j=i+1; j<this.points.length; j++){
				p2 = this.points[j];
				
				if (!this.inScr(p2)) continue;
				
				d = vsub(p2, p, true);
				l = vlen(d);
				
				//if (l > 100) continue;
				
				vmult(d, m/l);
				
				if (l > 10){
					vadd(p.speed, d);
					vsub(p2.speed, d);
				}
				else{// collision
					p.c = true;
					p2.c = true;
					d = {x: this.getSign(d.x)*(1-l), y: this.getSign(d.y)*(1-l)};
						p.speed = vmult(d, -p.t, true);
						p2.speed = vmult(d, -p2.t, true);
						
						//p2.speed = p.speed = vmult(vadd(this.getSpeed(p.speed,q), this.getSpeed(p2.speed,q)), 0.5);
						
						p.t += vlen(p2.speed);
						p2.t += vlen(p.speed);
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
		
		var _data = {
			index: 0,
			frames: frames,
			bar_length: Math.round(frames / l),
			bar_koef: l / frames
		};
		
		this.calc_timer = setInterval(() => {this.calcStep(_data)}, 20);
	},
	
	calcStep: function(_data){
		if (_data.index < _data.frames)
		{
			for (var i=0; i < _data.bar_length; i++){
				this.process();
				this.history.push(this.copyPoints());
			}
			_data.index += _data.bar_length;
			this.bar.width(_data.bar_koef * _data.index);
		}
		else{
			this.stopCalc();
		}
	},
	
	stopCalc: function(){
		clearInterval(this.calc_timer);
		this.points = null;
		this.frame = 1;
                this.restart_btn.show();
	},

	inScr: function(p){
		return p.x > 0 && p.x < this.width && p.y > 0 && p.y < this.height;
	},
	
	update: function(){
		var points = this.history[this.frame];
		if (!points){
			this.stop();
			return;
		}
		
		var old = this.history[this.frame-1];
		for (var i in points){
			if (this.inScr(old[i]))		this.setPoint(old[i].x, old[i].y, 0,0,0,0);
			if (this.inScr(points[i]))	this.setPoint(points[i].x, points[i].y, 255*p.t);
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
	
	$('.restart').on('click', function(){
		app.restart();
	});
	
	app.start();
});
