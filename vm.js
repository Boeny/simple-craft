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
	
	//-----------------------------------------------
	
	calc: function(){
		var frames = this.frames_count;
		var bar_length = this.bar.parent().width();
		
		$.ajax({
			url: '/calc?width='+this.width+'&height='+this.height+'&frames='+frames,
			dataType: 'json',
			success: (res) => {
				this.history.push(res.data);
				
				this.bar.width(bar_length * res.index / frames);
				this.counter.html(res.index+'/'+frames);
				
				if (res.index <  frames)
					this.calc();
				else
					this.stopCalc();
			}
		});
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
