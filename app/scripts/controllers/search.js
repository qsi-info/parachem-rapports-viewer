'use strict';

/**
 * @ngdoc function
 * @name AngularSharePointApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the AngularSharePointApp
 */
 /*global $:false */
 /*global moment:false */

angular.module('AngularSharePointApp').controller('SearchCtrl', ['$rootScope', '$location', '$scope', 'ReportList', 'cfpLoadingBar', 'CommentList', 'SectionList', '$routeParams', function ($rootScope, $location, $scope, ReportList, cfpLoadingBar, CommentList, SectionList, $routeParams) {

	if (typeof $rootScope.isInitialize === 'undefined' || !$rootScope.isInitialize) {
		return $location.path('/gateway');
	}


	$scope.reportType = $routeParams.type.toUpperCase();
	$scope.title = $scope.reportType === 'UO' ? 'Unités d\'opération' : 'Services auxiliaires';

	SectionList.find('$filter=ReportType eq \'' + $scope.reportType + '\'').then(function (sections) {
		$scope.sections = sections;
	});



	var now = moment();

	var datepicker = $('.datepicker').datepicker({
		language: 'fr',
		todayHighlight: true,
		format: 'yyyy-mm-dd',
		autoclose: true,
	});

	datepicker.on('changeDate', function (e) {
		cfpLoadingBar.start();

		$scope.notFound = false;
		$scope.comments = [];
		$scope.results = [];
		$scope.searchContext = '';

		var rDate = moment(e.date).format();
		var tDate = moment(e.date).add(1, 'days').format();

		var filter = '$filter=(ReportType eq \''+ $scope.reportType + '\' and Modified ge datetime\'' + rDate + '\' and Modified le datetime\'' + tDate + '\' and IsActive eq 0)';
		var select = '$select=Id,Created,Team,Period,Modified,Author/Id,Author/Title&$expand=Author';

		ReportList.find(filter + '&' + select).then(function (results) {
			$scope.results = results;
			if (results.length < 1) {
				$scope.notFound = true;
			}
			cfpLoadingBar.complete();
		});		
	});

	datepicker.datepicker('setDate', now.format());

	$scope.back = function () {
		var currentDate = moment(datepicker.datepicker('getDate'));
		datepicker.datepicker('setDate', new Date(currentDate.subtract(1, 'days').format()));
	};


	$scope.foward = function () {
		var currentDate = moment(datepicker.datepicker('getDate'));
		datepicker.datepicker('setDate', new Date(currentDate.add(1, 'days').format()));
	};


	$scope.search = function () {
		var odataExpand = '$expand=Author,Report';
		var odataSelect = '$select=Author/Id,Author/Title,Report/Period,Report/Id,Report/Team,Report/Modified,Report/ReportType';
		var odataFilter = '$filter=substringof(\'' + $scope.searchContext + '\', Title) ';

		cfpLoadingBar.start();
		$scope.notFound = false;
		$scope.comments = [];
		$scope.results = [];

		CommentList.find(odataFilter + '&' + odataSelect + '&' + odataExpand).then(function (results) {

			$scope.results = [];

			var isFound;

			results.forEach(function (result) {

				isFound = false;

				for (var i=0, len = $scope.results.length; i < len; i++) {
					if (result.Report.Id === $scope.results[i].Id) {
						isFound = true;
						// console.log(result);
						break;
					}
				}


				if (!isFound && result.Report.ReportType === $scope.reportType.toLowerCase()) {
					$scope.results.push({
						Author: result.Author,
						Id: result.Report.Id,
						Team: result.Report.Team,
						Modified: result.Report.Modified,
						Period: result.Report.Period,
					});
				}

			});

			// $scope.results = results;


			if ($scope.results.length < 1) {
				$scope.notFound = true;
			}
			cfpLoadingBar.complete();			
		});
	};



	$scope.fetchComments = function (report) {
		var reportId = report.Id || report.Report.Id;
		var $collapseDiv = $('.collapse' + reportId);
		if ($collapseDiv.hasClass('in')) {
			$collapseDiv.collapse('hide');
		} else {
			cfpLoadingBar.start();
			$('.comment-collapse.in').collapse('hide');
			var odataSelect = '$select=Title,SectionId,ReportId';
			var odataFilter = '$filter=Report eq ' + reportId;
			CommentList.find(odataFilter + '&' + odataSelect).then(function (comments) {
				$scope.comments = comments;
				$collapseDiv.collapse('show');
				cfpLoadingBar.complete();
			});
		}
	};




}]);




