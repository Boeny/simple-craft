var App = function(elem,w,h){
	this.c = new Canvas({elem: $(elem), render: true});
	this.width = this.c.canvas.width = w || 300;
	this.height = this.c.canvas.height = h || 300;
};
App.prototype = {
	run: function(){
		this.update();
		
		this.beforePhysics();
		this.physics();
		this.afterPhysics();
		
		this.beforeRender();
		this.render();
		this.afterRender();
	},
	stop: function(){
		clearInterval(this.timer);
	},
	physics: function(){
		
	},
	render: function(){
		
	},
	
	//--------------------------
	
	start: function(){
		this.data = this.c.createData(this.width, this.height);
		this.setRandomPoints(100);
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
			this.x = random(1, this.width - 1);
			this.y = random(1, this.height - 1);
			this.points.push({
				x: this.x,
				y: this.y
			});
			this.color();
		});
	},

	color: function(r,g,b,a){
		this.c.setColorAt(this.data, this.x,this.y, r,g,b,a);
	},
	apply: function(){
		this.c.putData(this.data, 0,0);
	},
	
	update: function(){
		if (this.x >= this.width-1) this.stop();
		this.color(0,0,0,0);
		this.x++;
		this.color();
		this.apply();
	},
	
	beforePhysics: function(){
		
	},
	afterPhysics: function(){
		
	},
	
	beforeRender: function(){
		
	},
	afterRender: function(){
		
	}
};

$(function(){
	var app = new App('#canvas',600,600);
	app.start();
	//app.timer = setInterval(function(){app.run()}, 40);
});
