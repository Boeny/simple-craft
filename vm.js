'use strict';

var App = function(elem){
	this.c = new Canvas(elem);

	this.c.DOM.width = this.width = $(window).width();
	this.c.DOM.height = this.height = $(window).height();
	
	this.bar = $('#bar');
	this.restart_btn = $('.restart');
	
	var data = this.c.createData(this.width, this.height);
	this.setRandomPoints(data, this.points_count);
	this.c.putData(data);
};

App.prototype = {
	points_count: 200,
	radius: 100,
	frames_count: 1000,
	mass: 0.00001,
	
	tail: 1,// px
	collision_distance: 0.5,
	
	temp_ergy: 0.001,
	close_mult: 10,
	
	history: [],
	tmp_history: [],
	frame: 0,

	c: null,
	bar: null,
	restart_btn: null,
	x: 0,
	y: 0,
	points: [],
	
	//------------------------
	stop: function(){
		if (!this.timer) return;
		clearInterval(this.timer);
		this.timer = null;
	},
	resume: function(){
		if (!this.frame) this.stopCalc();
		this.timer = setInterval(() => {this.update()}, 20);
	},
	restart: function(){
		this.stop();
		this.frame = 1;
		this.resume();
	},
	
	//--------------------------
	
	setRandomPoints: function(data, count){
		var w2 = this.width/2;
		var h2 = this.height/2;
		var r = this.radius || Math.min(w2/2,h2/2);
		var v;
		
		iterate(count, () => {
			v = randomInCircle(w2, h2, r, true);// as float
			this.c.setColorAt(data, Math.round(v.x), Math.round(v.y));
			
			this.points.push({
				x: v.x,
				y: v.y,
				speed: vuno(0)
			});
		});
	},
	
	//-----------------------------------------------
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
		var p, p2, l, d;
		
		for (var i=0; i<this.points.length; i++){
			p = this.points[i];
			
			for (var j=i+1; j<this.points.length; j++){
				p2 = this.points[j];
				
				d = vsub(p2, p, true);
				l = vlen(d);
				
				if (l > this.collision_distance){
					vmult(d, this.mass/l);
					
					vadd(p.speed, d);
					vsub(p2.speed, d);
				}
				else{// collision
					d = vmult(vwith(d, (coo) => this.getSign(coo)), this.collision_distance - l, true);
					
					vsub(p, d);
					vadd(p2, d);
					
					d = vmult(vadd(p.speed, p2.speed, true), 0.5, true);
					p.speed = vcopy(d);
					p2.speed = vcopy(d);
				}
			}
			
			vadd(p, p.speed);
		}
	},
	
	inScr: function(x,y){
		if (y === undefined){
			y = x.y;
			x = x.x;
		}
		return x > 0 && x < this.width && y > 0 && y < this.height;
	},
	
	copyPoints: function(frame){
		var data = this.c.createData(this.width, this.height);
		var p, c, h = [];
		var need_tail = this.tmp_history.length < this.tail;
		
		for (var i in this.points){
			p = vwith(this.points[i], (coo) => Math.round(coo));
			if (!this.inScr(p)) continue;
			
			c = this.c.getColorAt(data, p.x, p.y);
			
			if (c.a){
				this.c.setColorAt(data, p.x, p.y, c.r + 1, c.g, c.b, c.a);
			}
			else{
				this.c.setColorAt(data, p.x, p.y);
			}

			if (need_tail) h.push(p);
		}
		
		this.tmp_history.push(h);

		if (!frame) return data;
		
		var old, opacity, old_tmp;
		var step = Math.round(255/this.tail);
		
		var i = 0;
		var t = frame - this.tail;
		if (t < 0) t = 0;
		
		do {
			old = this.history[t];
			old_tmp = this.tmp_history[i];
			opacity = i*step;
			
			for (var i in old_tmp){
				p = old[i];
				c = this.c.getColorAt(old, p.x, p.y);
				if (!c.a){
					this.c.setColorAt(data, p.x, p.y, c.r, c.g, c.b, opacity);
				}
			}
			
			i++;
			t++;
		}
		while(t < frame);
		
		return data;
	},
	
	calc: function(frames){
		frames = frames || this.frames_count;
		this.history.push(this.copyPoints());
		
		var l = this.bar.parent().width();
		
		var _data = {
			index: 0,
			frames: frames,
			bar_length: Math.round(frames / l),
			bar_koef: l / frames
		};
		
		this.calc_timer = setInterval(() => {this.calcStep(_data)}, 0);
	},
	
	calcStep: function(_data){
		if (_data.index < _data.frames)
		{
			for (var i=0; i < _data.bar_length; i++){
				this.process();
				this.history.push(this.copyPoints(_data.index + i + 1));
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
	
	//-----------------------------------------------------
	update: function(){
		var data = this.history[this.frame];
		
		if (!data){
			this.stop();
			return;
		}
		
		this.c.putData(data);
		
		/*var p;
		for (var y in points)
		for (var x in points[y]){
			p = points[y][x];
			this.setPoint(x, y, p.r, p.g, p.b, p.a);
		}*/
		
		this.frame++;
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
	
	app.calc();
});
