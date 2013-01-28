var Sprite = function(arg) {
    if(!arg || (!arg.hasOwnProperty("parts") && !arg.hasOwnProperty("anim"))) {
    //if(!arg || !arg.hasOwnProperty("parts")) {
        throw new Error("Sprite: no arg, no dice.");
    }
    
    this.parts  = (arg.parts)  ? arg.parts  : [];
    this.anim   = (arg.anim)   ? arg.anim   : {};
    this.scale  = (arg.scale)  ? arg.scale  : 1;
    this.scaleX = (arg.scaleX) ? arg.scaleX : arg.scale;
    this.scaleY = (arg.scaleY) ? arg.scaleY : arg.scale;
    this.flipY  = (arg.flipY)  ? arg.flipY  : true;
    this.flipX  = (arg.flipX)  ? arg.flipX  : true;
    this.x      = (arg.x)      ? arg.x      : 0;
    this.y      = (arg.y)      ? arg.y      : 0;
    this.angle  = (arg.angle)  ? arg.angle  : null;
    this.color  = (arg.color)  ? arg.color  : "lime";
 
    //-- init anim required vars   
    if(this.hasMembers(this.anim)) {
        this.hasAnim = true;
        
        for(var i in this.anim) {
            this.anim[i].frames    = this.anim[i].frames   || [];
            this.anim[i].hasFrames = (this.anim[i].frames.length > 0) ? true : false; // stop here?
            this.anim[i].ptr       = this.anim[i].ptr      || 0; // frame pointer
            this.anim[i].ctr       = this.anim[i].ctr      || 0; // current frame counter
            this.anim[i].on        = this.anim[i].on       || false;
            this.anim[i].scale     = this.anim[i].scale    || 1;
            this.anim[i].scaleX    = this.anim[i].scaleX   || this.anim[i].scale;
            this.anim[i].scaleY    = this.anim[i].scaleY   || this.anim[i].scale;
            this.anim[i].sequence  = this.anim[i].sequence || [];
         }
    } else {
        this.hasAnim = false;
    }
    
    // store any other attrs
    for(var i in arg) {
        this[i] = arg[i];
    }
    
    if("init" in this && typeof this.init === 'function') {
        this.init();
    }
    
    return this;
};

Sprite.prototype.hasMembers = function(obj) {
    for(var i in obj) {
        return true;
    }
    return false;
}

//-- just loops - assume context is ready
Sprite.prototype.drawCanvasParts = function(ctx, parts) {
    ctx.save();
        if(parts.length > 0) {
            for(var i=0; i<parts.length; i++) {
                ctx.beginPath();
                ctx.strokeStyle = (parts[i].color) ? parts[i].color : this.color;
                
                ctx.moveTo(
                    (this.flipX) ? -parts[i].points[0] : parts[i].points[0],
                    (this.flipY) ? -parts[i].points[1] : parts[i].points[1]
                );
                for(var j=2; j<parts[i].points.length; j+=2) {
                    ctx.lineTo(
                        (this.flipX) ? -parts[i].points[j] : parts[i].points[j],
                        (this.flipY) ? -parts[i].points[j+1] : parts[i].points[j+1]
                    );
                }
                ctx.stroke();
                ctx.closePath();
            }
        }
    ctx.restore();
};

Sprite.prototype.drawCanvas = function(ctx) {
    var parts     = this.parts
    ,   lineWidth = 1/this.scale
    ,   scaleX    = this.scaleX
    ,   scaleY    = this.scaleY
    ,   i         = 0
    ,   ptr       = 0
    ,   ctr       = 0
    ;
    
    
    //-- currently normal sprite parts only have one scale
    ctx.save();
        ctx.lineWidth = lineWidth;
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        (this.angle) ? ctx.rotate(this.angle) : null;
    
        //-- normal sprite parts
        this.drawCanvasParts(ctx, parts);
    
        //-- animations
        if(this.hasAnim) {
            ctx.save();
                //ctx.translate(this.x, this.y);
            //(this.angle) ? ctx.rotate(this.angle) : null;
    
                //-- service each animation
                for(i in this.anim) {
                    ptr = this.anim[i].ptr;
                    ctr = this.anim[i].ctr;
                    if(this.anim[i].hasFrames && this.anim[i].on && this.anim[i].sequence[ptr]) {
    
                        this.anim[i].ctr = (this.anim[i].ctr + 1) % this.anim[i].sequence[ptr]; // subtract 1 for 1-based count? too many conditions?
                        //this.ptr += this.ptr % this.anim[i].frames.length;
    
                        //-- animation i
                        ctx.save();
                            //-- set context for this frame
                            //ctx.scale(this.anim[i].scaleX, this.anim[i].scaleY);
                            //ctx.lineWidth = (this.anim[i].scaleX > this.anim[i].scaleY) ? 1/this.anim[i].scaleX : 1/this.anim[i].scaleY;
                            this.drawCanvasParts(ctx, this.anim[i].frames[ptr].parts);
                            
                            if (ctr === 0) { // way to eliminate this?
                                this.anim[i].ptr = (this.anim[i].ptr + 1) % this.anim[i].frames.length;
                            }
    
                        ctx.restore();
                    }
                }
            ctx.restore();
        }
    ctx.restore();
};
    
 