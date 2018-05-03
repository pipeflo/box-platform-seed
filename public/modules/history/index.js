(function(){
	'use strict';

	angular.module('myApp.History', ['ngRoute'])

	.config(['$routeProvider', function($routeProvider) {
        $routeProvider
	    .when('/history', {
            title: 'My Requests',
	        templateUrl: 'modules/history/views/index.html',
            controller: 'HistoryController'
        })
        ;
	}])
	.controller('HistoryController', HistoryController)
    .factory('HistoryService', HistoryService)
	;
    
    function HistoryController($scope, $http, $window, HistoryService){
        
        HistoryService.getJobsHistory()
        .success(function(data){
            console.log('Jobs:', data.rows);            
            $scope.rowCollection = data.rows;
            
        }).error(function(status){
            console.log('Se presentó un error al iniciar sesión ' + status);
        });

	}
    
    function HistoryService($http){
        var historyService = {};
        
        historyService.getJobsHistory = function() {
            return $http.get('/api/v1/history/jobs', { cache: true })
            .success(function(data) {
                return data;
            }).error(function(status){
                console.log(status);
            });
        };
        
        /*historyService.getCommunityStream = function(communityId) {
            return $http.get('/api/v1/activityStream/' + communityId)
            .success(function(data) {
                return data;
            }).error(function(status){
                console.log(status);
            });
        };*/
        
        return historyService;
    }

	HistoryController['$inject'] = ['$scope', '$http', '$window', 'HistoryService'];
    HistoryService['$inject'] = ['$http'];

}());