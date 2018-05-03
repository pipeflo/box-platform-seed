'use strict';

// Declare app level module which depends on views, and components
angular.module('loginApp', [
    'ngRoute',
    'authService'
]).
config(['$locationProvider', '$routeProvider', '$httpProvider', function($locationProvider, $routeProvider, $httpProvider) {
    
    $routeProvider
    .when('/', {
        redirectTo: '/login'
    })
    .otherwise({redirectTo: '/login'});
}])
.controller("LoginCtrl", ['$window', '$scope', '$routeParams', '$location', 'Auth',
    
    function($window, $scope, $routeParams, $location, Auth) {
        
        $scope.username = '';
        $scope.password = '';
        $scope.error = false;
        
        $scope.login = function(){
            var basicAuth = btoa($scope.username+":"+$scope.password).toString('base64');
            Auth.login(basicAuth)
            .success(function(){
                console.log("Logeo ahora ir a Index.html");
                $window.location.href = '/index.html';
            }).error(function(status){
                $scope.error = true;
                console.log("Error:", $scope.error);
            });
        }
        
        $scope.init = function(){
            if (Auth.isLoggedIn()) {
                $window.location.href = '/index.html';
            }        
        }
    }
                         
])
.run(function($rootScope, $window, $location){    
});
