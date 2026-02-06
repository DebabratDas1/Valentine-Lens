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

script.leaderboardRef.setLeaderboardName('Top Romantic Valentines');
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
            script.leaderboardRef.submitScore(newScore);
            script.turnBased.setGlobalVariable("gridData", grid);
            //script.turnBased.setIsFinalTurn(true);
            script.turnBased.endTurn();
        });
    } else {
        print("SendQuoteButton is not assigned.");
    }
}


///// Dummmy /////

var grid = []

function turnStarted(){
    getPlayers()
    getCurrentTurn()
    getGrid()
    initLeaderboard();
    initSendQuoteButton();

}

script.turnBased.onTurnStart.add((eventData) => {
    print("Turn started for user: " + eventData.currentUserIndex);
    print("Tapped key was: " + eventData.tappedKey);
    turnStarted();
});


//script.turnBased.onTurnStart.add(turnStarted)

async function getPlayers(){
    currentPlayer = await script.turnBased.getCurrentUserIndex()
    otherPlayer = await script.turnBased.getOtherUserIndex()

    print(currentPlayer + " is current player ")
    print(otherPlayer + " is other player ")

}

async function getCurrentTurn(){
    currentTurn = await script.turnBased.getTurnCount()
    print("Turn Count "+currentTurn)
}


async function getGrid(){
    grid = await script.turnBased.getGlobalVariable("gridData")
    if(grid == undefined){
        grid = [0, 0, 0, 0, 0, 0, 0, 0, 0]

    }
}
