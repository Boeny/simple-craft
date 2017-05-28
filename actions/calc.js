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
	points_count: 2000,
	radius: 100,
	
	mass: 0,
	collision_distance: 1.5,
	temp_color_inc: 30,
	outer_mult: 0.0005,
	
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
		//this.outer_grav = vget(0,10);
		this.outer_grav_center = vcopy(this.size2);
		
		var p;
		
		for (var i=0; i<this.points_count; i++){
			p = randomInCircle(this.size2.x, this.size2.y, this.radius, true);// as float
			
			this.points.push({
				x: p.x,
				y: p.y,
				speed: vuno(0),//vset(vort(vsub(p, this.size2, true), 1, true), random(-1,3), true),//
				restore: 0.8
			});
			
			this.setFramePoint(p);
		}
		
		/*for (i=0; i<this.size.x; i++){
			this.points.push({
				x: i,
				y: this.size.y - 1,
				speed: vuno(0),
				fixed: true
			});
			this.setFramePoint(p);
		}*/
		
		this.plains = [
			{x:0, y:-1, l:this.size.y, restore: 0.8},
			{x:1, y:0, l:0, restore: 1},
			{x:-1, y:0, l:this.size.x, restore: 1}
		];
	},
	
	addOuterGrav: function(p){
		if (!this.outer_mult || p.fixed) return;
		
		if (this.outer_grav){
			vadd(p.speed, vmult(this.outer_grav, this.outer_mult, true));
		}
		
		if (this.outer_grav_center){
			var d = vsub(this.outer_grav_center, p, true);
			var l = vlen(d);
			
			if (l < this.collision_distance) return;
			
			var count = 0;
			
			for (var i=0; i<this.points_count; i++){
				if (vlen(vsub(this.points[i], this.outer_grav_center, true)) < l) count++;
			}
			
			vmult(d, count*this.outer_mult/l);
			vadd(p.speed, d);
			//vsub(this.light.speed, this.mass/l);
		}
	},
	
	pointsCollision: function(i, p){
		//var repulse = this.collision_distance * 0.1;
		//var em = 0.1;
		//var speed = vlen(p.speed);
		var n, l, d;
		
		for (var j=i+1; j<this.points.length; j++){
			p2 = this.points[j];
			
			n = vsub(p, p2, true);// repulse direction
			l = vlen(n);
			
			//if (l > this.collision_distance && l < 10){
			//	vsub(p.speed, vmult(n, em/l, true));// attraction direction
			//}
			
			if (l < this.collision_distance)
			{
				d = vdot(p.speed, n);
				
				if (d < 0){
					l = (p2.restore + p.restore)/2;
					
					vadd(p, vset(n, this.collision_distance-l, true));
					vsub(p.speed, vmult(n, d * l, true));
					
					vmult(n, -1);
					vsub(p2.speed, vmult(n, vdot(p2.speed, n) * l, true));
				}
			}
		}
	},
	
	plainsCollision: function(p){
		var d, l, n;
		
		for (var i=0; i<this.plains.length; i++){
			n = this.plains[i];
			d = vdot(p.speed, n);
			l = vdot(p, n) + n.l;
			
			if (l < this.collision_distance && d < 0){
				vadd(p, vset(n, this.collision_distance-l, true));
				vsub(p.speed, vmult(n, d * (n.restore + p.restore), true));
			}
		}
	},
	
	process: function(bOld, old, bRender){
		var p;
		
		for (var i=0; i<this.points.length; i++){
			p = this.points[i];
			this.addOuterGrav(p);
			
			if (bOld) old[i] = image.getIndex(p);
			
			vadd(p, p.speed);
		}
		
		for (var i=0; i<this.points.length; i++){
			p = this.points[i];
			this.pointsCollision(i, p);
			this.plainsCollision(p);
		}
		
		if (!bRender) return;
		
		for (var i=0; i<this.points.length; i++){
			this.setFramePoint(this.points[i], old[i]);
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
