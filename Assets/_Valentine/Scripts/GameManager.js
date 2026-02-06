//@input Component.ScriptComponent  turnBased;
//@input Component.ScriptComponent  leaderboardRef;


//@input Component.InteractionComponent sendQuoteButton


var currentHighScore = 0;

script.createEvent("OnStartEvent").bind(function(eventData){
    initLeaderboard();
    initSendQuoteButton();

})


function initLeaderboard(){
    // Subscribe once, e.g. in OnStart
script.leaderboardRef.onLeaderboardRecordsUpdated.add(function(wrapper) {
    var rec = wrapper.currentUserRecord;
    if (rec) {
        currentHighScore = rec.score;  // previous best for this user
        print("Previous high scored is stored! "+currentHighScore)
    } else {
        currentHighScore = 0;          // no previous entry
        print("Previous high scored is NOT stored! "+currentHighScore)

    }
});
/*

var ss = script.leaderboardRef.getSideSwitcher();
if (ss && ss.getSceneObject) {
    var so = ss.getSceneObject(); // depending on implementation
    var st = so.getComponent("Component.ScreenTransform");
    if (st) {
        st.scale = new vec3(0.7, 0.7, 1); // 70% size
    }
}

*/
}


function initSendQuoteButton(){
    // Hook up the button
    if (script.sendQuoteButton) {
        script.sendQuoteButton.onTap.add(function (eventData) {

            var sessionScore = 0;
if (global.heartCoinController && global.heartCoinController.getTotalHearts) {
    sessionScore = global.heartCoinController.getTotalHearts();
}

// Now you can use sessionHearts, e.g. submit to leaderboard or log it
print("Current session hearts: " + sessionScore);

            var newScore = currentHighScore + sessionScore;
            script.leaderboardRef.submitScore(newScore)
            script.turnBased.setIsFinalTurn(true);
            script.turnBased.endTurn();
        });
    } else {
        print("SendQuoteButton is not assigned.");
    }
}