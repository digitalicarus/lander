var canvas       = document.getElementsByTagName('canvas')[0]
,   body         = document.body || document.getElementsByTagName('body')[0]
,   ctx          = canvas.getContext('2d')
,   gravity      = .0004
,   suspendSound = false
,   drawHitbox   = false
,   waiting      = false
,   level        = null
,   lander       = null
,   fuelWarned   = false
,   sounds       = {
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
        anotherplace: {
            ele: null,
            src: "audio/anotherplace.ogg"
        },
        hiscore: {
            ele: null,
            src: "audio/hiscore.ogg"
        },
        ohno: {
            ele: null,
            src: "audio/ohno.ogg"
        },
        doobiedoobie: {
            ele: null,
            src: "audio/doobiedoobie.ogg"
        },
        tryagain: {
            ele: null,
            src: "audio/tryagain.ogg"
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
,   scores       = {
        land: 50,
        crash: 5,
        escape: 5,
        crashIntoPad: 10,
        surviveTime: 1,
        velocityBonus: 10
    }
,   highScore    = (window.localStorage && localStorage.getItem('landOrDieHi')) ? localStorage.getItem('landOrDieHi') : 10
,   totalScore   = 0
,   i            = 0 // global iterator
;

//canvas.style.background = "#000";
canvas.style.position = "absolute";
canvas.width = 640;
canvas.height = 480;
ctx.imageSmoothingEnabled = false;

var resize = function(evt) {
        var height = window.innerHeight || body.clientHeight
        ,   width  = window.innerWidth || body.clientWidth
        ,   scale  = (width/height > canvas.width/canvas.height) ? height / canvas.height : width / canvas.width
        ,   styles = ["mozTransform","transform","webkitTransform","OTransform","msTransform"]
        ,   i      = null
        ;
        
        for(i in styles) {
                canvas.style[styles[i]] = 'scale('+scale+')';
        }
        canvas.style.top = (canvas.height*(scale-1)>>1)+"px";
        canvas.style.left = (canvas.width*(scale-1)>>1)+((width-canvas.width*scale)>>1)+"px";
};

// TODO: Move into sound class
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


// Ready? Start-o!
window.addEventListener('resize', resize, false);

var Game = (function(){
        var ret         = {}
        ,   currentMode = "title"
        ;
        
        ret.modes = {};
        ret.setMode = function(mode) {
                if(!ret.modes.hasOwnProperty(mode)) {
                        console.log("Wat is "+mode+"?");
                        return;
                }
                if(mode === "title") {
                        for(i in sounds) {
                            try {
                                sounds[i].ele.pause();
                                sounds[i].ele.currentTime = 0;
                            } catch(e) {};
                        }
                        passedHighScore = false;
                        sounds.landordie.ele.playSound();    
                }
                if(mode === "play") {
                        totalScore = 0;
                        lander = new Lander({fuel: 500});
                        level = new Level(canvas);
                }
                currentMode = mode;
                Wee.setRender(ret.modes[currentMode]);
        };
        ret.getMode = function() {
                return currentMode;
        };
        
        ret.modes.play = function() {
                var i    = 0
                ,   xtmp = 0
                ,   ytmp = 0
                ,   pnt  = {}
                ;
                
                // clear
                ctx.clearRect(0,0,canvas.width, canvas.height);
            
                // input handlers
                // TODO: move this into Wee
                Keys.run();
                
                // lander physics
                if(!lander.sploding && !lander.landed && !lander.escaped && !waiting) {
                        lander.update();
                }
                
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
                Font.drawCanvas("score "+totalScore, 10, canvas.height-18);
                //Font.drawCanvas("score "+Wee.counter(), 10, canvas.height-18);
        
                // draw terrain
                level.drawCanvas();
                
                // draw lander
                lander.drawCanvas(ctx);
                
                // todo collision / success / zoom detection
                if(drawHitbox) {
                    ctx.save();
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
                    }
                    ctx.restore();
                }
             
                // rules, alerts, state shifts
                ctx.save();  
                if(lander.sploding) {
                    ctx.fillStyle = "#600";
                    ctx.fillRect(190, 200, 270, 50);
                    Font.drawCanvas("Sinistar hears your screams", 190, 230);
                    if(!waiting && lander.fuel > 0.9) {
                        lander.fuel = (lander.fuel - 40 > 1) ? lander.fuel-40 : 1;
                        setTimeout(function() {
                            lander = new Lander({fuel: lander.fuel});
                            sounds.tryagain.ele.play();
                            waiting = false;
                        }, 3000);
                    }
                    
                    if(lander.fuel <= 0.9) {
                        if(!waiting) {
                                setTimeout(function(){
                                        Game.setMode("title");
                                        waiting = false;
                                }, 3000);
                        }
                    }
                    waiting = true;
                    sounds.thrust.ele.pause();
                } else if (lander.landed) {
                    ctx.fillStyle = "#060";
                    ctx.fillRect(190, 200, 270, 50);
                    Font.drawCanvas("      A winner is you!     ", 190, 230);
                    setTimeout(function() {
                        lander = new Lander({fuel: lander.fuel});
                        level = new Level(canvas);
                        sounds.doobiedoobie.ele.play();
                    }, 3000);
                    sounds.thrust.ele.pause();
                } else if (lander.escaped){
                        // NOTHING!
                            ctx.fillStyle = "#b20";
                            ctx.fillRect(190, 200, 270, 50);
                            Font.drawCanvas("   Escaped with "+(lander.fuel>>0).toString()+" fuel", 190, 230);
                } else {
                        // coming in too fast
                        if(lander.altitude < 60 && lander.speed > .1) {
                            sounds.beep.ele.playSound();
                            ctx.fillStyle = "#600";
                            ctx.fillRect(canvas.width-110, canvas.height-40, 100, 30);
                            Font.drawCanvas("too fast!", canvas.width-110, canvas.height-20);
                        }
                        if(lander.thrust*100 > 05) {
                            sounds.thrust.ele.setVolume(lander.thrust);
                            if(sounds.thrust.ele.loaded){sounds.thrust.ele.playSound();}
                        } else {
                            if(sounds.thrust.ele.loaded && sounds.thrust.ele.playing){ sounds.thrust.ele.pause();}
                        }
                    
                        // low fuel
                        if(lander.fuel < 50 && lander.fuel > 45) {
                            if(!fuelWarned) {
                                sounds.alert.ele.playSound();
                                fuelWarned = true;
                            }
                            ctx.fillStyle = "#600";
                            ctx.fillRect(canvas.width-110, canvas.height-40, 100, 30);
                            Font.drawCanvas("low fuel!", canvas.width-110, canvas.height-20);
                        }
                        
                        // escaped
                        if((lander.x < -5 || lander.x > canvas.width + 5) || (lander.y < -5)) {
                        lander.escaped = true;
                            sounds.thrust.ele.pause();
                            sounds.anotherplace.ele.playSound();
                            setTimeout(function() {
                                lander = new Lander({fuel: lander.fuel});
                                level = new Level(canvas);
                                suspendSound = false;
                            }, 3000);
                            suspendSound = true;
                        }
                
                        if(Wee.counter() % 241 === 0) {
                                totalScore += scores.surviveTime;
                        }
                }
                ctx.restore();  

                if(totalScore > highScore) {
                        highScore = totalScore;
                        if(!passedHighScore) {
                                passedHighScore = true;
                                sounds.hiscore.ele.play();
                        }
                        if(window.localStorage) {
                                localStorage.setItem('landOrDieHi', highScore);
                        }
                }
        };
        
        ret.modes.title = function() {
                var title = new Sprite({
                        x: 80,
                        y: 290,
                        flipX: false,
                        scale: 23,
                        parts: [{
                                points: [0.5,9.5,2,10,2.5,6,4,7,4.5,5.5,2,5,.5,9.5], // L
                                color: "#b0b0ff"        
                        },
                        {
                                points: [5,5.5,5,10,6,10,8,6,7,5.5,6.5,7.5,6,7.5,6,5.5,5,5.5], // A
                                color: "#b0b0ff"        
                        },
                        {
                                points: [5.5,8.5,5.5,9,6,9,6,8.5,5.5,8.5], // A-hole, heh
                                color: "#b0b0ff"
                        },
                        {
                                points: [8.5,6,8.5,10,9.5,10.5,11,8,11,10.5,12,10.5,12,5.5,11,5.5,9.5,8.5,9.5,5.5,8.5,6], // N
                                color: "#b0b0ff"        
                        },
                        {
                                points: [13,6,13,10.5,15,10.5,16,9.5,16,7,15,6,13,6], // D
                                color: "#b0b0ff"        
                        },
                        {
                                points: [14,7,14,9.5,15,9.5,15,7,14,7], // D-hole
                                color: "#b0b0ff"
                        },
                        {
                                points: [7,2,7,4,8,4,8,2,7,2], // O
                                color: "#b0b0ff"        
                        },
                        {
                                points: [8.5,2,8.5,4,9.5,4,9.5,3,8.5,3,9,3,9.5,2], // R
                                color: "#b0b0ff"        
                        },
                        {
                                points: [6.5,1.5,10,1.5], // _
                                color: "#b0b0ff"        
                        },
                        {
                                points: [11,0,11,4.5,13,4.5,14,3.5,14,1,13,0,11,0], // D
                                color: "#b0b0ff"        
                        },
                        {
                                points: [12,1,12,3.5,13,3.5,13,1,12,1], // D-hole
                                color: "#b0b0ff"
                        },
                        {
                                points: [15,0,15,4.5,16,4.5,16,0,15,0], // I
                                color: "#b0b0ff"        
                        },
                        {
                                points: [17,0,17,4,20,4.5,20,3.5,18,3.5,18,2.5,19.5,3,19.5,2,18,2,18,1,20,1.5,20,0,17,0], // E
                                color: "#b0b0ff"        
                        }]
                        
                });
                var landerMock = new Sprite({
                        scale: 12,
                        x: 140,
                        y: 290,
                        angle: -.3,
                        parts: (new Lander()).parts
                });
                
                ctx.save();
                        ctx.clearRect(0,0,canvas.width, canvas.height);
                        Font.drawCanvas("HI SCORE "+highScore, 260,20, 2.1);
                        title.drawCanvas(ctx);
                        landerMock.drawCanvas(ctx);
                        Font.drawCanvas("thrust      : space", 240,340, 3.5);
                        Font.drawCanvas("rotate-left : <left>", 240,370, 3.5);
                        Font.drawCanvas("rotate-right: <right>", 240,400, 3.5);
                        Font.drawCanvas("Press thrust to start!", 70,460, 5.5);
                        Keys.run();
                        Font.drawCanvas((Wee.rate()>>0)+" FPS", canvas.width-80, 18);
                ctx.restore();
        };
        
        return ret;
})(); // <-- woof()!

// TODO: move this into an init function and enable initting in Sprite
Keys.on('a', function() {console.log("a was pressed");if(Game.getMode() === "play") {lander.rotateLeft.apply(lander)}});
Keys.on('left', function() {if(Game.getMode() === "play") {lander.rotateLeft.apply(lander)}});
Keys.on('d', function() {if(Game.getMode() === "play") {lander.rotateRight.apply(lander)}});
Keys.on('right', function() {if(Game.getMode() === "play") {lander.rotateRight.apply(lander)}});
Keys.on(' ', function() {if(Game.getMode() === "title") {Game.setMode("play"); sounds.doobiedoobie.ele.play()} if(Game.getMode() === "play") {lander.thrustUp.apply(lander)}});
Keys.off(' ', function() {if(Game.getMode() === "play") {lander.thrustDown.apply(lander)}});
Keys.on('escape', function() {if(Game.getMode() === "play") {Game.setMode("title")}});


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


//Start
resize();
Game.setMode("title");
Wee.start();
