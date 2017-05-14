/**
 * Code for the Graph editing functionality
 */

(function() {

    var graphModule = angular.module('graph.graphs', []);

    function GraphFactory() {

    }

    GraphFactory.newGraph = function() {
        return {
            id: vis.util.randomUUID(),
            nodes: [],
            edges: [],
            tags: []
        };
    };

    function Controller($scope, $rootScope, $route, $window, $timeout, graphService) {

        var THIS = $scope;
        var GRAPH_CONTAINER_ID = 'graph-container';

        this.window = $window;
        this.service = graphService;

        this.document = {
            id:     null,
            title:  null,
            graphs: []
        };

        this.editor = {
            current: {
                node: null,
                edge: null,
                tag: null
            },
            state: $window.GRAPH_STATE.BASE,
            vis: {
                index: null,
                container: document.getElementById(GRAPH_CONTAINER_ID),
                data: {
                    nodes: new vis.DataSet([]),
                    edges: new vis.DataSet([]),
                    tags: new vis.DataSet([])
                },
                options: {
                    manipulation: {
                        enabled: true
                    }
                },
                handle: null
            },
            constants: {
                shapes: [
                    'square',
                    'box',
                    'circle',
                    'text',
                    'ellipse',
                    'database'
                ],
                default: {
                    shape: 'box'
                }
            },
            options: {
                manipulation: {
                    enabled: true
                }
            },
            'eventHandlers': {
                'selectNode': function (event) {
                    if (THIS.editor.state === $window.GRAPH_STATE.BASE) {
                        console.log(THIS);

                        THIS.editor.state = $window.GRAPH_STATE.EDIT_NODE;

                        THIS.editor.current.node = THIS.editor.vis.data.nodes.get(event.nodes[0]);

                        $timeout();
                    }
                },
                'deselectNode': function (event) {
                    if (THIS.editor.state === $window.GRAPH_STATE.EDIT_NODE) {

                        THIS.editor.state = $window.GRAPH_STATE.BASE;

                        if (event === null) {
                            THIS.editor.vis.handle.unselectAll();
                        }

                        THIS.editor.vis.data.nodes.update(THIS.editor.current.node);
                        THIS.editor.current.node = null;

                        $timeout();
                    }
                },
                'selectEdge': function (event) {
                    if (THIS.editor.state === $window.GRAPH_STATE.BASE) {
                        THIS.editor.state = $window.GRAPH_STATE.EDIT_EDGE;
                        THIS.editor.current.edge = THIS.editor.vis.data.edges.get(event.edges[0]);
                        $timeout();
                    }
                },
                'deselectEdge': function (event) {
                    if (THIS.editor.state === $window.GRAPH_STATE.EDIT_EDGE) {

                        THIS.editor.state = $window.GRAPH_STATE.BASE;

                        if (event === null) {
                            THIS.editor.vis.handle.unselectAll();
                        }

                        THIS.editor.vis.data.edges.update(THIS.editor.current.edge);
                        THIS.editor.current.edge = null;

                        $timeout();
                    }
                }
            }

        };

        $scope.editor = this.editor;
        $scope.document = this.document;

        $scope.isActiveTab = function(graph) {

            var selected_graph = $rootScope.current_graph;
            if (selected_graph !== undefined && selected_graph !== null && selected_graph.hasOwnProperty('id')) {
                return graph.id === selected_graph.id ? 'active' : '';
            }
            return '';
        };

        $scope.graph_options = {
            'edit': function() {
                $scope.graph.overlay.visible = true;
            },
            'cancel': function() {
                $scope.graph.overlay.visible = false;
            }
        };

        this.__initializeVis($scope);

        this.__initialize($rootScope, $route, $window);

        this.$listeners = {
            'graph.save_document': $rootScope.$on('graph.save_document', function() {

                console.log("sdlkfjsdf");

            })
        };

        $scope.$on('$destroy', this.$listeners['graph.save_document']);

    }

    Controller.prototype.__initialize = function(root, route, window) {

        if (root.current_document !== undefined && root.current_document !== null) {
            this.__storeDocument(root.current_document);

            if (this.document.graphs.length > 0) {
                this.selectGraph(0);
            } else {
                this.addNewGraph();
            }
        } else {
            try {
                var document_id = parseInt(route.current.params['document_id']);

                if (document_id !== undefined && document_id !== null) {

                    var _this = this;
                    this.service.loadDocument(document_id, function(doc) {

                        root.current_document = doc;
                        root.$emit('graph.set_state', window.APPLICATION_SATES.EDIT_GRAPH);

                        _this.__storeDocument(doc);

                        if (_this.document.graphs.length > 0) {
                            _this.selectGraph(0);
                        } else {
                            _this.addNewGraph();
                        }

                    }, function(err) {
                        console.log(err);
                        root.$emit('graph.esc');
                    });

                }

            } catch (e) {
                console.log(e);
                root.$emit('graph.esc');
            }
        }
    };

    Controller.prototype.__initializeVis = function(scope) {
        var _this = this;

        this.editor.vis.handle = new vis.Network(
            this.editor.vis.container,
            this.editor.vis.data,
            this.editor.vis.options
        );

        var eventNames = Object.keys(this.editor.eventHandlers);
        var eventHandlers = this.editor.eventHandlers;

        for (var i = 0; i < eventNames.length; i++) {
            var eventName = eventNames[i];
            var handler = eventHandlers[eventName];

            this.editor.vis.handle.on(eventName, handler);
        }

        scope.$on('$destroy', function() {
            for (var i = 0; i < eventNames.length; i++) {
                var eventName = eventNames[i];
                _this.editor.vis.handle.off(eventName, eventHandlers[eventName]);
            }
        });

    };

    Controller.prototype.__storeDocument = function(doc) {
        if (doc !== undefined && doc !== null) {

            if (doc.hasOwnProperty('id')) {
                this.document.id = parseInt(doc.id);
            }

            if (doc.hasOwnProperty('title')) {
                this.document.title = doc.title;
            }

            if (doc.hasOwnProperty('graphs') && doc.graphs instanceof Array) {
                this.document.graphs = doc.graphs;
            }

        }
    };

    Controller.prototype.__storeGraph = function() {
        var index = this.editor.vis.index;

        if (index !== undefined && index !== null) {

            var graph = this.document.graphs[index];

            if (graph !== undefined && graph !== null) {

                graph.nodes = this.editor.vis.data.nodes.get();
                graph.edges = this.editor.vis.data.edges.get();
                graph.tags = this.editor.vis.data.tags.get();

            }
        }
    };

    Controller.prototype.__clearDataSets = function() {

        this.editor.vis.index = null;

        this.editor.vis.data.nodes.clear();
        this.editor.vis.data.edges.clear();
        this.editor.vis.data.tags.clear();

    };

    Controller.prototype.__loadGraph = function(index) {

        var graph = this.document.graphs[index];

        if (graph !== undefined && graph !== null) {

            this.editor.vis.index = index;

            if (graph.hasOwnProperty('nodes')) {
                this.editor.vis.data.nodes.add(graph.nodes);
            }

            if (graph.hasOwnProperty('edges')) {
                this.editor.vis.data.edges.add(graph.edges);
            }

            if (graph.hasOwnProperty('tags')) {
                this.editor.vis.data.tags.add(graph.tags);
            }

        }

    };

    Controller.prototype.selectGraph = function(index) {

        // store data from the current graph
        this.__storeGraph();

        // clear data sets
        this.__clearDataSets();

        // import new data

        if (index !== undefined && index !== null) {

            this.__loadGraph(index);

        }

    };

    Controller.prototype.addNewGraph = function() {

        this.document.graphs.push(GraphFactory.newGraph());

        this.selectGraph(this.document.graphs.length);

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
                        edges: [],
                        tags: []
                    };

                    for (var i = 0; i < unsaved_graphs.length; i++) {
                        var graph = unsaved_graphs[i];
                        var nodes = graph.nodes;
                        var edges = graph.edges;
                        var tags = graph.tags;

                        transfer_object.graphs.push({
                            id: graph.id
                        });

                        for (var node_index = 0; node_index < nodes.length; node_index++) {
                            var node = nodes[node_index];
                            transfer_object.nodes.push({
                                id: node.id,
                                graph_id: graph.id,
                                label: node.label,
                                shape: node.shape,
                                group: node.group
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

                        for (var tag_index = 0; tag_index < tags.length; tag_index++) {
                            var tag = tags[tag_index];
                            transfer_object.tags.push({
                                id: tag.id,
                                name: tag.name,
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
    graphModule.controller('graphController', ['$scope', '$rootScope', '$route', '$window', '$timeout', 'graphService', Controller]);

})();