const express = require("express");
const router = express.Router();
const {google} = require('googleapis');
const request = require("request");
const oauth2Client = new google.auth.OAuth2(
  '914832969749-8c7g8986hodnstj58eluijnbj1aml16g.apps.googleusercontent.com',
  'oN6AslW0GvPb0gFODMmvW6mm',
  'http://localhost:8003/auth/googletoken'
);
const moment = require('moment');

router.get("/", function(req, res) {
  const scopes = [
    'https://www.googleapis.com/auth/analytics'
  ];
  
  const url = oauth2Client.generateAuthUrl({
    scope: scopes
  });

  res.redirect(url);
});

router.get("/googletoken", async function(req, res) {
  const {code} = req.query;
  const {tokens} = await oauth2Client.getToken(code);
  const {access_token} = tokens;
  const yesterDay = moment().add(-1, 'days').format('YYYY-MM-DD');
  const beforeWeekDay = moment().add(-8, 'days').format('YYYY-MM-DD');
  const analytics_url = 'https://www.googleapis.com/analytics/v3/data/ga?ids=ga%3A179440961&start-date='+beforeWeekDay+'&end-date='+yesterDay+'&metrics=ga%3Apageviews&dimensions=ga%3ApagePath&sort=-ga%3Apageviews&max-results=100&access_token=' + access_token;
  console.log(analytics_url);
  request(analytics_url, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  });

  res.render("admin/index");
});

module.exports = router;