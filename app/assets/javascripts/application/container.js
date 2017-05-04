/**
 * This file contains the logic for the main routing of the application, essentially the "wrapper UI" that sits on-top
 * of everything else. Documents and Graph modules are their own components that exist separately
 */

//= require application/common
//= require application/graph
//= require application/document
//= require_self

(function() {

    /**
     * The container is the root of the application, and handles event propogation
     * @type {angular.Module}
     */
    var container = angular.module('graph.container', ['ngRoute']);

    var rootController = function($rootScope, $scope, $window) {

        $scope.window = $window;

        $scope.application_state = $window.APPLICATION_SATES.HOME;
        $scope.document_state = null;
        $scope.graph_state = null;

        $rootScope.current_document = null;
        $rootScope.current_graph = null;

    };

    var routeConfig = function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/templates/home.html'
            })
            .when('/document/', {
                templateUrl: '/templates/document.html'
            });
    };

    container.controller('rootController', ['$rootScope', '$scope', '$window', rootController]);
    container.config(['$routeProvider', routeConfig]);


})();