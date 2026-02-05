//ShowQuote.js


//@input SceneObject quoteDisplay
//@input Component.Text quoteTxt
//@input Component.InteractionComponent resetQuoteButton


script.createEvent("OnStartEvent").bind(onStart);

function fetchQuote(){
    var q = global.getRandomQuote();
    if (!q) {
        print("No quotes loaded");
        return;
    }

    // In your CSV: q.id, q.quote, q.type
    print("Random quote #" + q.id + ": \"" + q.quote + "\" (" + q.type + ")");

    return q.quote;
}

function onStart(){

    script.quoteDisplay.enabled = false;

    resetQuote();
    
    script.quoteDisplay.enabled = true;

    initResetQuoteButton();

}


function resetQuote(){

    var quoteString = fetchQuote();
    script.quoteTxt.text = quoteString;

}


function initResetQuoteButton(){
    // Hook up the button
    if (script.resetQuoteButton) {
        script.resetQuoteButton.onTap.add(function (eventData) {
            resetQuote();
        });
    } else {
        print("resetQuoteButton is not assigned.");
    }
}