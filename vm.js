var App = function(elem){
	this.c = new Canvas(elem);
	this.width = this.c.DOM.width;
	this.height = this.c.DOM.height;
};

App.prototype = {
	run: function(){
		this.update();
		this.render();
	},
	stop: function(){
		clearInterval(this.timer);
	},
	
	//--------------------------
	
	start: function(){
		this.data = this.c.createData(this.width, this.height);
		this.setPoint(this.width/2, this.height/2, 255,0,0);
		this.setRandomPoints(1000);
		this.apply();
	},
	
	setPoint: function(x,y, r,g,b,a){
		this.x = x;
		this.y = y;
		this.color(r,g,b,a);
	},
	setRandomPoints: function(count){
		this.points = [];
		
		iterate(count, () => {
			this.setPoint(random(this.width), random(this.height));
			
			this.points.push({
				x: this.x,
				y: this.y
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
	
	update: function(){
		var l, dx, dy, m = 0.05;
		
		foreach(this.points, (p,i) => {
			this.setPoint(p.x,p.y, 0,0,0,0);
			
			foreach(this.points, (p2,j) => {
				if (i === j) return;
				
				dx = p2.x - p.x;
				dy = p2.y - p.y;
				
				l = Math.sqrt(dx*dx + dy*dy);
				
				p.x += m*dx/l;
				p.y += m*dy/l;
			});
			
			this.setPoint(p.x,p.y);
		});
	},
	
	render: function(){
		this.apply();
	}
};

$(function(){
	var app = new App('#canvas');
	app.start();
	
	$(document).on('click', '#canvas', function(){app.stop()});
	
	app.timer = setInterval(function(){app.run()}, 100);
});
