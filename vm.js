$(function(){
	var c = new Canvas({elem: $('#canvas'), color: '#333', width: 3, render: true});
	
	var img = c.canvas.getImageData(0,0, 100, 100);
	
	iterate(10, function(i){
		img.data[random(10000)] = 0;
	})
	
	c.canvas.putImageData(img,0,0);
});
