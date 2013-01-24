// Ewww globals ... esp level, that's nasty... better fix these later
/*global canvas:true,gravity:true,Wee:true,Sprite:true,level:true*/
function Lander(arg) {
    arg = arg || {};
    var twoPi = Math.PI*2;
    
    // nothing to hide
    this.scale       = (arg.scale)      ? arg.scale    : 2;
    this.angle       = (arg.angle)      ? arg.angle    : 0;
    this.gravity     = (arg.gravity)    ? arg.gravity  : gravity || .0004;
    this.landed      = (arg.landed)     ? arg.landed   : false;
    this.sploding    = (arg.sploding)   ? arg.sploding : false;
    this.escaped     = (arg.escaped)    ? arg.escaped  : false;
    this.x           = (arg.x)          ? arg.x        : (canvas.width/2)>>0;
    this.y           = (arg.y)          ? arg.y        : 20;
    this.accY        = (arg.accY)       ? arg.accY     : 0;
    this.accX        = (arg.accX)       ? arg.accX     : 0;
    
    // could be used for different "models"?
    this.thrustIncr  = (arg.thrustIncr)  ? arg.thrustIncr  : .01;
    this.thrustDecr  = (arg.thrustDecr)  ? arg.thrustDecr  : .05;
    this.thrustMax   = (arg.thrustMax)   ? arg.thrustMax   : 1;
    this.thrustMod   = (arg.thrustMod)   ? arg.thrustMod   : .00086;
    this.fuel        = (arg.fuel)        ? arg.fuel        : 1000;
    this.fuelEff     = (arg.fuelEff)     ? arg.fuelEff     : 1/10;    
    this.rotateSpeed = (arg.rotateSpeed) ? arg.rotateSpeed : twoPi/320;
    
    // purely calculated/derived values and constants
    this.speed       = 0;
    this.speedX      = 0;
    this.speedY      = 0;
    this.altitude    = 0;
    this.thrust      = 0;
    
    
    this.hitbox = [-3,6,-1,7,1,7,3,6,3,0,5,-4,0,-3,-5,-4,-3,0];
    this.parts  = [
        {
            //head
            points: [-1,2,-3,3,-3,6,-1,7,1,7,3,6,3,3,1,2,-1,2],
            color: "#F00" 
        },
        {
            //body
            points: [-3,2,3,2,3,-1,-3,-1,-3,2]
        },
        {
            //left leg
            points: [-3,0,-4,-2,-2,-1,-4,-2,-4,-4,-5,-4,-3,-4]
        },
        {
            //right leg
            points: [3,0,4,-2,2,-1,4,-2,4,-4,5,-4,3,-4]
        },
        {
            //thrust skirt
            points: [0,-1,-2,-3,2,-3,0,-1]
        }
    ];
    this.anim = {
        thrust: {
            frames: [{
                parts: [{
                    points: [-2,-3,0,-6,2,-3],
                    color: "#FFF"
                }]
            },
            {
                parts: [{
                    points: []
                }]
            }],
            sequence: [4, 3]
        }
    };
    this.rotateRight = function() {
        if(Wee.paused()) { return; }
        this.angle = (this.angle+this.rotateSpeed)%(twoPi);
    };
    this.rotateLeft = function() {
        if(Wee.paused()) { return; }
        this.angle = (this.angle-this.rotateSpeed)%(twoPi);
    };
    this.thrustUp = function() {
        if(Wee.paused()) { return; }
        if (this.fuel > 0.05) {
            if (!Wee.paused() && this.thrust + this.thrustIncr <= this.thrustMax) {
                this.thrust += this.thrustIncr;
            }
        } else {
            this.thrustDown();
        }
    };
    this.thrustDown = function() {
        if(Wee.paused()) { return; }
        if (!Wee.paused() && this.thrust - this.thrustDecr >= 0) {
            this.thrust -= this.thrustDecr;
        }
    };
    this.update = function() {
        if(this.sploding || this.escaped) {
            this.anim.thrust.on = false;
            this.thrust = 0;
            return;
        }
        if(this.landed) {
            this.anim.thrust.on = false;
            this.thrust = 0;
            this.angle = 0;
            return;
        }
        var newX  = lander.x
        ,   newY  = lander.y
        ,   xtmp  = 0
        ,   ytmp  = 0
        ,   pnt   = {}
        ,   score = false
        ;

        this.accY = (this.accY + this.gravity + (Math.sin(this.angle-Math.PI/2) * this.thrust * this.thrustMod));
        this.accX += (Math.cos(this.angle-Math.PI/2) * this.thrust * this.thrustMod);
        this.fuel -= this.thrust * this.fuelEff;
    
        if(this.thrust*100 > 05) {
            this.anim.thrust.on = true;
            this.anim.thrust.frames[0].parts[0].points[3] = (-this.thrust * 35 < -6) ? -this.thrust*35: -6;
        } else {
            this.anim.thrust.on = false;
        }
        
        this.altitude = (level.terrain[(this.x)>>0] - (this.y)>>0)
        
        newX += this.accX;
        newY += this.accY;
        
        // check for success/death
        if(!this.sploding && !this.landed) {
        for(i = 0; i < this.hitbox.length; i+=2) {
            xtmp = this.hitbox[i]; // unrotated
            ytmp = this.hitbox[i+1]; // unrotated
            pnt.x = xtmp*Math.cos(this.angle) - ytmp*(Math.sin(this.angle));
            pnt.y = xtmp*Math.sin(this.angle) + ytmp*(Math.cos(this.angle));
            pnt.x = (-this.scale*pnt.x + newX)>>0;
            pnt.y = (-this.scale*pnt.y + newY)>>0;
            
            if(pnt.y >= level.terrain[pnt.x]) {
                score = level.xInPad(pnt.x);
                // winner! -- TODO: check both legs in pad
                if(score && Math.abs(this.angle) < .1 && Math.abs(this.speed) < .1) {
                    this.landed = true;
                    sounds.landed.ele.playSound();
                    totalScore += scores.land * score;
                } else {
                    this.sploding = true;
                    sounds.splode.ele.playSound();
                    totalScore += scores.crash;
                }
            }
        }
        }
        
        if(this.landed) {
        } else if (this.sploding) {
            
        } else {
            this.speedX = ((this.x - newX));       
            this.speedY = ((this.y - newY));
            this.speed = (Math.sqrt(this.speedX*this.speedX+this.speedY*this.speedY));
            this.y = newY;
            this.x = newX;
        } 
 
    }; // end this.update

    // poor mans inheritance
    return new Sprite(this);
}