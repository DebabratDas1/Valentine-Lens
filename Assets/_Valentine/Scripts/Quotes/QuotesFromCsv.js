// QuotesFromCsv.js

// Load the CSV string from another file
var csvModule = require("./QuotesCsvData");  // path relative to *this* script
var rawCsv = csvModule.rawCsv;

// This will hold parsed objects: { id, quote, type }
global.quotesData = [];

function parseCsv(raw) {
    var lines = raw.split("\n");
    if (lines.length <= 1) {
        return [];
    }

    var result = [];
    for (var i = 1; i < lines.length; i++) { // skip header
        var line = lines[i].trim();
        if (!line) {
            continue;
        }

        var parts = line.split("|");
        if (parts.length < 3) {
            continue;
        }

        var id    = parseInt(parts[0], 10);
        var quote = parts[1];
        var type  = parts[2];

        result.push({ id: id, quote: quote, type: type });
    }
    return result;
}

script.createEvent("OnStartEvent").bind(function () {
    global.quotesData = parseCsv(rawCsv);
    print("Loaded quotes: " + global.quotesData.length);
});

// Helper to get a random quote object
global.getRandomQuote = function () {
    var arr = global.quotesData;
    if (!arr || arr.length === 0) {
        return null;
    }
    var idx = Math.floor(Math.random() * arr.length);
    return arr[idx]; // { id, quote, type }
};