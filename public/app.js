/*global jLoader xml2json*/
// app.js
// {titleText:'',url:''}
'use strict';
/*
var feedr = require('feedr').create({});

var opdsfeeds = {
    feedBooksAll:'http://www.feedbooks.com/catalog.atom',
    feedBooksFiction:'http://www.feedbooks.com/store/categories/FBFIC000000.atom',
    feedBooksNonfiction:'http://www.feedbooks.com/store/categories/FBNFC000000.atom',
    feedBooksFree:'http://www.feedbooks.com/site/free_books.atom',
    feedBooksBestsellers:'http://www.feedbooks.com/store/top.atom',
    feedBooksNew:'http://www.feedbooks.com/store/recent.atom'
};

// Read a single feed
var feedbooksinfo = feedr.readFeed(opdsfeeds.feedBooksAll, {}, function(err, data, headers){
    console.log(err, data, headers);
    console.log(feedbooksinfo);
});
*/

// from https://github.com/ftlabs/fastclick -- used to enable touch selection in dropdown menu on iOS devices
window.addEventListener('load', function() {
    FastClick.attach(document.body);
}, false);

var app = angular.module('FeedRead', ['ngTouch']);
//  takes encoded entities and converts them to the character the entity represents
app.filter('decodeEntities', function () {
  return function (item) {
    return he.decode(item);
  };
});

app.factory('FeedService',function($http) {
   return {
        parseOpdsFeed: function(feedUrl) {
               return  $http.get(feedUrl).then(function(res) {
                console.log('res is: ',res);
//                console.log('res.data is: ',res.data);
 //                   $scope.xmlfeed = res;
 //                   var resDecoded = he.decode(res);
 //                   var resDecoded = decodeHtml(res.data);
 //                   console.log('resDecoded is: ',resDecoded);
                    var jsonfeed = xml2json.parseTheXml(res.data);
 //                   console.log('jsonfeed is: ', jsonfeed);
                    return jsonfeed;
            } ); // get
        }  // parseOpdsFeed
    };  // return
});  // app.factory

app.controller('FeedCtrl', ['$scope', '$http', 'FeedService', FeedCtrl]);

