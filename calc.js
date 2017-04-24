var calc = {
	initialized: false,
	outer_mult: 0.1,
	step: 10,
	index: 0,
	points: [],
	points_count: 300,
	radius: 30,
	mass: 0,//0.000005,
	
	tail: 10,// px
	collision_distance: 0.5,
	temp_color_inc: 50,
	
	init: function(params){
		this.width = params.width;
		this.height = params.height;
		
		var w2 = this.width/2;
		var h2 = this.height/2;
		this.outer_grav = vget(w2, h2 + 10000);
		
		var r = this.radius || Math.min(w2/2,h2/2);
		var cy = this.height - r;
		var v;
		
		iterate(count, () => {
			v = randomInCircle(w2, cy, r, true);// as float
			
			this.c.setColorAt(data, Math.round(v.x), Math.round(v.y));
			
			this.points.push({
				x: v.x,
				y: v.y,
				speed: vuno(0)
			});
		});
		
		return this.copyPoints();
	},
	
	step: function(params){
		if (!this.initialized) return this.init();
		
		this.process();
		
		return this.copyPoints(this.index++);
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
 		
		var old, opacity;
		var step = Math.round(255/this.tail);
		var t = frame - this.tail;
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
		while(t < frame);
 	}
};

module.exports = function(params){
	return calc.step(params);
};
