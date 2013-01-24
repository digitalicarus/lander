function Level(canvas) {
    var padList     = [5,3,3,2,1,1].sort(function(a,b) {return Math.random() > 0.5 ? -1:1}) // random order
    ,   padSpace    = (canvas.width / padList.length)>>0
    ,   landerWidth = 20
    ,   padStart    = 0 // transient
    ,   padWidth    = 0 // transient
    ,   padIncr     = .3
    ,   padHeight   = 0 //transient
    ,   i           = 0
    ,   j           = 0
    ;
 
    
    this.pads       = [] // final reference
    this.canvas = canvas;
    this.points = Terrain.calc({
        height: canvas.height/1.6,
        swing: canvas.height/.6,
        decay: .79,
        degree: 10,
        upperBound: canvas.height-30,
        lowerBound: 90
    });
    this.terrain = Terrain.interpolate(this.points, canvas.width);
    
    // lander width is about 12px unscaled
    /**
     * install landing pads
     * 2 6x pads (width*.5*width),
     * 1 5x (width + .5*width),
     * 1 4x (width + 1*width),
     * 1 3x (width + 1.5*width),
     * 1 2x (width + 2*width),
     * 2 1x (width + 2.5*width)
     * = 8 pads
     * which take 
     */
    for(i = 0; i < padList.length; i++) {
        padWidth = (landerWidth + (landerWidth*.8) / padList[i])>>0;
        
        // pick a random location within padStart + padSpace - padWidth
        padStart = padSpace*i + (Math.random()*(padSpace-padWidth))>>0;
        padHeight = this.terrain[padStart];
        
        this.pads[i] = {score: padList[i], start: padStart, height: padHeight, width: padWidth};
        
        // "install" the pad
        for(j = padStart; j < padStart+padWidth; j++) {
            this.terrain[j] = padHeight;
        }
        
        // move padStart
        padStart = i*padSpace;
    }
    console.log(this.terrain);
}

// Check if xval is part of a 
Level.prototype.xInPad = function(x) {
    var i=0;
    for(i=0; i<this.pads.length; i++) {
        if(this.pads[i].start <= x && x <= this.pads[i].start+this.pads[i].width) {
            return this.pads[i].score;
        }
    }
    return false;
};

Level.prototype.drawCanvas = function() {
    var points = this.terrain // how much does deref cost?
    ,   ctx    = this.canvas.getContext('2d')
    ,   i      = 0
    ,   j      =0
    ;
    
    ctx.save();
    
        ctx.strokeStyle = "lime";
        ctx.fillStyle = "lime";
        ctx.beginPath();
        ctx.moveTo(0,points[0]);
        for(var i in points) {
            ctx.lineTo(i, points[i]);
        }
        ctx.stroke();

    ctx.restore();
    
    // draw pads every Nth frame
    ctx.save();
        for(i=0; i<this.pads.length; i++) {
            ctx.strokeStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(this.pads[i].start, this.pads[i].height);
            ctx.lineTo(this.pads[i].start+this.pads[i].width, this.pads[i].height);
            ctx.stroke();
            ctx.closePath();
            
            ctx.strokeStyle = "white";
            Font.drawCanvas(this.pads[i].score+"x", this.pads[i].start-8, this.pads[i].height + 15);
        }
    ctx.restore();
};
