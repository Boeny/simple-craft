'use strict';

document.addEventListener('DOMContentLoaded', function(){
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
	frames_count: 1000,
	history: [],
	play_index: 0,
	
	//------------------------
	stop: function(){
		if (!this.timer) return;
		this.timer = null;
	},
	resume: function(){
		if (!this.play_index) this.stopCalc();
		this.timer = true;
		this.update();
	},
	restart: function(){
		this.stop();
		this.play_index = 1;
		this.clear();
		this.resume();
	},
	
	//----------------------------------------------- calculating process
	calc_index: 0,
	
	calc: function(data){
		var xhr = new XMLHttpRequest();
		xhr.open('POST','/calc',true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.responseType = 'arraybuffer';
		xhr.onload = () => {
			this.calc_index++;
				
			if (!this.play_index && this.calc_index < this.frames_count)
			{
				var result = xhr.response;
				
				// save the frame to the history
				result = new Uint8ClampedArray(result);
				
				this.history.push(result);
				requestAnimationFrame(() => {this.render(result)});
				
				this.bar.width(this.bar_koef * this.calc_index);
				this.counter.html(this.calc_index+'/'+this.frames_count);
				
				xhr.open('POST','/calc',true);
				xhr.send();
			}
			else this.stopCalc();
		};
		
		xhr.send(JSON.stringify(data));
	},
	
	stopCalc: function(){
		this.play_index = 1;
		this.clear();
		this.restart_btn.show();
	},
	
	//-----------------------------------------------------
	play_index_offset_initial: -1,
	play_index_offset: 2,
	show_play_time: false,
	
	update: function(){
		if (!this.timer || this.play_index >= this.history.length) return;
		console.log(this.play_index);
		requestAnimationFrame(() => {this.update()});
		
		this.play_index_offset_initial++;
		if (this.play_index_offset_initial < this.play_index_offset) return;
		
		var data = this.history[this.play_index];
		
		this.render(data);
		if (this.show_play_time) this.counter.html(this.play_index);
		
		this.play_index++;
		this.play_index_offset_initial = -1;
	},
	
	render: function(data){
		this.img.data.set(data);
		this.c.putData(this.img);
	},
	
	clear: function(){
		this.img = this.c.createData(this.width, this.height);
	}
};
