"use strict";
var nameSpace = angular.module("CepaveApp", []);
nameSpace.controller(
	"DataController", ['$scope','$http', '$window', function($scope, $http, $window)
		{
			$http.get('http://localhost/alive').success(
				function(data) {
					console.log('data =', data);
					$scope.hosts = data.result;
					$scope.time = data.time;
				}
			);
			$http.get('http://localhost/getUrl').success(
				function(url) {
					$scope.url = JSON.parse(url);
				}
			);
			$scope.show = function() {
				$scope.show_desc = true;
				$scope.hostname = this.host.hostname;
				$scope.status = this.host.status;
				$scope.agent = this.host.agent_version;
			};
			$scope.hide = function() {
				$scope.show_desc = false;
				$scope.hostname = null;
				$scope.status = null;
				$scope.agent = null;
			};
			$scope.overview = function() {
				var url = $scope.url + this.host.hostname;
				$window.location.href = url;
			};
		}
	]
);
