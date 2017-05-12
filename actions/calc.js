/**
 * Module calculates the points' positions on every request
 */
//var Light = require(MODULES+'/light');
var image = require(MODULES+'/image');

module.exports = {
	data: {},
	count: 1,// of the frames generated by the single request
	
	points: [],
	points_count: 2,
	radius: 100,
	
	mass: 0.00005,
	collision_distance: 0.5,
	temp_color_inc: 50,
	outer_mult: 0,// 0.0001,
	
	// main process
	step: function(){
		//var result = {data: []};
		
		if (!__server.POST || !obj_length(__server.POST))
		{
			/*for (var i=0; i<this.count; i++){
				this.process();
				result.data.push(this.data);
			}*/
			this.process();
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
		//this.outer_grav = this.light.getCoo();
		
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
	},
	
	addOuterGrav: function(p){
		if (!this.outer_mult) return;
		
		var d = vsub(this.outer_grav, p, true);
		var l = vlen(d);
		
		if (l < this.collision_distance) return;
		
		vmult(d, this.outer_mult/l);
		vadd(p.speed, d);
		//vsub(this.light.speed, this.mass/l);
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
			
			this.setFramePoint(p);
		}
		
		//this.light.move();
	},
	
	// with color of temperature
	setFramePoint: function(p){
		if (!image.inScr(p)) return;
		
		var index = (p.y * this.size.x + p.x) >> 0;// round
		var c = this.data[index];
		
		if (c > 0) c += this.temp_color_inc;// red
		
		//else{
			//image.setColor(this.data, p, c);
			//this.light.apply(this.data, p);
		//}
		
		this.data[index] = c || 0xFF000000;// 4 bytes (a,b,g,r)
		
		//this.setTail(this.calc_index, result);
	},
	
	tail: 0,// px
	setTail: function(index){
 		if (!this.tail || !index) return;
 		
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
