var App = function(elem){
	this.c = new Canvas({elem: $(elem), render: true});
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
	physics: function(){
		
	},
	render: function(){
		
	},
	
	//--------------------------
	
	start: function(){
		this.c.canvas.width = 640;
		this.c.canvas.height = 480;
		
		this.data = this.c.createData(640, 480);
		this.c.setColorAt(this.data, 100,100);
		this.c.putData(this.data, 0, 0);
		
		console.log(this.c.canvas.width+', '+this.c.canvas.height);
		//this.p = this.c.createPixel();
		//this.c.putData(this.p, 100, 100);
	},
	
	update: function(){
		//this.p.data[0] = 255;
		//this.c.putData(this.p, 200, 200);
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
	var app = new App('#canvas');
	app.start();
	//setInterval(function(){app.run()}, 40);
});
