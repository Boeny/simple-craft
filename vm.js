var App = function(elem){
	this.c = new Canvas(elem);

	this.c.DOM.width = this.width = $(window).width();
	this.c.DOM.height = this.height = $(window).height();
};

App.prototype = {
	run: function(){
		this.update();
		this.render();
	},
	stop: function(){
		if (!this.timer) return;
		clearInterval(this.timer);
		this.timer = null;
	},
	
	//--------------------------
	
	start: function(){
		this.data = this.c.createData(this.width, this.height);
		this.setPoint(this.width/2, this.height/2, 255,0,0);
		this.setRandomPoints(200);
		this.apply();
	},
	
	setPoint: function(x,y, r,g,b,a){
		this.x = x;
		this.y = y;
		this.color(r,g,b,a);
	},
	setRandomPoints: function(count){
		this.points = [];
		var w2 = this.width/2;
		var h2 = this.height/2;
		
		iterate(count, () => {
			var v = randomInCircle(w2, h2, Math.min(w2/2,h2/2));
			this.setPoint(v.x, v.y);
			
			this.points.push({
				x: this.x,
				y: this.y,
				t: 0,
				speed: {x:0,y:0}
			});
		});
	},
	clearPoints: function(){
		foreach(this.points, (p) => {
			this.setPoint(p.x,p.y, 0,0,0,0);
		});
	},
	
	color: function(r,g,b,a){
		this.c.setColorAt(this.data, this.x,this.y, r,g,b,a);
	},
	apply: function(){
		this.c.putData(this.data);
	},
	
	getSign: function(a){
		return a < 0 ? -1 : 1;
	},
	getReflectionSpeed: function(v,t){
		return -this.getSign(v)*(Math.abs(v) - t);
	},
	update: function(){
		var p, p2, l, dx, dy, dxl, dyl;
		var q = 0.01, m = 0.0001;
		
		for (var i=0; i<this.points.length-1; i++){
			p = this.points[i];
			
			this.setPoint(p.x,p.y, 0,0,0,0);
			
			for (var j=i+1; j<this.points.length; j++){
				p2 = this.points[j];
				
				dx = p2.x - p.x;
				dy = p2.y - p.y;
				
				l = Math.sqrt(dx*dx + dy*dy);
				dxl = m*dx/l;
				dyl = m*dy/l;
				
				if (l > 2){
					p.speed.x += dxl;
					p.speed.y += dyl;
					p2.speed.x -= dxl;
					p2.speed.y -= dyl;
				}
				else {// collision
					p.speed.x = this.getReflectionSpeed(p.speed.x,q);
					p.speed.y = this.getReflectionSpeed(p.speed.y,q);
					p2.speed.x = this.getReflectionSpeed(p2.speed.x,q);
					p2.speed.y = this.getReflectionSpeed(p2.speed.y,q);
				}
				
				/*if (l < 20){
					p.speed.x -= m*dx/l;
					p.speed.y -= m*dy/l;
				}*/
			}
			
			p.x += p.speed.x;
			p.y += p.speed.y;
			this.setPoint(p.x,p.y);
		}
	},
	
	render: function(){
		this.apply();
	}
};

$(function(){
	var app = new App('#canvas');
	app.start();
	
	$(document).on('click', '#canvas', function(){app.stop()});
	
	app.timer = setInterval(function(){app.run()}, 20);
});
