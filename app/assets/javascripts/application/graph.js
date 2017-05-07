/**
 * Code for the Graph editing functionality
 */

(function() {

    var graphModule = angular.module('graph.graphs', []);

    var graphController = function($rootScope, $scope, $route, $location, $window, graphService) {

        $scope.graph_container = document.getElementById('graph-container');

        $scope.graphs = [];

        $scope.drawGraph = function() {
            var current = $rootScope.current_graph; // alias to root scope, a lot to keep typing
            if (current !== undefined && current !== null &&
                current.hasOwnProperty('edges') &&
                current.hasOwnProperty('nodes')) {

                var data = {
                    nodes: new vis.DataSet(current.nodes),
                    edges: new vis.DataSet(current.edges)
                };

                var options = {

                };

                $scope.network = new vis.Network($scope.graph_container, data, options);
            }
        };

        if ($rootScope.current_document !== undefined && $rootScope.current_document !== null) {
            var importGraphs = $rootScope.current_document.graphs;
            console.log(importGraphs);
            for (var i = 0; i < importGraphs.length; i++) {
                $scope.graphs.push(importGraphs[i]);
            }
            $rootScope.current_graph = $scope.graphs[0];
            $scope.drawGraph();

        } else {
            var params = $route.current.params;
            if (params !== undefined && params !== null && params.hasOwnProperty('document_id')){
                try {
                    var document_id = parseInt(params['document_id']);
                    graphService.loadDocument(document_id, function(document) {
                        $rootScope.current_document = document;
                        var importGraphs = document.graphs;
                        for (var i = 0; i < importGraphs.length; i++) {
                            $scope.graphs.push(importGraphs[i]);
                        }
                        $rootScope.current_graph = $scope.graphs[0];
                        $rootScope.$emit('graph.set_state', $window.APPLICATION_SATES.EDIT_GRAPH);

                        $scope.drawGraph();
                    });
                } catch (e) {
                    console.log(e);
                }
            } else {
                $rootScope.$emit('graph.esc');
            }
        }


        $scope.isActiveTab = function(graph) {

            var selected_graph = $rootScope.current_graph;
            if (selected_graph !== undefined && selected_graph !== null && selected_graph.hasOwnProperty('id')) {
                return graph.id === selected_graph.id ? 'active' : '';
            }
            return '';
        };

    };

    var graphService = function($http) {
        this.http = $http;
    };

    graphService.prototype.loadDocument = function(id, callback) {
        var _this = this;
        this.http.get('/documents/' + id + '.json').then(function(successResponse) {
            callback.call(_this, successResponse.data);
        }, function(errorResponse) {

        });
    };

    graphModule.service('graphService', ['$http', graphService]);
    graphModule.controller('graphController', ['$rootScope', '$scope', '$route', '$location', '$window', 'graphService', graphController]);

})();