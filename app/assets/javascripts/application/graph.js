/**
 * Code for the Graph editing functionality
 */

(function() {

    var graphModule = angular.module('graph.graphs', []);

    var graphController = function($rootScope, $scope, $route, $location, $window, graphService) {

        $scope.graph = {
            index: null,
            container: document.getElementById('graph-container'),
            network: null,
            data: {
                nodes: new vis.DataSet([]),
                edges: new vis.DataSet([])
            },
            options: {
                manipulation: {
                    enabled: true
                }
            }
        };

        $scope.graphs = [];

        (function() {

            // create the initial network graph in the container in the graph.html template
            $scope.graph.network = new vis.Network($scope.graph.container, $scope.graph.data, $scope.graph.options);

            /**
             * take the current graph at $rootScope.current_graph add the data, and add it to the
             * graph
             */
            function draw_graph() {

                var current_graph = $rootScope.current_graph;

                if (current_graph !== null && current_graph !== undefined &&
                    current_graph.hasOwnProperty('nodes') &&
                    current_graph.hasOwnProperty('edges')) {

                    $scope.graph.data.nodes.add(current_graph.nodes);
                    $scope.graph.data.edges.add(current_graph.edges);

                }

            }

            /**
             * takes the graph in all_graphs, and pulls them into our alias locally, and then
             * sets the $rootScope.current_graph variable, and calls draw_graph (to add the data to the graph)
             *
             * @param all_graphs
             */
            function import_graphs(all_graphs) {
                if (all_graphs !== undefined && all_graphs !== null) {
                    for (var i = 0; i < all_graphs.length; i++) {
                        $scope.graphs.push(all_graphs[i]);
                    }
                    $rootScope.current_graph = $scope.graphs[0];
                    $scope.graph.index = 0;
                    draw_graph();
                }
            }

            /**
             * if the graphController is currently in scope, application state should currently be set to
             * APPLICATION_STATES.EDIT_GRAPH, which means a document should be set as the current document
             *
             * if the user has navigated here by the address bar, the current document needs to be determined by
             * the route parameters, and loaded via the graph_service, and then the appropriate variables in their
             * appropriate scopes should be re-defined so that the application is in a consistent state
             */
            var current_document = $rootScope.current_document;
            if (current_document !== undefined && current_document !== null) {

                import_graphs(current_document.graphs);

            } else {
                var route_params = $route.current.params;

                /**
                 * if the route parameters have the correct document_id parameter, try loading the document and getting
                 * the application into a consistent state. If that fails, just escape back to home
                 */
                if (route_params !== undefined && route_params !== null && route_params.hasOwnProperty('document_id')) {
                    var document_id = parseInt(route_params['document_id']);
                    graphService.loadDocument(document_id, function(document) {

                        $rootScope.current_document = document;
                        $rootScope.$emit('graph.set_state', $window.APPLICATION_SATES.EDIT_GRAPH);
                        import_graphs(document.graphs);

                    }, function(errorResponse) {
                        $rootScope.$emit('graph.esc');
                    });
                }

            }


        })();


        $scope.isActiveTab = function(graph) {

            var selected_graph = $rootScope.current_graph;
            if (selected_graph !== undefined && selected_graph !== null && selected_graph.hasOwnProperty('id')) {
                return graph.id === selected_graph.id ? 'active' : '';
            }
            return '';
        };

        this.listeners = {
            'graph.save_document': $rootScope.$on('graph.save_document', function() {

                var current_index = $scope.graph.index;

                $scope.graphs[current_index].nodes = $scope.graph.data.nodes.get();
                $scope.graphs[current_index].edges = $scope.graph.data.edges.get();

                graphService.saveDocument($rootScope.current_document, $scope.graphs, undefined, function(errorObj) {
                    console.log(errorObj);
                });
            })
        };

        $scope.$on('$destroy', this.listeners['graph.save_document']);

    };

    var graphService = function($http) {
        this.http = $http;
    };

    graphService.prototype.loadDocument = function(id, callback, errorCallback) {
        var _this = this;
        this.http.get('/documents/' + id + '.json').then(function(successResponse) {
            callback.call(_this, successResponse.data);
        }, function(errorResponse) {
            if (errorCallback !== undefined && errorCallback !== null && typeof(errorCallback) === 'function') {
                errorCallback.call(_this, errorResponse);
            }
        });
    };

    /**
     * to save the document, it has to be constructed from it's parts (document hasMany graphs (hasMany nodes, hasMany edges)
     * @param document
     * @param graphs
     * @param successCallback
     * @param errorCallback
     */
    graphService.prototype.saveDocument = function(unsaved_document, unsaved_graphs, successCallback, errorCallback) {
        var _this = this;
        if (unsaved_document !== undefined && unsaved_document !== null) {
            if (unsaved_graphs !== undefined && unsaved_graphs !== null) {
                try {
                    var transfer_object = {
                        id: unsaved_document.id,
                        title: unsaved_document.title,
                        graphs: [],
                        nodes: [],
                        edges: []
                    };

                    for (var i = 0; i < unsaved_graphs.length; i++) {
                        var graph = unsaved_graphs[i];
                        var nodes = graph.nodes;
                        var edges = graph.edges;

                        transfer_object.graphs.push({
                            id: graph.id
                        });

                        for (var node_index = 0; node_index < nodes.length; node_index++) {
                            var node = nodes[node_index];
                            transfer_object.nodes.push({
                                id: node.id,
                                graph_id: graph.id,
                                label: node.label
                            });
                        }

                        for (var edge_index = 0; edge_index < edges.length; edge_index++) {
                            var edge = edges[edge_index];
                            transfer_object.edges.push({
                                id: edge.id,
                                from: edge.from,
                                to: edge.to,
                                graph_id: graph.id
                            });
                        }

                    }

                    _this.http.put('/documents/' + transfer_object.id, {'document': transfer_object}).then(
                        function(successResponse) {
                            console.log(successResponse);
                        },
                        function(errorResponse) {
                            console.log(errorResponse);
                        }
                    );

                } catch (e) {
                    if (errorCallback !== undefined && errorCallback !== null && typeof(errorCallback) === 'function') {
                        errorCallback.call(_this, {'error': e});
                    }
                }
            }
        }
    };

    graphModule.service('graphService', ['$http', graphService]);
    graphModule.controller('graphController', ['$rootScope', '$scope', '$route', '$location', '$window', 'graphService', graphController]);

})();