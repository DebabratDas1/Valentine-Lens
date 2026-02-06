// BGMRandomPlaylist.js

// @input Component.AudioComponent bgmAudio
// @input Asset.LicensedAudioTrack[] tracks
// @input bool loopPlaylist = true

var playlist = [];
var currentIndex = 0;
var isPlaying = false;

script.createEvent("OnStartEvent").bind(onStart);

function onStart() {
    if (!script.bgmAudio || !script.tracks || script.tracks.length === 0) {
        print("BGM: missing AudioComponent or tracks");
        return;
    }

    // Copy & shuffle
    playlist = script.tracks.slice(0);
    shuffleArray(playlist);

    currentIndex = 0;
    playCurrent();
}

// Fisher–Yates shuffle
function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}

function playCurrent() {
    if (playlist.length === 0) {
        return;
    }

    var track = playlist[currentIndex];
    if (!track) {
        print("BGM: track at index " + currentIndex + " is null");
        return;
    }

    // Assign audio track and play once
    script.bgmAudio.audioTrack = track;
    isPlaying = true;
    script.bgmAudio.play(1);

    // Schedule next track when this one finishes
    var duration = track.duration || 0;
    if (duration <= 0) {
        // Safety: if metadata missing, just schedule a fixed delay
        duration = 30.0;
    }

    // Add a small buffer to be safe
    scheduleNext(duration + 0.1);
}

function scheduleNext(delaySeconds) {
    var evt = script.createEvent("DelayedCallbackEvent");
    evt.bind(function() {
        onTrackFinished();
    });
    evt.reset(delaySeconds);
}

function onTrackFinished() {
    if (!isPlaying) {
        return;
    }

    currentIndex++;

    if (currentIndex >= playlist.length) {
        if (script.loopPlaylist) {
            currentIndex = 0;
            // Re-shuffle at the end if you want:
            // shuffleArray(playlist);
        } else {
            isPlaying = false;
            return;
        }
    }

    playCurrent();
}

// Optional public API
script.api = {};
script.api.skipToNext = function() {
    isPlaying = false;
    // Stop current
    if (script.bgmAudio && script.bgmAudio.isPlaying) {
        script.bgmAudio.stop(true);
    }
    currentIndex = (currentIndex + 1) % playlist.length;
    isPlaying = true;
    playCurrent();
};