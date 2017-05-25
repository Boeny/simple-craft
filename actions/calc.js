/**
 * Module calculates the points' positions on every request
 */
//var Light = require(MODULES+'/light');
var image = require(MODULES+'/image');

module.exports = {
	data: null,
	buffer: null,
	count: 2,// of the frames generated by the single request
	
	points: [],
	points_count: 1000,
	radius: 50,
	
	mass: 0,
	collision_distance: 3,
	temp_color_inc: 30,
	outer_mult: 0.005,
	
	// main process
	step: function(){
		//var result = {data: []};
		
		if (!__server.POST || !obj_length(__server.POST))
		{
			/*for (var i=0; i<this.count; i++){
				this.process();
				result.data.push(this.data);
			}*/
			
			var old = {};
			this.process(true, old);// fill old
			
			for (var i=0; i<this.count-2; i++){
				this.process();
			}
			this.process(false, old, true);// render
		}
		else{
			this.init();
			this.initialProcess();
			//result.data.push(this.data);
			//result.light_map = this.light.map;
		}
		
		return Buffer.from(this.buffer);
	},
	
	init: function(){
		var params = __server.POST;
		
		this.size = vget(params.width >> 0, params.height >> 0);// round
		this.size2 = vget(this.size.x >> 1, this.size.y >> 1);// / 2
		if (!this.radius) this.radius = Math.min(this.size2.x >> 1, this.size2.y >> 1);// / 2
		
		//this.light = new Light(this.size);
		image.size = this.size;
	},
	initialProcess: function(){
		this.points = [];
		this.buffer = new ArrayBuffer((this.size.x * this.size.y) << 2);// * 4
		this.data = new Uint32Array(this.buffer);
		
		//this.light.setCoo(vuno(0));
		this.outer_grav = vget(0,10);
		
		var p;
		
		for (var i=0; i<this.points_count; i++){
			p = randomInCircle(this.size2.x, this.size2.y, this.radius, true);// as float
			
			this.points.push({
				x: p.x,
				y: p.y,
				speed: vuno(0)
			});
			
			this.setFramePoint(p);
		}
		
		this.plains = [
			{x:0, y:-this.size.y, l:this.size.y}
		];
	},
	
	addOuterGrav: function(p){
		if (!this.outer_mult || p.fixed) return;
		
		vadd(p.speed, vmult(this.outer_grav, this.outer_mult, true));
		
		return;
		
		var d = vsub(this.outer_grav, p, true);
		var l = vlen(d);
		
		if (l < this.collision_distance) return;
		
		vmult(d, this.outer_mult/l);
		vadd(p.speed, d);
		//vsub(this.light.speed, this.mass/l);
	},
	
	process: function(bOld, old, bRender){
		var p, p2, l, d, tmp;
		var repulse = this.collision_distance * 0.1;
		var em = 0.1;
		var speed;
		
		for (var i=0; i<this.points_count; i++){
			p = this.points[i];
			this.addOuterGrav(p);
			
			if (p.fixed || !image.inScr(p)) continue;
			if (bOld) old[i] = image.getIndex(p);
			
			speed = vlen(p.speed);
			
			for (var j=i+1; j<this.points.length; j++){
				p2 = this.points[j];
				
				d = vsub(p, p2, true);// repulse direction
				l = vlen(d);
				
				/*if (l > this.collision_distance && l < 10){
					vsub(p.speed, vmult(d, em/l, true));// attraction direction
				}*/
				
				/*if (l < this.collision_distance || l < speed){
					vadd(p.speed, vmult(d, repulse/(l*l), true));
				}*/
			}
			
			for (var k=0; k<this.plains.length; k++){
				p2 = this.plains[k];
				d = p.speed.x*p2.x + p.speed.y*p2.y;
				if (p.x*p2.x + p.y*p2.y + p2.l < 0 && d < 0){
					vsub(p.speed, vmult(p2, d << 1, true));
				}
			}
		}
		
		for (var i=0; i<this.points.length; i++){
			p = this.points[i];
			vadd(p, p.speed);
			if (bRender) this.setFramePoint(p, old[i]);
		}
		//this.light.move();
	},
	
	// with color of temperature
	setFramePoint: function(p, old_index){
		p = image.roundCoo(p, true);
		
		var index = p.y * this.size.x + p.x;
		if (old_index > -1 && old_index != index) this.data[old_index] = 0;
		
		if (!image.inScr(p)) return;
		
		var c = this.data[index];
		
		if (c > 0 && old_index!=index){
			c += this.temp_color_inc;// red
			if (c > 0xFF0000FF) c = 0xFF0000FF;
		}
		
		/*else{
			image.setColor(this.data, p, c);
			this.light.apply(this.data, p);
		}*/
		
		this.data[index] = c || 0xFF000000;// 4 bytes (a,b,g,r)
	},
	clearFramePoint: function(p){
		var index = image.getIndex(p);
		if (index > -1) this.data[index] = 0;
	},
	
	tail: 1,// px
	setTail: function(){
 		if (!this.tail || !this.history.length) return;
 		
		var old, opacity;
		var step = Math.round(255/this.tail);
		var i = 0;
		var c;
		
		do {
			old = this.history[t];
			opacity = i*step;
			
			for (var y in old)
			for (var x in old[+y]){
				x = +x;
				y = +y;
				
				if (!this.data[y] || !this.data[y][x])
				{
					check_obj(this.data, y, {});
					c = this.c.getColorAt(this.img, x, y);
					this.data[y][x] = {r: c.r, g: c.g, b: c.b, a: opacity};
				}
			}
			
			i++;
			t++;
		}
		while(t < index);
 	}
};
