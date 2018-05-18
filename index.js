require('dotenv').config()
var _ = require('lodash');
var fp = require('lodash/fp');
var baseUniq = require('lodash/uniq');
var Trello = require("node-trello");
var trello = new Trello(process.env.TRELLO_API_KEY, process.env.TRELLO_API_TOKEN);
var moment = require('moment');
var Monday = moment().startOf('isoweek');
var Monday1 = Monday.format('dddd, MMMM Do YYYY');
var Sunday = moment().endOf('isoweek').format('dddd, MMMM Do YYYY');
var thisMoment = moment().format('dddd, MMMM Do YYYY');
var now = moment();
var day = now.day();
var week = [['sunday', 0], ['monday', 1], ['tuesday', 2], ['wednesday', 3], ['thursday', 4], ['friday', 5], ['saturday', 6]];
var startOfTheWeek = moment().day(-(week[1][1] - day));

function listtoname(list) {
    if (list != null) {
        return list.name
    }
    return 'n/a'
}

//For List Dev Review
function devReviewSummary(action) {
    const cardDate = moment(action.date)
    const withinDateRange = cardDate.isBetween(Monday, moment());
    function filteredcard(action) {
    }
    var cardbehavior1 = action.data.card.name
    if (withinDateRange) {
        return cardbehavior1
    }
    else {
        return null
    }
}

trello.get("/1/lists/"+process.env.DEV_REVIEW_IDLIST+"/actions", { updateCard: "move" }, function (err, actions) {  // You can change the list ID to any list ID from Trello. List ID's can be retrieved through File "Lists.js"
    if (err) throw err;
    var summaries = []
    actions.forEach(function (action) {
        var summary = devReviewSummary(action)
        if (summary != null) {
            _.compact([null])
            summaries.push(summary)
        }
    })
    var uniqueSummaries1 = _.uniq(summaries);
    var finalUniqueSummaries1 = uniqueSummaries1.toString();
    var formattedString1 = finalUniqueSummaries1.split(",").join("\n");

    console.log("");
    var titleDevReview = "This week " + Monday1 + " - " + Sunday + " " + uniqueSummaries1.length + " stories " + "completed. They are: "
    console.log(titleDevReview);
    console.log("");
    console.log(formattedString1);
    var Slack = require('slack-node');
    webhookUri = process.env.WEBHOOK_URI;
    slack = new Slack();
    slack.setWebhook(webhookUri);
    var uniqueAttachments = _.uniq(summaries);
    var attachments = _.map(uniqueAttachments, function (summary) {
        return { "color": "#36a64f", "text": summary }
    })

    slack.webhook({
        channel: process.env.CHANNEL,
        text: titleDevReview,
        "attachments": attachments
    }, function (err, response) {
        console.log(response);
    });

})

//For List Complete for Acceptance
function completeForAcceptanceSummary(action) {
    const cardDate = moment(action.date)
    const withinDateRange = cardDate.isBetween(Monday, moment());
    var cardbehavior1 = action.data.card.name
    if (withinDateRange) {
        return cardbehavior1
    }
    else {
        return null
    }
}
trello.get("/1/lists/"+process.env.COMPLETE_FOR_ACCEPTANCE_IDLIST+"/actions", { updateCard: "move" }, function (err, actions) {
    if (err) throw err;
    var summaries = []
    actions.forEach(function (action) {
        var summary = completeForAcceptanceSummary(action)
        if (summary != null) {
            _.compact([null])
            summaries.push(summary)
        }
    }
    )
    var uniqueSummaries = _.uniq(summaries);
    var finalUniqueSummaries = uniqueSummaries.toString();
    var formattedString = finalUniqueSummaries.split(",").join("\n");
    console.log("");
    var titleCompleteForAcceptance = "This week " + Monday1 + " - " + Sunday + " " + uniqueSummaries.length + " stories " + "accepted. They are: ";
    console.log(titleCompleteForAcceptance);
    console.log("");
    console.log(formattedString);

    var Slack = require('slack-node');
    webhookUri = process.env.WEBHOOK_URI;
    slack = new Slack();
    slack.setWebhook(webhookUri);
    var uniqueAttachments = _.uniq(summaries);
    var attachments = _.map(uniqueAttachments, function (summary) {
        return { "color": "#439FE0", "text": summary }
    })
    slack.webhook({
        channel: process.env.CHANNEL,
        text: titleCompleteForAcceptance,
        "attachments": attachments
    }, function (err, response) {
        console.log(response);
    });
})
