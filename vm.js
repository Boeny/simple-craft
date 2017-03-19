var Cell = function(selector){
	this.DOM = $(selector);
	this.html = h.div(this.DOM.html(), {'class': this.DOM[0].className});
};
Cell.prototype = {
	max_width: 52,
	getWidth: function(){
		return this.DOM.width();
	},
	setWidth: function(w){
		this.DOM.width(w);
	},
	
	Grow: function(){
		var width = this.getWidth();
		this.setWidth(width + 1);
		
		if (width > this.max_width*2){
			this.setWidth(this.max_width);
			
			var elem = $(this.html);
			this.DOM.after(elem);
			addCell(elem);
		}
	},
	Mutate: function(){
		this.DOM.css({
			background: 'rgb('+random(255)+','+random(255)+','+random(255)+')',
			color: 'rgb('+random(255)+','+random(255)+','+random(255)+')',
			display: ['block','inline-block'][random(1)],
			'text-align': ['left','center','right'][random(2)],
			'line-height': random(4)
		});
	}
};

window.cells = [];

function stopGrow(){
	for (var i in cells){
		clearInterval(cells[i].growInterval);
	}
}

function initGrow(){
	$('.app').children().each(function(){
		addCell(this);
	});
}

function addCell(elem){
	var c = new Cell(elem);
	//c.Mutate();
	c.growInterval = setInterval(function(){c.Grow()}, 100);
	cells.push(c);
}

$(function(){
	initGrow();
});