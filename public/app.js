'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'authService',
    'myApp.History',
    'myApp.SyncHistory',
    'myApp.Sync',
    'btford.markdown',
    'smart-table'
]).
config(['$locationProvider', '$routeProvider', '$httpProvider', function($locationProvider, $routeProvider, $httpProvider) {
    
    $httpProvider.interceptors.push('AuthInterceptor');
    
    $routeProvider
    .when('/', {
        redirectTo: '/history'
    })
    .when('/logout', {
        templateUrl: "modules/view1/view1.html",
        controller: "LogoutCtrl"
    })
    .otherwise({redirectTo: '/history'});
}])
.controller("MainCtrl", ['$window', '$scope', '$routeParams', '$location', 'Auth',
    
    function($window, $scope, $routeParams, $location, Auth) {
        
        $scope.userName = "";
        $scope.email = "";
        
        $scope.init = function(){
            if (!Auth.isLoggedIn()) {
                $window.location.href = '/login.html';
            } else {
                var userData = Auth.getUserData();
                $scope.userName = userData.name;
                $scope.email = userData.email;
            }
        }        
    }
                         
])
.controller("LogoutCtrl", ['$window', '$scope', '$routeParams', '$location', 'Auth',
    
    function($window, $scope, $routeParams, $location, Auth) {
        console.log("Entro a controler");
        Auth.logout();
        $window.location.href = '/login.html';
    }
                         
])
.run(function($rootScope, $window, $location){
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
});
