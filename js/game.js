var canvas     = document.getElementsByTagName('canvas')[0]
,   ctx        = canvas.getContext('2d')
,   gravity    = .0004
,   suspendSound = false
,   sounds     = {
        splode: {
            ele: null,
            src: "audio/splode.ogg"
        },
        landordie: {
            ele: null,
            src: "audio/landordie.ogg"
        },
        landed: {
            ele: null,
            src: "audio/eaglelanded.ogg"
        },
        liftoff: {
            ele: null,
            src: "audio/liftoff.ogg"
        },
        beep: {
            ele: null,
            src: "audio/beep.ogg"
        },
        alert: {
            ele: null,
            src: "audio/alert.ogg"
        },
        thrust: {
            type: "loop",
            src: "audio/thrustout.ogg",
            length: 400,
            ele: null
        }
    }
,   scores     = {
        land: 50,
        crash: 5,
        crashIntoPad: 10
    }
,   totalScore = 0
,   i          = 0
;


for(i in sounds) {
    if(!sounds[i].type || sounds[i].type !== "loop") {
        sounds[i].ele = new Audio(sounds[i].src);
        sounds[i].ele.playSound = function() {if(!suspendSound){this.play()}};
        sounds[i].ele.setVolume = function(vol) {this.volume = vol;};
        document.body.appendChild(sounds[i].ele);
        
    } else if(sounds[i].type && sounds[i].type === "loop") {
        //console.log(i);
        // TODO: refactor into one sound lib
        sounds[i].ele = new SeamlessLoop();
        sounds[i].ele.addUri(sounds[i].src, sounds[i].length, i);
        sounds[i].ele.name = i;
        sounds[i].ele.setVolume = function(vol) {this._setVolume(vol, this.name);};
        sounds[i].ele.playSound  = function(){ if(!this.playing && !suspendSound){ this.playing = true; this.start(this.name); }}; 
        sounds[i].ele.pause = function() { try{this.playing = false; this.stop();}catch(e){} };
        sounds[i].ele.callback(function() { this.loaded = true;});
    }
}

canvas.style.background = "#000";
canvas.width = 640;
canvas.height = 480;
ctx.imageSmoothingEnabled = false;


var level  = new Level(canvas);
//var lander = new Sprite(landerSpec);
var lander = new Lander();

// TODO: move this into an init function and enable initting in Sprite
Keys.on('a', function() {lander.rotateLeft.apply(lander)});
Keys.on('left', function() {lander.rotateLeft.apply(lander)});
Keys.on('d', function() {lander.rotateRight.apply(lander)});
Keys.on('right', function() {lander.rotateRight.apply(lander)});
Keys.on(' ', function() {lander.thrustUp.apply(lander)});
Keys.off(' ', function() {lander.thrustDown.apply(lander)});


