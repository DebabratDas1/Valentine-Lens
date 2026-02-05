// HeartCoinController.js

// @input SceneObject heartTemplate
// @input Component.ScreenTransform uiRoot
// @input Component.ScreenTransform heartsTarget
// @input Component.Text heartsText
// @input float heartDuration = 0.6
// @input float spawnCooldown = 0.04

// NEW: SFX components
// These should each have an AudioComponent with an AudioTrack assigned and Autoplay OFF.
 // @input Component.AudioComponent spawnSfx
 // @input Component.AudioComponent scoreSfx

var flyingHearts = [];
var spawnTimer = 0.0;
var totalHearts = 0;

var duration = script.heartDuration > 0 ? script.heartDuration : 0.6;
var cooldown = script.spawnCooldown > 0 ? script.spawnCooldown : 0.04;

// Public API for other scripts
global.heartCoinController = {
    spawnFromScreenPos: spawnFromScreenPos,
    getTotalHearts: function () { return totalHearts; },
    setTotalHearts: function (v) {
    totalHearts = v;
    if (script.heartsText) {
        script.heartsText.text = formatScore(totalHearts);
    }
}
};

script.createEvent("UpdateEvent").bind(onUpdate);

function spawnFromScreenPos(screenPos, count) {
    if (!script.heartTemplate || !script.uiRoot || !script.heartsTarget) {
        return;
    }

    count = count || 1;

    if (spawnTimer > 0) {
        return;
    }
    spawnTimer = cooldown;

    // NEW: play spawn sound + light haptic ONCE per burst
    playSpawnFeedback();

    for (var i = 0; i < count; i++) {
        var uiSt = script.uiRoot;

        var localPos = uiSt.screenPointToParentPoint(screenPos); // vec2

        // Instantiate under uiRoot
        var uiRootSo = uiSt.getSceneObject();
        var heartSo = uiRootSo.copyWholeHierarchy(script.heartTemplate);
        heartSo.enabled = true;

        var heartSt = heartSo.getComponent("Component.ScreenTransform");
        if (!heartSt) {
            heartSo.destroy();
            return;
        }

        // Stronger random jitter around the finger
var jitter = 0.08; // was 0.03
localPos = new vec2(
    localPos.x + (Math.random() * 2 - 1) * jitter,
    localPos.y + (Math.random() * 2 - 1) * jitter
);
heartSt.anchors.setCenter(localPos);

var endPos = script.heartsTarget.anchors.getCenter();

// Random control point for nice curved paths
var mid = new vec2(
    (localPos.x + endPos.x) * 0.5,
    (localPos.y + endPos.y) * 0.5
);

// Increase curve amplitude so paths differ more
var curveAmp = 0.2; // was 0.15
var ctrl = new vec2(
    mid.x + (Math.random() * 2 - 1) * curveAmp,
    mid.y + (Math.random() * 2 - 1) * curveAmp
);
        // Slight per‑heart duration variation so they don’t arrive all at once
        var dur = duration * (0.8 + Math.random() * 0.4);

        flyingHearts.push({
            so: heartSo,
            st: heartSt,
            t: 0.0,
            duration: dur,
            start: localPos,
            ctrl: ctrl,
            end: endPos,
            // optional: random scale start/end
            s0: 1.0 + Math.random() * 0.2,
            s1: 0.6 + Math.random() * 0.2
        });
    }
}

function onUpdate(eventData) {
    var dt = eventData.getDeltaTime();

    if (spawnTimer > 0) {
        spawnTimer -= dt;
    }

    if (flyingHearts.length === 0) {
        return;
    }

    for (var i = flyingHearts.length - 1; i >= 0; i--) {
    var h = flyingHearts[i];

    h.t += dt / h.duration;
    var p = Math.min(h.t, 1.0);

    // Ease‑out on time
    var eased = 1.0 - (1.0 - p) * (1.0 - p);

    // Quadratic Bézier between start → ctrl → end
    var u = 1.0 - eased;
    var bx = u * u * h.start.x +
             2.0 * u * eased * h.ctrl.x +
             eased * eased * h.end.x;
    var by = u * u * h.start.y +
             2.0 * u * eased * h.ctrl.y +
             eased * eased * h.end.y;

    h.st.anchors.setCenter(new vec2(bx, by));

    // Scale over time (slightly shrinking as it flies)
    var s = lerp(h.s0, h.s1, eased);
    h.st.scale = new vec3(s, s, s);

    if (p >= 1.0) {
    // Arrived at hearts UI
    totalHearts++;

    if (script.heartsText) {
        script.heartsText.text = formatScore
            ? formatScore(totalHearts)    // if you added formatter earlier
            : totalHearts.toString();
    }

    // NEW: score feedback for each successful heart
    playScoreFeedback();

    h.so.destroy();
    flyingHearts.splice(i, 1);
    }
}
}

function lerp(a, b, t) {
    return a * (1.0 - t) + b * t;
}


function formatScore(n) {
    // No negatives expected, but be safe
    var num = Math.abs(n);

    if (num < 1000) {
    return n.toString();
} else if (num < 1e6) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
} else if (num < 1e9) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
} else if (num < 1e12) {
    return (num / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
} else {
    return (num / 1e12).toFixed(1).replace(/\.0$/, "") + "T";
}
}

function playSpawnFeedback() {
    // Play heart spawn SFX once per burst
    if (script.spawnSfx) {
        script.spawnSfx.play(1);
    }
/*
    // Light haptic for spawn (iOS only; no effect in Editor / Android)
    if (!global.deviceInfoSystem.isEditor()
        && global.deviceInfoSystem.isMobile()
        && global.deviceInfoSystem.getOS() == DeviceInfoSystem.OS.iOS) {

        global.hapticFeedbackSystem.hapticFeedback(HapticFeedbackType.Vibration);
    }*/
}

function playScoreFeedback() {
    // Score bump SFX
    if (script.scoreSfx) {
        //script.scoreSfx.play(1);
    }
/*
    // Optional: You can keep this or comment it out if hearts already vibrate enough
    if (!global.deviceInfoSystem.isEditor()
        && global.deviceInfoSystem.isMobile()
        && global.deviceInfoSystem.getOS() == DeviceInfoSystem.OS.iOS) {

        global.hapticFeedbackSystem.hapticFeedback(HapticFeedbackType.Vibration);
    }
    */
}