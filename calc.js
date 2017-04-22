var calc = {
	initialized: false,
	outer_mult: 0.1,
	
	init: function(params){
		this.outer_grav = vget(params.width/2, params.height/2 + 10000);
	},
	
	step: function(params){
		if (!this.initialized) return this.init();
		
	},
};

module.exports = function(params){
	return calc.step(params);
};
