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
    var container = angular.module('graph.container', ['ngRoute', 'graph.documents', 'graph.graphs']);

    var rootController = function($rootScope, $scope, $window, $location, graphService) {

        $scope.window = $window;

        $scope.application_state = $window.APPLICATION_SATES.HOME;
        $scope.document_state = null;
        $scope.graph_state = null;

        $rootScope.current_document = null;
        $rootScope.current_graph = null;


        $scope.save_document = function() {
            $rootScope.$emit('graph.save_document');
        };

        $scope.create_document = function() {

            var new_doc = {'title': 'Document Created at ' + (new Date()).toGMTString()};

            graphService.newDocument(new_doc, function(resulting_doc) {

                $scope.application_state = $window.APPLICATION_SATES.EDIT_GRAPH;
                $rootScope.current_document = resulting_doc;
                $location.url('/documents/' + resulting_doc.id + '/edit');

            });
        };

        $scope.navigate_to = function(new_state) {
            switch(new_state) {
                case 'create_document':
                    console.log("about to create document...");
                    $scope.create_document();
                    break;
                case 'select_document':
                    $scope.application_state = $window.APPLICATION_SATES.MANAGE_DOCUMENT;
                    $location.url('/documents/');
                    break;
                case 'home':
                    $scope.application_state = $window.APPLICATION_SATES.HOME;
                    $location.url('/');
                    break;
            }
        };

        this.listeners = {
            'graph.select_document': $rootScope.$on('graph.select_document', function(event, data) {
                $scope.application_state = $window.APPLICATION_SATES.EDIT_GRAPH;
                $rootScope.current_document = data;
                $location.url('/documents/' + data.id + '/edit');
            }),
            'graph.set_state': $rootScope.$on('graph.set_state', function(event, data) {
                $scope.application_state = data;
            }),
            'graph.esc': $rootScope.$on('graph.esc', function(event, data) {
                $scope.navigate_to('home');
            })
        };

        $scope.$on('$destroy', this.listeners['graph.select_document']);
        $scope.$on('$destroy', this.listeners['graph.set_state']);
        $scope.$on('$destroy', this.listeners['graph.esc']);

    };

    var routeConfig = function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/templates/home.html'
            })
            .when('/documents/', {
                controller: 'documentController',
                templateUrl: '/templates/document.html'
            })
            .when('/documents/:document_id/edit', {
                controller: 'graphController',
                templateUrl: '/templates/graph.html'
            })
    };

    container.controller('rootController', ['$rootScope', '$scope', '$window', '$location', 'graphService', rootController]);
    container.config(['$routeProvider', routeConfig]);


})();