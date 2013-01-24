var Orient = (function() {
    var ret   = {}
    ,   info  = null
    ;
    function capture(data) {
        info = data;
    }
    
    ret.activate = function() {
        window.addEventListener("deviceorientation", capture, true);
    };
    ret.deactivate = function() {
        window.removeEventListener("deviceorientation", capture, true);
    };
    ret.getAngle = function() {
        return info.alpha;
    };
    
    return ret;
})();