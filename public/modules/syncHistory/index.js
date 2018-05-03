(function(){
	'use strict';

	angular.module('myApp.SyncHistory', ['ngRoute'])

	.config(['$routeProvider', function($routeProvider) {
        $routeProvider
	    .when('/synchistory', {
            title: 'Sync Requests Log',
	        templateUrl: 'modules/syncHistory/views/index.html',
            controller: 'SyncHistoryController'
        })
        ;
	}])
	.controller('SyncHistoryController', SyncHistoryController)
    .factory('SyncHistoryService', SyncHistoryService)
	;
    
    function SyncHistoryController($scope, $http, $window, SyncHistoryService){
        
        SyncHistoryService.getRequestsHistory()
        .success(function(data){
            console.log('Requests:', data.rows);            
            $scope.rowCollection = data.rows;
            
        }).error(function(status){
            console.log('Se presentó un error al iniciar sesión ' + status);
        });

	}
    
    function SyncHistoryService($http){
        var syncHistoryService = {};
        
        syncHistoryService.getRequestsHistory = function() {
            return $http.get('/api/v1/history/syncrequests', { cache: true })
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
        
        return syncHistoryService;
    }

	SyncHistoryController['$inject'] = ['$scope', '$http', '$window', 'SyncHistoryService'];
    SyncHistoryService['$inject'] = ['$http'];

}());