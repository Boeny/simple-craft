var App = function(elem){
	this.c = new Canvas(elem);

	this.c.DOM.width = this.width = $(window).width();
	this.c.DOM.height = this.height = $(window).height();
	
	this.bar = $('#bar');
	this.restart_btn = $('.restart');
};

App.prototype = {
	points_count: 300,
	radius: 100,
	frames_count: 1000,
	mass: 0.00001,
	
	tail: 10,// px
	temp_ergy: 0.001,
	close_mult: 10,
	
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
		this.setRandomPoints(this.points_count);
		this.render();
		this.calc(this.frames_count);
	},
	
	setPoint: function(x,y, r,g,b,a){
		this.x = x;
		this.y = y;
		this.color(r,g,b,a);
	},
	
	setRandomPoints: function(count){
		var w2 = this.width/2;
		var h2 = this.height/2;
		var r = this.radius || Math.min(w2/2,h2/2);
		
		iterate(count, () => {
			var v = randomInCircle(w2, h2, r, true);// as float
			this.setPoint(v.x, v.y);
			
			this.points.push({
				x: this.x,
				y: this.y,
				t: 0,
				c: 0,// connected
				speed: vuno(0)
			});
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
	
	getSpeed: function(v){
		var abs = vwith(v, (coo) => Math.abs(coo));
		var l = vlen(abs);
		
		if (l < 0.001 || l < this.temp_ergy) return v;
		
		return vmult(
			vwith(v, (coo) => this.getSign(coo)),
			vsub(abs, vuno(this.temp_ergy), true),
			true
		);
	},
	
	process: function(){
		var p, p2, l, d, s;
		
		for (var i=0; i<this.points.length; i++){
			p = this.points[i];
			
			//if (!this.inScr(p)) continue;
			
			//this.setPoint(p.x,p.y, 0,0,0,0);
			
			for (var j=i+1; j<this.points.length; j++){
				p2 = this.points[j];
				
				//if (!this.inScr(p2)) continue;
				
				d = vsub(p2, p, true);
				l = vlen(d);
				
				//if (l > 100) continue;
				
				if (l > 1){
					vmult(d, this.mass/l);
					
					vadd(p.speed, d);
					vsub(p2.speed, d);
					
					/*if (p.c && p.c === p2.c){// connected
						vmult(p.speed, this.close_mult);
						vmult(p2.speed, this.close_mult);
					}*/
				}
				else{// collision
					//p.c = i;
					//p2.c = j;
					
					d = {x: this.getSign(d.x)*(1-l), y: this.getSign(d.y)*(1-l)};
					
					vsub(p, d);
					vadd(p2, d);
					
					s = vmult(vadd(p.speed, p2.speed, true), 0.5, true);
					p.speed = vcopy(s);
					p2.speed = vcopy(s);
					
					//p.t += vlen(p2.speed);
					//p2.t += vlen(p.speed);
				}
			}
			
			vadd(p, p.speed);
			
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
				speed: vcopy(p.speed)
			});
		}
		
		return res;
	},
	
	calc: function(frames){
		this.history.push(this.copyPoints());
		
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
		var old, opacity;
		var step = Math.round(255/this.tail);
		
		var i = 0;
		var t = this.frame - this.tail;
		if (t < 0) t = 0;
		
		do {
			old = this.history[t];
			opacity = i*step;
			
			for (var i in old){
				if (this.inScr(old[i])) this.setPoint(old[i].x, old[i].y, 0,0,0,opacity);
			}
			
			i++;
			t++;
		}
		while(t < this.frame);
		
		var points = this.history[this.frame];
		if (!points){
			this.stop();
			return;
		}
		
		for (var i in points){
			if (this.inScr(points[i])) this.setPoint(points[i].x, points[i].y, 0,0,0,255);// , 255 * p.t
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
