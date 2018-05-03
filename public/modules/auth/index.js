(function(){
	'use strict';

	angular.module('authService', ['ngRoute'])
    
    .factory('Auth', function($http, $q, $window, AuthToken) {
        
        var authFactory = {};
        
        authFactory.login = function(code) {
            return $http.post('/api/v1/auth', {
                code: code
            })
            .success(function(data) {
                console.log("data:", data);
                AuthToken.setToken(data);
                return data;
            })
            .error(function(status){
                console.log("Error login in:", status);
                return status;
            });
        };
        
        authFactory.logout = function() {
            AuthToken.setToken();
        };
        
        authFactory.isLoggedIn = function() {
            if (AuthToken.getToken())
                return true;
            else
                return false;
        };
        
        authFactory.getUserData = function() {
            return AuthToken.getUserData();
        };
        
        return authFactory;
    })
    .factory('AuthToken', function($window) {
        
        var authTokenFactory = {};
        
        authTokenFactory.getToken = function() {
            return $window.localStorage.getItem('token');
        };
        
        authTokenFactory.getUserData = function() {
            return {"name": $window.localStorage.getItem('name'), "email": $window.localStorage.getItem('email')};
        };
        
        authTokenFactory.setToken = function(data) {
            if (data){
                $window.localStorage.setItem('token', data.token);
                $window.localStorage.setItem('name', data.userData.entry.displayName);
                $window.localStorage.setItem('email', data.userData.entry.emails[0].value);
            } else {
                $window.localStorage.removeItem('token');
                $window.localStorage.removeItem('name');
                $window.localStorage.removeItem('email');
            }
        };
        
        return authTokenFactory;
    })
    .factory('AuthInterceptor', function($q, $window, $location, AuthToken) {
        
        var interceptorFactory = {};
        
        interceptorFactory.request = function(config) {
            
            var token = AuthToken.getToken();
            
            if (token)
                config.headers['x-access-token'] = token;
            
            return config;
        };
        
        interceptorFactory.responseError = function(response) {
            
            console.log("ResponseError", response);
            
            if (response.status == 401) {
                AuthToken.setToken();
                $window.location.href = '/login.html';
            } else {
                return $q.reject(response);
            }
        };
        
        return interceptorFactory;
    });
}());