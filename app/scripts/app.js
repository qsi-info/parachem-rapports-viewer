'use strict';

/**
 * @ngdoc overview
 * @name AngularSharePointApp
 * @description
 * # AngularSharePointApp
 *
 * Main module of the application.
 */


function parseQueryString() {
  var query = (window.location.search || '?').substr(1);
  var map = {};
  query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function (match, key, value) {
    (map[key] = map[key] || []).push(window.decodeURIComponent(value));
  });
  return map;
}



angular
  .module('AngularSharePointApp', [
    'ngCookies',
    'ngResource',
    'ngRoute',
    'cfp.loadingBar',
  ])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider

      // Home
      .when('/home', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })


      .when('/search/:type', {
        templateUrl: 'views/search.html',
        controller: 'SearchCtrl',
      })


      // Setup
      .when('/gateway', {
        template: '',
        controller: 'GatewayCtrl',
      })

      .when('/reload', {
        templateUrl: 'views/reload.html',
      })      

      // Default
      .otherwise({
        redirectTo: '/gateway'
      });


  }])


  .run(['$location', '$rootScope', function ($location, $rootScope) {

    var host, app, params, sender, isWebPart = true;

    try {
      params = parseQueryString();
      host = params.SPHostUrl[0];
      app = params.SPAppWebUrl[0];
      sender = params.SenderId[0];
    } catch(e) {
      params = $location.search();
      host = params.SPHostUrl;
      app = params.SPAppWebUrl;
      sender = params.SenderId;
      isWebPart = false;
    }

    $rootScope.sp = {
      host: host,
      app: app, 
      sender: sender,
      isWebPart: isWebPart,
    };

    $rootScope.isInitialize = false;


  }])


  .factory('SectionList', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Sections Rapports Parachem');
  }])


  .factory('CommentList', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Commentaires de rapport');
  }])


  .factory('ReportList', ['SharePoint', function (SharePoint) {
    return new SharePoint.API.List('Rapports de quart');
  }])




  .filter('periodPicker', [function () {
    return function (input) {
      return input === 'jour' ? 'Jour' : 'Nuit';
    };
  }])





  .filter('highlight', ['$sce', function($sce) {
    return function(text, phrase) {
      if (phrase) {
        text = text.replace(new RegExp('('+phrase+')', 'gi'), '<span class="highlighted">$1</span>');
      }
      return $sce.trustAsHtml(text);
    };
  }]);












