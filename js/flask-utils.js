/**
 * Process flask object for easier use later on 
 * @param {*} flaskObject flask json result als Object
 */
function processFlaskJson2SingleElements(flaskObject) {
    var result = [];
    var today = new Date();
    for (var year in flaskObject) {
        if (!flaskObject.hasOwnProperty(year)) continue;
        for (var month in flaskObject[year]) {
            if (!flaskObject[year].hasOwnProperty(month)) continue;
            for (var day in flaskObject[year][month]) {
                if (!flaskObject[year][month].hasOwnProperty(day)) continue;
                var currentEntryDate = new Date(Date.UTC(Number(year), Number(month - 1), Number(day)));
                var entry = flaskObject[year][month][day];
                for (var i = 0; i < entry.length; i++) {
                    var processed = processOneTimeEntry(entry[i], currentEntryDate);
                    result.push(processed);
                }
            }

        }

    }

    // sicherstellen das Reihenfolfe immer stimmt.
    result.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(a.date) - new Date(b.date);
    });
    return result.sort();
}

/**
 * 
 * @param {*} arraySingleElements processed flask objects
 * @param {*} locale language for date format
 * @param {*} maxResults how meny results (e. g. next 5). Number below zero for showing all (this and next month)
 */
function SingleElements2HtmlTable(arraySingleElements, locale, maxResults) {
    if (locale === undefined || locale === null) {
        locale = 'en';
    }
    moment.locale(locale);

    if (maxResults < 0) {
        maxResults = arraySingleElements.length;
    }

    var tbl = document.createElement('table');
    var tbdy = document.createElement('tbody');
    var startIndex = 0;
    for(var i = 0; i < arraySingleElements.length; i++) {
        var now = new Date();
        var nowWOTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var dateElement = new Date(arraySingleElements[i].date.getFullYear(), arraySingleElements[i].date.getMonth(), arraySingleElements[i].date.getDate());

        if (dateElement.getTime() < nowWOTime.getTime()) {
            continue;
        }
        if (dateElement.getTime() >= nowWOTime.getTime()) {
            startIndex = i;
            break;
        }
        // no upcomming tasks/events
        startIndex = arraySingleElements.length;
    }
    for (var i = startIndex; i < maxResults + startIndex && i < arraySingleElements.length; i++) {
        var tr = document.createElement('tr');
        tr.appendChild(createTdWithText(moment(arraySingleElements[i].date).format("dddd")));
        tr.appendChild(createTdWithText(moment(arraySingleElements[i].date).format("DD. MMMM YYYY")));
        tr.appendChild(createTdWithText(moment(arraySingleElements[i].date).format("HH:mm")));
        tr.appendChild(createTdWithText(arraySingleElements[i].title));
        tbdy.appendChild(tr);
    }
    tbl.appendChild(tbdy);

    return tbl;
}

function createTdWithText(text) {
    var td = document.createElement('td');
    td.appendChild(document.createTextNode(text));
    return td;
}

function processOneTimeEntry(entry, entryDate) {
    var procEntry = {};
    procEntry.id = entry.id;
    procEntry.title = entry.title;
    timeParts = entry.due_time.split(":");
    entryDate.setHours(Number(timeParts[0]), Number(timeParts[1]));
    procEntry.date = entryDate;
    procEntry.description = entry.details;
    return procEntry;
}
