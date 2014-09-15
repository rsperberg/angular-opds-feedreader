// app.js
// {titleText:'',url:''}

var app = angular.module('FeedRead', []);

app.factory('FeedService',function($http){
    return {
        parseFeed : function(url){
        return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }
    };
});

app.controller('FeedCtrl', ['$scope','FeedService', FeedCtrl]);

function FeedCtrl($scope, FeedService) {
    retrieveFromLocalStorage();
    $scope.phMessage = 'Enter Feed URL';
    $scope.currentButtonText=$scope.allFeeds[0].titleText;
    $scope.loadFeed=function(e,url){
        $scope.currentButtonText = angular.element(e.target).text();
        // empty out filter text from last time they put one in, because
        // when they hit a new feed it is confusing.
        $scope.filterText = '';
        console.log('loadFeed / click event fired');

        if ($scope.currentButtonText == $scope.allFeeds[0].titleText) {
            //console.log($scope.feedSrc);
            url = $scope.feedSrc;
        }


        $scope.feedSrc = url;
        if (url === undefined || url === '') {
            $scope.phMessage = 'Please enter a valid Feed URL & try again.';
            return;
        }
        console.log('button text: ' + angular.element(e.target).text());
        console.log('value of url: ' );
        console.log(url);
    FeedService.parseFeed(url).then(function(res) {
        $scope.loadButtonText=angular.element(e.target).text();
        $scope.feeds=res.data.responseData.feed.entries;
        });
    }
    $scope.clearText=function() {
        $scope.filterText = '';
    }

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
            console.log($scope.allFeeds.length);

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
            {titleText:'FeedBooks',url:'http://www.feedbooks.com/catalog.atom'},
            {titleText:'CodeProject C#',url:'http://www.codeproject.com/webservices/articlerss.aspx?cat=3'},
            {titleText:'TechCrunch',url:'http://feeds.feedburner.com/TechCrunch'}
            ];
    }
    $scope.removeAllFeedsFromLocalStorage = removeAllFeedsFromLocalStorage;
    $scope.saveFeed = saveFeed;

    function removeAllFeedsFromLocalStorage() {
        localStorage.removeItem('feeds');
    }

    function saveFeed() {
        console.log('feedSrc');
        console.log($scope.feedSrc);
        if ($scope.feedSrc === undefined || $scope.feedSrc == '') {
            alert('Please provide a Feed URL and try again.');
            return;
        }
        var titleText = prompt('Please enter the feed title text', '');
        if (titleText != null) {
            f = new feed(titleText, $scope.feedSrc);
            $scope.allFeeds.push(f);
            saveToLocalStorage($scope.allFeeds);
        }
    }
}

function feed(titleText, url) {
    this.titleText = titleText;
    this.url = url;
}
