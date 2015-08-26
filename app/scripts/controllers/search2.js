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

angular.module('AngularSharePointApp').controller('SearchCtrl', 
	['$rootScope', '$location', '$scope', 'ReportList', 'cfpLoadingBar', 'CommentList', 'SectionList', '$routeParams', 'Utils',
	function ($rootScope, $location, $scope, ReportList, cfpLoadingBar, CommentList, SectionList, $routeParams, Utils) {

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
		$scope.reports = [];
		$scope.searchContext = '';

		var rDate = moment(e.date).format();
		var tDate = moment(e.date).add(1, 'days').format();

		var filter = '$filter=(ReportType eq \''+ $scope.reportType + '\' and Created ge datetime\'' + rDate + '\' and Created le datetime\'' + tDate + '\' and IsActive eq 0)';
		var select = '$select=Id,Created,Team,Period,Author/Id,Author/Title&$expand=Author';

		ReportList.find(filter + '&' + select).then(function (results) {
			$scope.reports = results;
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
		var odataSelect = '$select=Author/Id,Author/Title,Report/Period,Report/Id,Report/Team,Report/Created,Report/ReportType';
		var odataFilter = '$filter=substringof(\'' + $scope.searchContext + '\', Title) and Report/ReportType eq \'' + $scope.reportType.toLowerCase() + '\'';
		var odataOrder  = '$orderby=Created desc';

		cfpLoadingBar.start();
		$scope.notFound = false;
		$scope.comments = [];
		$scope.reports = [];

		CommentList.find(odataFilter + '&' + odataSelect + '&' + odataExpand + '&' + odataOrder).then(function (reports) {

			$scope.reports = [];

			var isFound;

			reports.forEach(function (result) {

				isFound = false;

				for (var i=0, len = $scope.reports.length; i < len; i++) {
					if (result.Report.Id === $scope.reports[i].Id) {
						isFound = true;
						// console.log(result);
						break;
					}
				}


				if (!isFound && result.Report.ReportType === $scope.reportType.toLowerCase()) {
					$scope.reports.push({
						Author: result.Author,
						Id: result.Report.Id,
						Team: result.Report.Team,
						Created: result.Report.Created,
						Period: result.Report.Period,
					});
				}

			});

			// $scope.reports = reports;


			if ($scope.reports.length < 1) {
				$scope.notFound = true;
			}
			cfpLoadingBar.complete();			
		});
	};





	$scope.openRapportEvenements = function (reportId) {
		var url = 'http://paradevsrv02/reportserver?/rapportsquart/rapportevenements&rs:Command=Render&rc:Toolbar=true&report='.concat(reportId);
		Utils.popupWindow(url, 1000, 800);
	};


	$scope.openRapportLignes = function (reportId) {
		var url = 'http://paradevsrv02/reportserver?/rapportsquart/rapportlignes&rs:Command=Render&rc:Toolbar=true&report='.concat(reportId);
		Utils.popupWindow(url, 1000, 800);
	};


	$scope.openRendementUsine = function (idx) {
		var startTime = calculateStartTime($scope.reports[idx]);
		var endTime = startTime + 12;
		var query = '?start_time=*-' + startTime + 'h&end_time=*-' + endTime + 'h';
		Utils.popupWindow('http://intranet/SitePages/2.0/PI/Trend2.aspx'.concat(query), 1000, 800);
	};

	$scope.openRendementUsine2 = function (idx) {
		var startTime = calculateStartTime($scope.reports[idx]);
		var endTime = startTime + 12;
		var query = '?start_time=*-' + startTime + 'h&end_time=*-' + endTime + 'h';
		Utils.popupWindow('http://intranet/SitePages/2.0/PI/Trend3.aspx'.concat(query), 1000, 800);
	};

	$scope.printComments = function (id) {
		var url = 'http://paradevsrv02/reportserver?/rapportsquart/commentaires&rs:Command=Render&rc:Toolbar=true&report=' + id + '&reporttype=' + $scope.reportType;
		Utils.popupWindow(url, 1000, 800);
	};



	var calculateStartTime = function (report) {
		var now = moment();
		var nbDays = now.diff(moment(new Date(report.Created)), 'days');
		var shiftStart = report.Period === 'jour' ? 6 : 18;
		if (report.Period === 'nuit') {
			nbDays++;
		}
		return (now.hour() - shiftStart) + (nbDays * 24);
	};



}]);




