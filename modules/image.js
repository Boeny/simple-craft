module.exports = {
	roundCoo: function(p, ret){
		if (ret) return vget(p.x >> 0, p.y >> 0);
		
		p.x = p.x >> 0;
		p.y = p.y >> 0;
	},
	
	isPoint: function(data, p){
		return this.getColor(data, p) > 0;// 0x...XY
	},
	
	inScrAll: function(arr){
		for (var i=0; i<arr.length; i++){
			if (!this.inScr(arr[i])) return false;
		}
		return true;
	},
	inScr: function(p){
		return in_range(p.x, 0, this.size.x) && in_range(p.y, 0, this.size.y);
	},
	
	getColor: function(data, p){
		return data[(p.y * this.size.x + p.x) >> 0];
	},
	setColor: function(data, p, c){
		data[(p.y * this.size.x + p.x) >> 0] = c || 0x000000FF;// 0,0,0,255 (r,g,b,a)
	}
};
