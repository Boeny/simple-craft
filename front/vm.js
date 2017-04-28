'use strict';

var App = function(elem){
	this.c = new Canvas(elem);

	this.c.DOM.width = this.width = $(window).width();
	this.c.DOM.height = this.height = $(window).height();

	this.bar = $('#bar');
	this.bar_koef = this.bar.parent().width()/this.frames_count;
	this.counter = $('#counter');
	this.restart_btn = $('#restart');
	
	this.clear();
	this.calc({
		width: this.width,
		height: this.height
	});
};

App.prototype = {
	calc_index: 0,
	frames_count: 1000,
	history: [],
	play_index: 0,
	tail: 10,// px
	calculating: true,
	light_map: {},
	
	//------------------------
	stop: function(){
		if (!this.timer) return;
		clearInterval(this.timer);
		this.timer = null;
	},
	resume: function(){
		if (!this.play_index) this.stopCalc();
		this.timer = setInterval(() => {this.update()}, 20);
	},
	restart: function(){
		this.stop();
		this.play_index = 1;
		this.clear();
		this.resume();
	},
	
	//-----------------------------------------------
	calc: function(data){
		$.ajax({
			url: '/calc',
			type: 'post',
			data: data,
			dataType: 'json',
			success: (result) => {
				if (result.light)this.light_map = result.light;
				result = result.data;
				
				// save the package of the frames to the history
				for (var i in result)
				{
					this.setTail(this.calc_index, result[i]);
					this.history.push(result[i]);
					this.calc_index++;
				}
				
				this.render(arr_last(result));
				
				this.bar.width(this.bar_koef * this.calc_index);
				this.counter.html(this.calc_index+'/'+this.frames_count);
				
				if (this.calculating && this.calc_index < this.frames_count)
				{
					this.calc();
				}
				else{
					this.stopCalc();
				}
			}
		});
	},
	
	setTail: function(index, data){
 		if (!this.tail || !+index) return;
 		
		var old, opacity;
		var step = Math.round(255/this.tail);
		var t = index - this.tail;
		if (t < 0) t = 0;
		var i = 0;
		var c;
		
		do {
			old = this.history[t];
			opacity = i*step;
			
			for (var y in old)
			for (var x in old[+y]){
				x = +x;
				y = +y;
				
				if (!data[y] || !data[y][x])
				{
					check_obj(data, y, {});
					c = this.c.getColorAt(this.img, x, y);
					data[y][x] = {r: c.r, g: c.g, b: c.b, a: opacity};
				}
			}
			
			i++;
			t++;
		}
		while(t < index);
 	},
	
	stopCalc: function(){
		this.calculating = false;
		this.play_index = 1;
		this.clear();
		this.restart_btn.show();
	},
	
	//-----------------------------------------------------
	update: function(){
		var data = this.history[this.play_index];
		if (!data){
			this.stop();
			return;
		}
		
		this.render(data);
		this.counter.html(this.play_index);
		
		this.play_index++;
	},
	
	render: function(data){
		var l = this.light_map;
		for (var y in l)
		for (var x in l[+y]){
			x = +x;
			y = +y;
			this.c.setColorAt(this.img, x, y, data[y] && data[y][x] ? data[y][x] : l[y][x]);
		}
		
		this.c.putData(this.img);
	},
	
	clear: function(){
		this.img = this.c.createData(this.width, this.height);
	}
};

$(function(){
	var app = new App('#canvas');
	
	$(document).on('mousedown', '#canvas', function(){
		if (app.timer)
			app.stop();
		else
			app.resume();
	});
	
	$('#restart').on('click', function(){
		app.restart();
	});
});