Wee.setRender(function() {
    var i    = 0
    ,   xtmp = 0
    ,   ytmp = 0
    ,   pnt  = {}
    ;
    
    // clear
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.save();
    
    // draw terrain
    // TODO: zoom draw conditions
    level.drawCanvas();

    // input handlers
    // TODO: move this into Wee
    Keys.run();
    
    // lander physics
    lander.update();
    

    
    // draw lander
    lander.drawCanvas(ctx);
    
    // todo collision / success / zoom detection
/*    ctx.save();
    ctx.fillStyle = "yellow";
    for(i = 0; i < lander.hitbox.length; i+=2) {
        xtmp = lander.hitbox[i]; // unrotated
        ytmp = lander.hitbox[i+1]; // unrotated
        pnt.x = xtmp*Math.cos(lander.angle) - ytmp*(Math.sin(lander.angle));
        pnt.y = xtmp*Math.sin(lander.angle) + ytmp*(Math.cos(lander.angle));
        pnt.x = (-lander.scale*pnt.x + lander.x);
        pnt.y = (-lander.scale*pnt.y + lander.y);
        ctx.beginPath();
        ctx.fillRect(pnt.x-1, pnt.y-1, 2, 2);
        ctx.stroke();
        ctx.closePath;
*/      
/*        if(pnt.y >= level.terrain[pnt.x]) {
            lander.sploding = true;
        }
    }
    ctx.restore();
*/      
 
    ctx.save();  
    if(lander.sploding) {
        ctx.fillStyle = "#600";
        ctx.fillRect(190, 200, 270, 50);
        Font.drawCanvas("Sinistar hears your screams", 190, 230);
        sounds.thrust.ele.pause();
    } else if (lander.landed) {
        ctx.fillStyle = "#060";
        ctx.fillRect(190, 200, 270, 50);
        Font.drawCanvas("      A winner is you!     ", 190, 230);
        sounds.thrust.ele.pause();
    } else {
        // coming in too fast
        if(lander.altitude < 60 && lander.speed > .1) {
            sounds.beep.ele.playSound();
            ctx.fillStyle = "#600";
            ctx.fillRect(20, canvas.height-40, 100, 30);
            Font.drawCanvas("too fast!", 20, canvas.height-20);
        }
        if(lander.thrust*100 > 05) {
            sounds.thrust.ele.setVolume(lander.thrust);
            if(sounds.thrust.ele.loaded){sounds.thrust.ele.playSound();}
        } else {
            if(sounds.thrust.ele.loaded && sounds.thrust.ele.playing){ sounds.thrust.ele.pause();}
        }
    
        if(lander.fuel < 50 && lander.fuel > 45) {
            sounds.alert.ele.playSound();
            ctx.fillStyle = "#600";
            ctx.fillRect(20, canvas.height-40, 100, 30);
            Font.drawCanvas("low fuel!", 20, canvas.height-20);
        }
        
        if((lander.x < -5 || lander.x > canvas.width + 5) || (lander.y < -5)) {
            ctx.fillStyle = "#b20";
            ctx.fillRect(190, 200, 270, 50);
            Font.drawCanvas("   Escaped with "+(lander.fuel>>0).toString()+" fuel", 190, 230);
            lander.escaped = true;
            sounds.thrust.ele.pause();
            sounds.liftoff.ele.playSound();
            suspendSound = true;
        }
    }
    ctx.restore();  
    
    // HUD
    Font.drawCanvas("velocity", 5, 25);
    Font.drawCanvas((lander.speed*100).toString().substring(0,6),90,25);
    
    Font.drawCanvas("angle", 5, 45);
    Font.drawCanvas(((lander.angle/Math.PI)*180>>0).toString()+"^", 90, 45);

    Font.drawCanvas("thrust", 5, 65);
    Font.drawCanvas((lander.thrust*100>>0).toString()+"%", 90, 65);

    Font.drawCanvas("fuel", 5, 85);
    Font.drawCanvas((lander.fuel>>0).toString(), 90, 85);
    
    Font.drawCanvas("altitude", canvas.width - 205, 25);
    Font.drawCanvas(lander.altitude.toString(), canvas.width - 90, 25);
    
    Font.drawCanvas("horiz speed", canvas.width - 205, 45);
    Font.drawCanvas(((lander.speedX>=0)? '<left>':'<right>')+' '+(Math.abs(lander.speedX*100)).toString().substring(0,6), canvas.width - 90, 45);
    
    Font.drawCanvas("vert  speed", canvas.width - 205, 65);
    Font.drawCanvas(((lander.speedY>=0)? '<up>':'<down>')+' '+(Math.abs(lander.speedY*100)).toString().substring(0,6), canvas.width - 90, 65);
    
    Font.drawCanvas((Wee.rate()>>0)+" FPS", canvas.width-80, canvas.height-18);
    
    ctx.restore();
  
});

// TODO: move into Wee with enablement flag
window.addEventListener('blur', function(e) {
    if(!Wee.paused()) {
        console.log('pause');
        for(i in sounds) {
            try {
            sounds[i].ele.pause();
            } catch(e) {};
        }
        Wee.pause();
    }
}, false);
window.addEventListener('focus', function(e) {
    if(Wee.paused()) {
        console.log('resume');
        Wee.start();
    }
}, false);

//load audio and start
sounds.landordie.ele.playSound();
Wee.start();
