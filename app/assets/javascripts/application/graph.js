/**
 * Code for the Graph editing functionality
 */

(function() {

    var graphModule = angular.module('graph.graphs', []);

    var graphController = function($rootScope, $scope, $route, $location, $window, $timeout, graphService) {

        $scope.window = $window;
        $scope.editor_state = $window.GRAPH_STATE.BASE;

        $scope.current_node = null;
        $scope.current_edge = null;

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
            },
            listeners: {
                'selectNode': function (event) {
                    if ($scope.editor_state === $window.GRAPH_STATE.BASE) {
                        $scope.editor_state = $window.GRAPH_STATE.EDIT_NODE;
                        $scope.current_node = $scope.graph.data.nodes.get(event.nodes[0]);

                        $timeout();
                    }
                },
                'deselectNode': function (event) {
                    if ($scope.editor_state === $window.GRAPH_STATE.EDIT_NODE) {
                        $scope.editor_state = $window.GRAPH_STATE.BASE;
                        $scope.graph.data.nodes.update($scope.current_node);
                        $scope.current_node = null;

                        $timeout();
                    }
                },
                'selectEdge': function (event) {
                    if ($scope.editor_state === $window.GRAPH_STATE.BASE) {
                        $scope.editor_state = $window.GRAPH_STATE.EDIT_EDGE;
                        $scope.current_edge = $scope.graph.data.edges.get(event.edges[0]);

                        $timeout();
                    }
                },
                'deselectEdge': function (event) {
                    if ($scope.editor_state === $window.GRAPH_STATE.EDIT_EDGE) {
                        $scope.editor_state = $window.GRAPH_STATE.BASE;
                        $scope.graph.data.edges.update($scope.current_edge);
                        $scope.current_edge = null;

                        $timeout();
                    }
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

                var listeners = $scope.graph.listeners;
                var events = Object.keys(listeners);

                console.log(listeners);
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];
                    var listener = listeners[event];
                    $scope.graph.network.on(event, listener);
                }

                /**
                 * when destroyed, remove event listeners from the graph
                 */
                $scope.$on('$destroy', function() {
                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        $scope.graph.network.off(event, listeners[event]);
                    }
                });

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

        $scope.select_graph = function(index) {
            var current_index = $scope.graph.index;
            var current_graph = $scope.graphs[current_index];

            if (current_graph !== undefined && current_graph !== null) {
                current_graph.nodes = $scope.graph.data.nodes.get();
                current_graph.edges = $scope.graph.data.edges.get();
            }

            var next_graph = $scope.graphs[index];

            if (next_graph !== undefined && next_graph !== null) {
                $scope.graph.data.nodes.clear();
                $scope.graph.data.edges.clear();

                $scope.graph.index = index;
                $scope.graph.data.nodes.add(next_graph.nodes);
                $scope.graph.data.edges.add(next_graph.edges);

                $rootScope.current_graph = next_graph;
            }
        };

        $scope.add_graph = function() {
            var length = $scope.graphs.length;

            var new_graph = {
                id: 'new-graph ' + length,
                nodes: [],
                edges: []
            };

            $scope.graphs.push(new_graph);

            $scope.select_graph(length);
        };

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
                                label: edge.label,
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

    graphService.prototype.newDocument = function(document, successCallback, errorCallback) {
        console.log("in newDocument...");
        var _this = this;
        if (document !== undefined && document !== null && document.hasOwnProperty('title')) {
            _this.http.post('/documents.json', document).then(function(successResponse) {
                if (successCallback !== undefined && successCallback !== null) {
                    successCallback.call(_this, successResponse.data);
                }
            }, function(errorResponse) {
                console.log(errorResponse.statusText);
            });
        }
    };

    graphModule.service('graphService', ['$http', graphService]);
    graphModule.controller('graphController', ['$rootScope', '$scope', '$route', '$location', '$window', '$timeout', 'graphService', graphController]);

})();