function FeedCtrl($scope, $http, FeedService) {
   retrieveFromLocalStorage();
    $scope.phMessage = 'Enter Feed URL';
    $scope.currentButtonText = $scope.allFeeds[0].titleText;

    $scope.loadFeed = function(e,url){
        $scope.currentButtonText = angular.element(e.target).text();
        // empty out search filter text from last time they put one in, because
        // when they hit a new feed it is confusing.
        $scope.filterText = '';
        console.log('loadFeed / click event fired');

        // when button is labeled 'load (from textbox)', set the url to what's in the textbox
        if ($scope.currentButtonText === $scope.allFeeds[0].titleText) {
            //console.log($scope.feedSrc);
            url = $scope.feedSrc;
        }

        $scope.feedSrc = url;
        if (url === undefined || url === '') {
            $scope.phMessage = 'Please enter a valid Feed URL & try again.';
            return;
        }
        console.log('button text: ' + angular.element(e.target).text());
        console.log('value of url is (on next line): ' );
        console.log(url);

        FeedService.parseOpdsFeed(url).then(function(res) {
            console.log('res from parseOpdsFeed is: ', res);
            $scope.currentButtonText = angular.element(e.target).text();
            $scope.feeds = res.feed.entry;//res.data.responseData.feed.entries;
            $scope.images = res.feed.entry.link;   // this isn't going to work for ng-repeat within ng-repeat
            $scope.links = res.feed.link;
//            $scope.summary = res.feed.entry.summary._text;
//            $scope.content = he.decode(res.feed.entry.content);
            console.log('$scope.feeds is: ', $scope.feeds);
            console.log('$scope.links is: ', $scope.links);
        });
    };
    $scope.clearText = function() {
        $scope.filterText = '';
    };

    function loadSubFeed(e,url, subFeedTitle) {
        $scope.filterText = '';
        $scope.phMessage = url;
        $scope.feedSrc = url;
        //console.log(url);
        FeedService.parseOpdsFeed(url).then(function(res) {
            console.log('res from parseOpdsFeed is: ', res);
            $scope.currentButtonText = res.feed.title._text;
 //           $scope.currentButtonText = subFeedTitle;
            $scope.main = res.feed;
            $scope.feeds = res.feed.entry;//res.data.responseData.feed.entries;
            $scope.images = res.feed.entry.link;
//            $scope.summary = res.feed.entry.summary._text;    // this isn't going to work for ng-repeat within ng-repeat
//            $scope.content = he.decode(res.feed.entry.content);
            $scope.links = res.feed.link;
            console.log('$scope.feeds is: ', $scope.feeds);
            console.log('$scope.images is: ', $scope.images);
            console.log('$scope.links is: ', $scope.links);
        });
   }

   function loadAndBuildSubFeed(e,category,label) {
    var categoryUrl = 'http://www.feedbooks.com/store/top.atom?category=' + category;
    loadSubFeed(e, categoryUrl,label);
   }

   $scope.loadSubFeed = loadSubFeed;
   $scope.loadAndBuildSubFeed = loadAndBuildSubFeed;

    function saveToLocalStorage(feeds) {
      // Put the object into storage
      localStorage.setItem('feeds', angular.toJson(feeds));
      console.log(angular.toJson(feeds));
      console.log('wrote feeds to localStorage');
    }

    function retrieveFromLocalStorage() {
        $scope.allFeeds = [];
        console.log('retrieving localStorage...');
        try {
            $scope.allFeeds = JSON.parse(localStorage['feeds']);
            console.log('feeds length is: ',$scope.allFeeds.length);

            // console.log(JSON.stringify($scope.allFeeds));
            if ($scope.allFeeds === null)
            {
                console.log('couldn\'t retrieve feeds' );
                loadDefaultFeeds();
            }
         }
         catch (ex) {
            console.log('ex: ' + ex);
            loadDefaultFeeds();
            saveToLocalStorage($scope.allFeeds);
         }
    }

    function loadDefaultFeeds() {
        $scope.allFeeds = [{titleText:'Load (from textbox)',url:''},
            {titleText:'FeedBooks All',url:'http://www.feedbooks.com/catalog.atom'},
            {titleText:'FeedBooks Fiction',url:'http://www.feedbooks.com/store/categories/FBFIC000000.atom'},
            {titleText:'FeedBooks Non-fiction',url:'http://www.feedbooks.com/store/categories/FBNFC000000.atom'},
            {titleText:'FeedBooks Free Books',url:'http://www.feedbooks.com/site/free_books.atom'},
            {titleText:'FeedBooks Bestsellers',url:'http://www.feedbooks.com/store/top.atom'},
            {titleText:'FeedBooks New Releases',url:'http://www.feedbooks.com/store/recent.atom'},
            {titleText:'Internet Archive',url:'http://bookserver.archive.org/catalog/catalog.atom'},
            {titleText:'O\'Reilly',url:'http://opds.oreilly.com/opds/'},
            {titleText:'The Pragmatic Bookshelf',url:'https://pragprog.com/catalog.opds'},
            {titleText:'Project Gutenberg',url:'http://m.gutenberg.org/ebooks/?format=opds'}
            ];
    }
    $scope.removeAllFeedsFromLocalStorage = removeAllFeedsFromLocalStorage;
    $scope.saveFeed = saveFeed;

    function removeAllFeedsFromLocalStorage() {
        localStorage.removeItem('feeds');
    }

    function saveFeed() {
//        console.log('feedSrc');
//        console.log($scope.feedSrc);
        if ($scope.feedSrc === undefined || $scope.feedSrc === '') {
            alert('Please provide a Feed URL and try again.');
            return;
        }
        var titleText = prompt('Please enter the feed title text', '');
        if (titleText != null) {
            var f = new feed(titleText, $scope.feedSrc);
            $scope.allFeeds.push(f);
            saveToLocalStorage($scope.allFeeds);
        }
    }
}

function feed(titleText, url) {
    this.titleText = titleText;
    this.url = url;
}
