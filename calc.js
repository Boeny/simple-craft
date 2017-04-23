var calc = {
	initialized: false,
	outer_mult: 0.1,
	step: 10,
	index: 0,
	
	init: function(params){
		this.outer_grav = vget(params.width/2, params.height/2 + 10000);
		
		var _data = {
			index: 0,
			frames: frames,
			bar_step: step,
		};
		
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
	
	step: function(params){
		if (!this.initialized) return this.init();
		
	},
};

module.exports = function(params){
	return calc.step(params);
};
