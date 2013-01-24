var Font = (function() {
    var ret   = {}
    ,   s     = 2.17 // scale
    ,   i     = 0 // iterator
    ,   color = "#FFF"
    ,   width = s*4+.5//ish
    ,   chars = {}
    ;
    
    chars = {
        a: {parts: [{points: [0,0,0,4,3,4,3,0,3,2,0,2]}] },
        b: {parts: [{points: [0,0,0,4,2,4,3,3,2,2,0,2,2,2,3,1,2,0,0,0]}] },
        c: {parts: [{points: [3,0,0,0,0,4,3,4]}] },
        d: {parts: [{points: [0,0,0,4,2,4,3,3,3,1,2,0,0,0]}] },
        e: {parts: [{points: [3,4,0,4,0,2,3,2,0,2,0,0,3,0]}] },
        f: {parts: [{points: [3,4,0,4,0,2,2,2,0,2,0,0]}] },
        g: {parts: [{points: [3,4,0,4,0,0,3,0,3,2,1,2]}] },
        h: {parts: [{points: [0,0,0,4,0,2,3,2,3,4,3,0]}] },
        i: {parts: [{points: [0,4,3,4,1.5,4,1.5,0,3,0,0,0]}] },
        j: {parts: [{points: [0,4,3,4,2,4,2,0,0,0,0,1]}] },
        k: {parts: [{points: [0,4,0,2,3,4,0,2,3,0,0,2,0,0]}] },
        l: {parts: [{points: [0,4,0,0,3,0]}] },
        m: {parts: [{points: [0,0,0,4,1.5,2,3,4,3,0]}] },
        n: {parts: [{points: [0,0,0,4,3,0,3,4]}] },
        o: {parts: [{points: [0,0,0,4,3,4,3,0,0,0]}] },
        p: {parts: [{points: [0,0,0,4,3,4,3,2,0,2]}] },
        q: {parts: [{points: [0,.5,0,4,3,4,3,.5,2,.5,2,2,2,0,2,.5,0,.5]}] },
        r: {parts: [{points: [0,0,0,4,3,4,3,2,0,2,2,2,3,0]}] },
        s: {parts: [{points: [0,0,3,0,3,2,0,2,0,4,3,4]}] },
        t: {parts: [{points: [1.5,0,1.5,4,0,4,1.5,4,3,4]}] },
        u: {parts: [{points: [0,4,0,0,3,0,3,4]}] },
        v: {parts: [{points: [0,4,1.5,0,3,4]}] },
        w: {parts: [{points: [0,4,0,0,1.5,2,3,0,3,4]}] },
        x: {parts: [{points: [0,4,1.5,2,3,4,0,0,1.5,2,3,0]}] },
        y: {parts: [{points: [0,4,1.5,2,3,4,1.5,2,1.5,0]}] },
        z: {parts: [{points: [0,4,3,4,0,0,3,0]}] },
        "0": {parts: [{points: [0,0,0,4,3,4,3,0,0,0]}] },
        "1": {parts: [{points: [1,3,2,4,2,0]}] },
        "2": {parts: [{points: [3,0,0,0,0,2,3,2,3,4,0,4]}] },
        "3": {parts: [{points: [0,4,3,4,1,2,3,2,3,0,0,0]}] },
        "4": {parts: [{points: [0,4,0,2,3,2,2,2,2,4,2,0]}] },
        "5": {parts: [{points: [0,0,3,0,3,2,0,2,0,4,3,4]}] },
        "6": {parts: [{points: [3,4,0,4,0,0,3,0,3,2,0,2]}] },
        "7": {parts: [{points: [0,4,3,4,2,0]}] },
        "8": {parts: [{points: [3,4,0,4,0,2,3,2,3,0,0,0,0,2,3,2,3,4]}] },
        "9": {parts: [{points: [3,2,0,2,0,4,3,4,3,0]}] },
        "<left>":  {parts: [{points: [1,3.5,0,2,3,2,0,2,1,.5]}] },
        "<up>":    {parts: [{points: [0,3,1.5,4,1.5,0,1.5,4,3,3]}] },
        '<right>': {parts: [{points: [2,3.5,3,2,0,2,3,2,2,.5]}] },
        "<down>":  {parts: [{points: [0,1,1.5,0,1.5,4,1.5,0,3,1]}] },
        "-": {parts: [{points: [0,2,3,2]}] },
        ".": {parts: [{points: [1.3,0,1.7,0,1.7,.3,1.3,.3,1.3,0]}] },
        ":": {parts: [{points: [1,4,2,4,2,3,1,3,1,4]},{points: [1,1,2,1,2,0,1,0,1,1]}] },
        "!": {parts: [{points: [1,4,2,4,2,1.5,1,1.5,1,4]},{points: [1,1,2,1,2,0,1,0,1,1]}] },
        "%": {parts: [{points: [0,3,0,4,1,4,1,3,0,3]},{points: [2,0,3,0,3,1,2,1,2,0]},{points: [0,0,3,4]}] },
        "^": {parts: [{points: [1,3,1,4,2,4,2,3,1,3]}] }, // degree symbol
        "*": {parts: [{points: [.5,3,1.5,2,2.5,3,1.5,2,.5,1,1.5,2,2.5,1]}] },
        " ": {parts: [{points: []}] }
    };
    
    for(i in chars) {
        // add scale prop
        chars[i].scale = s;
        chars[i].flipX = false;
        chars[i].color = color;
        chars[i]       = new Sprite(chars[i]);
    }
    
    ret.drawCanvas = function(str, x, y, scale) {
        var i   = 0
        ,   str = str.toLowerCase()
        ,   tmp = ""
        ,   w   = 0
        ;
    
        x += width; // losing a char width cause the x flip
        for(i=0; i<str.length; i++) {

            try {
                if(str[i] == '<') { // special char - unicode failed me on shared host :(
                    tmp = chars[(str.slice(i, str.slice(i).indexOf('>')+1))];
                    i = str.slice(i).indexOf('>'); // fix i
                } else {
                    tmp = chars[str[i]];
                }
                tmp.y = y;
                tmp.x = x + w*width;
                // TODO: get grips with passing ctx around
                tmp.drawCanvas(ctx);
                w++;
            } catch(e) {}
        }
    };
    
    return ret;
})();

