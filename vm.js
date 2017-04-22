'use strict';

window.onerror = function (msg, url, line) {
	alert(msg + "\n" + url + "\n" + "\n" + line);
	return true;
};

var App = function(elem){
	this.c = new Canvas(elem);

	this.c.DOM.width = this.width = $(window).width();
	this.c.DOM.height = this.height = $(window).height();

	this.bar = $('#bar');
	this.counter = $('#counter');
	this.restart_btn = $('.restart');
	
	this.img = this.c.createData(this.width, this.height);
	this.calc();
};

App.prototype = {
	points_count: 300,
	radius: 30,
	frames_count: 5000,
	mass: 0,//0.000005,
	
	tail: 10,// px
	collision_distance: 0.5,
	temp_color_inc: 50,
	
	history: [],
	frame: 0,
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
		this.img = this.c.createData(this.width, this.height);
		this.resume();
	},
	
	//--------------------------
	
	setRandomPoints: function(data, count){
		var w2 = this.width/2;
		var h2 = this.height - this.radius;
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

	addOuterGrav: function(p){
		if (!this.outer_mult) return;
		
		var d = vsub(this.outer_grav, p, true);
		var l = vlen(d);
		
		if (l < this.collision_distance) return;
		
		vmult(d, this.outer_mult/l);
		vadd(p.speed, d);
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
					if (this.mass){
						vmult(d, this.mass/l);
						vadd(p.speed, d);
						vsub(p2.speed, d);
					}
				}
				else{// collision
					vmult(d, (l-this.collision_distance)/l);// normalize and set the backward direction
					
					vadd(p, d);
					vsub(p2, d);
					
					d = vmult(vadd(p.speed, p2.speed, true), 0.4, true);
					p.speed = vcopy(d);
					p2.speed = vcopy(d);
				}
			}

			this.addOuterGrav(p);
			
			vadd(p, p.speed);

			if (this.outer_mult && p.y > this.height)
				p.y = 2*this.height - p.y;
		}
	},
	
	inScr: function(_x,y){
		var x;
		if (typeof _x == 'object'){
			y = _x.y;
			x = _x.x;
		}
		else x = _x;
		
		return x > 0 && x < this.width && y > 0 && y < this.height;
	},
	
	setTail: function(data, frame){
		if (!this.tail) return;
		
		var old, opacity;                                var step = Math.round(255/this.tail);                                                                                                              var t = frame - this.tail;                       if (t < 0) t = 0;
                var i = 0;                                       var c;

                do {
                        old = this.history[t];
                        opacity = i*step;

                        for (var y in old)
                        for (var x in old[+y]){
                                x = +x;                                          y = +y;

				if (!data[y] || !data[y][x])                                                                      {                                                        check_obj(data, y, {});                                                                           c = this.c.getColorAt(this.img, x, y);
                                        data[y][x] = {r: c.r, g: c.g, b: c.b, a: opacity};                                        }
                        }

                        i++;
                        t++;
                }                                                while(t < frame);
	},

	copyPoints: function(frame){
		var data = {};
		var p, red;
		
		for (var i in this.points){
			p = vwith(this.points[i], (coo) => Math.round(coo));
			if (!this.inScr(p)) continue;
			if (data[p.y] && data[p.y][p.x])
			{
				red = data[p.y][p.x].r + this.temp_color_inc;
				data[p.y][p.x].r = red > 255 ? 255 : red;
			}
			else{
				check_obj(data, p.y, {});
				data[p.y][p.x] = {r: 0, g: 0, b: 0, a: 255};
			}
		}
		
		if (!frame) return data;
		
		this.setTail(data, frame);
		
		return data;
	},
	
	calc: function(frames){
		frames = frames || this.frames_count;
		$.ajax({
			url: '/calc?width='+this.width+'&height='+this.height+'&bar_length='+this.bar.parent().width()+'&frames='+frames,
			dataType: 'json',
			success: (res) => {
				this.history.push(res.data);
				if (res.index <  frames)
					this.calc();
				else
					this.stopCalc();
			}
		});
		
		var step = Math.round(frames / l);
		if (step < 1) step = 1;
		
		var _data = {
			index: 0,
			frames: frames,
			bar_step: step,
			bar_koef: l / frames
		};
	},
	
	calcStep: function(_data){
			for (var i=1; i <= _data.bar_step; i++){
				this.process();
				this.history.push(this.copyPoints(_data.index + i));
			}
			
			_data.index += _data.bar_step;
			this.bar.width(_data.bar_koef * _data.index);
			this.counter.html(_data.index+'/'+_data.frames);
	},
	
	stopCalc: function(){
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
		
		for (var y in data)
		for (var x in data[+y]){
			x = +x;
			y = +y;
			this.c.setColorAt(this.img, x, y, data[y][x]);
		}
		
		this.c.putData(this.img);
		this.counter.html(this.frame);
		
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
});
