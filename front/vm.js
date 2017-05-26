module.exports = function(params){
	this.renderer = params.renderer;
	this.clear();
};

module.exports.prototype = {
	frames_count: 1000,
	history: [],
	play_index: 0,
	
	//------------------------
	stop: function(){
		this.timer = false;
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
		this.renderer.createSender(data, () => {
			this.calc_index++;
			
			if (!this.play_index && this.calc_index < this.frames_count)
			{
				var result = this.renderer.sender.response;
				result = new Uint8ClampedArray(result);
				
				this.history.push(result);// save the frame
				
				this.renderer.nextFrame(() => {this.render(result)});
				this.renderer.updateProgress(this.calc_index, this.frames_count);
				this.renderer.send();
			}
			else{
				this.stopCalc();
			}
		});
	},
	
	stopCalc: function(){
		this.play_index = 1;
		this.clear();
		this.renderer.readyForPlaying();
	},
	
	//-----------------------------------------------------
	play_index_offset_initial: -1,
	play_index_offset: 2,
	show_play_time: false,
	
	update: function(){
		if (!this.timer || this.play_index >= this.history.length) return;
		this.renderer.nextFrame(() => {this.update()});
		
		this.play_index_offset_initial++;
		if (this.play_index_offset_initial < this.play_index_offset) return;
		
		var data = this.history[this.play_index];
		
		this.render(data);
		if (this.show_play_time) this.renderer.updateCounter(this.play_index);
		
		this.play_index++;
		this.play_index_offset_initial = -1;
	},
	
	render: function(data){
		this.img.data.set(data);
		this.renderer.render(this.img);
	},
	
	clear: function(){
		this.img = this.renderer.createData();
	}
};
