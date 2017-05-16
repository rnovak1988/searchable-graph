(function() {

    var VIS_CONTAINER_ID = 'graph-container';

    var ANGULAR = angular.module('graph.editor', []);

    function Vis() {

        var _this = this;

        this.current = null;

        this.container = document.getElementById(VIS_CONTAINER_ID);

        this.data = {
            nodes: new vis.DataSet([]),
            edges: new vis.DataSet([]),
            tags: new vis.DataSet([])
        };

        this.options = {
            interaction: {
                selectConnectedEdges: false
            },
            manipulation: {
                enabled: true,
                deleteNode: function(data, callback) {

                    data.nodes.forEach(function(nodeId) {
                         _this.current.removed_nodes.push(nodeId);
                    }, _this);

                    data.edges.forEach(function(edgeId) {
                        _this.current.removed_edges.push(edgeId);
                    });

                    _this.listeners.forEach(function(handler) {
                        if (handler.name === 'deselectNode') {
                            handler.fn.apply(handler.context, [null]);
                        }
                    });

                    callback(data);
                },
                deleteEdge: function(data, callback) {

                    data.edges.forEach(function(edgeId) {
                        _this.current.removed_edges.push(edgeId);
                    });

                    callback(data);
                }
            },
            physics: {
                enabled: true
            }
        };

        this.listeners = [];

        this.handle = new vis.Network(this.container, this.data, this.options);

    }

    Vis.prototype.load = function(document, graph) {
        var _this = this;

        if (document !== undefined && document !== null && document instanceof Document &&
            graph !== undefined && graph !== null && graph instanceof Graph) {

            this.sync();
            this.empty();

            this.current = graph.current;

            if (!this.current.hasOwnProperty('removed_nodes'))
                this.current.removed_nodes = [];


            if (!this.current.hasOwnProperty('removed_edges'))
                this.current.removed_edges = [];

            this.data.nodes.add(this.current.nodes);
            this.data.edges.add(this.current.edges);
            this.data.tags.add(this.current.tags);


        }
    };

    Vis.prototype.fit = function() {
        this.handle.fit();
    };

    Vis.prototype.listen = function(_this, name, listener) {
        this.handle.on(name, function(event) {
            listener.apply(_this, arguments);
        });
        this.listeners.push({name: name, fn: listener, context: _this});
    };

    Vis.prototype.destroy = function() {
        this.listeners.forEach(function(map) {
            this.handle.off(map.name, map.fn);
        }, this);
    };

    Vis.prototype.clear = function() {
        try {
            this.handle.unselectAll();
            this.handle.disableEditMode();
        } catch(e) {
            console.log(e);
        }
    };

    Vis.prototype.empty = function() {
        this.data.nodes.clear();
        this.data.edges.clear();
        this.data.tags.clear();
    };

    Vis.prototype.sync = function() {

        if (this.current !== null) {

            this.current.nodes = this.data.nodes.get();
            this.current.edges = this.data.edges.get();
            this.current.tags = this.data.tags.get();

        }

    };

    function Document() {

        this.current = {
            id      : null,
            title   : null,
            graphs  : null,
            removed_nodes: [],
            removed_edges: []
        };

    }

    Document.prototype.import = function(data) {

        if (data !== undefined && data !== null &&
            data.hasOwnProperty('id') &&
            data.hasOwnProperty('title') &&
            data.hasOwnProperty('graphs') &&
            data['graphs'] instanceof Array) {

            this.current.id = parseInt(data.id);
            this.current.title = data.title;
            this.current.graphs = data.graphs;

            if (this.current.graphs.length < 1) {
                this.current.graphs.push(
                    Graph.newGraph()
                );
            }

        }

    };

    Document.prototype.save = function(service, vis) {

        if (this.current !== undefined && this.current !== null &&
            this.current.hasOwnProperty('id') &&
            this.current.hasOwnProperty('title') &&
            this.current.hasOwnProperty('graphs')) {

            vis.sync();

            service.save(this.current, this.current.graphs, function(data) {
                console.log(data);
            }, function(err) {
                console.log(err);
            });

        }
    };

    function Graph() {

        this.index = null;
        this.current = null;

    }

    Graph.newGraph = function() {
        return {
            id: vis.util.randomUUID(),
            nodes: [],
            edges: [],
            tags: [],
            removed_nodes: [],
            removed_edges: []
        };
    };

    Graph.prototype.import = function(document, index) {

        if (document !== undefined && document !== null && document instanceof Document &&
            index !== undefined && index !== null) {

            if (this.index !== null && this.current !== null)
                document.current.graphs[this.index] = this.current;

            this.index = index;
            this.current = document.current.graphs[index];

        }
    };

    Graph.prototype.add = function(document) {
        if (document !== undefined && document !== null && document instanceof Document) {
            document.current.graphs.push(
                Graph.newGraph()
            );

            return document.current.graphs.length - 1;
        }
    };

    function Node() {

        this.current = null;

        this.shapes = [
            'box',
            'square',
            'database',
            'circle',
            'ellipse',
            'text'
        ];

        this.defaults = {
            shape: this.shapes[0]
        };

    }

    Node.prototype.select = function(event, scope, window) {

        if (this.current !== null)
            this.update(event, scope, window);

        this.current = scope.vis.data.nodes.get(event.nodes[0]);

        scope.state = window.GRAPH_STATE.EDIT_NODE;

    };

    Node.prototype.update = function(event, scope, window) {

        if (this.current !== null) {

            scope.vis.data.nodes.update(this.current);
            this.current = null;

            if (scope.state === window.GRAPH_STATE.EDIT_NODE)
                scope.state = window.GRAPH_STATE.BASE;
        }

    };

    function Edge() {

        this.current = null;

    }

    Edge.prototype.select = function(event, scope, window) {

        if (this.current !== null)
            this.update(event, scope, window);

        this.current = scope.vis.data.edges.get(event.edges[0]);

        scope.state = window.GRAPH_STATE.EDIT_EDGE;

    };

    Edge.prototype.update = function(event, scope, window) {

        console.log('in edge update');

        if (this.current !== null) {
            scope.vis.data.edges.update(this.current);
            this.current = null;

            if (scope.state === window.GRAPH_STATE.EDIT_EDGE)
                scope.state = window.GRAPH_STATE.BASE;

        }

    };

    function Controller ($scope, $rootScope, $route, $window, $timeout, $service) {

        var _this = this;

            // aliases for angular objects
        this.angular = {
            root    :  $rootScope,
            scope   :  $scope,
            window  :  $window,
            service :  $service,
            timeout :  $timeout
        };

        this.angular.scope.GRAPH_STATE  = this.angular.window.GRAPH_STATE;

        this.angular.scope.state        = this.angular.window.GRAPH_STATE.BASE;

        this.angular.scope.vis          = new Vis();
        this.angular.scope.document     = new Document();
        this.angular.scope.graph        = new Graph();
        this.angular.scope.node         = new Node();
        this.angular.scope.edge         = new Edge();

        this.mappings = {
            'getTabClass': _this.getTabClass,
            'selectGraph': _this.selectGraph,
            'addNewGraph': _this.addNewGraph
        };

        this.handlers = {
            'vis': [
                {
                    event: 'selectNode',
                    ref: this.angular.scope.node.select,
                    args: [
                        this.angular.scope, this.angular.window
                    ],
                    context: this.angular.scope.node
                },
                {
                    event: 'deselectNode',
                    ref: this.angular.scope.node.update,
                    args: [
                        this.angular.scope, this.angular.window
                    ],
                    context: this.angular.scope.node
                },
                {
                    event: 'selectEdge',
                    ref: this.angular.scope.edge.select,
                    args: [
                        this.angular.scope, this.angular.window
                    ],
                    context: this.angular.scope.edge
                },
                {
                    event: 'deselectEdge',
                    ref: this.angular.scope.edge.update,
                    args: [
                        this.angular.scope, this.angular.window
                    ],
                    context: this.angular.scope.edge
                }
            ],
            'angular': [
                {
                    event: 'graph.save_document',
                    listener: function(event, data) {
                        _this.angular.scope.document.save(_this.angular.service, _this.angular.scope.vis);
                    },
                    handle: null
                }
            ]
        };

        this.__initialize($route);
        this.__initializeVis();

        this.angular.scope.$on('$destroy', function() {
            _this.angular.scope.vis.destroy();
        });

    }

    Controller.prototype.__initialize = function(route) {

        var _this = this;
        var root = this.angular.root;

        if (root.current_document !== undefined && root.current_document !== null) {

            this.import(root.current_document);

        } else if (route.current.params.hasOwnProperty('document_id')) {

            var id = parseInt(route.current.params['document_id']);

            this.angular.service.load(id, function(data) {

                _this.import(data);

                _this.reset(data);

            }, function(err) {

                console.log(err);

                root.$emit('graph.esc');

            });

        }

        Object.keys(_this.mappings).forEach(function(key) {
           _this.angular.scope[key] = function() {
               return _this.mappings[key].apply(_this, arguments);
           };
        });


        this.handlers.angular.forEach(function(handler) {
            handler.handle = _this.angular.root.$on(handler.event, handler.listener);
            _this.angular.scope.$on('$destroy', handler.handle);
        }, this);


    };

    Controller.prototype.__initializeVis = function() {

        var _this = this;

        this.handlers.vis.forEach(function(handler) {

            var metaHandler = function(event) {

                handler.ref.apply(handler.context, [event].concat(handler.args));

                _this.angular.timeout();

            };

            _this.angular.scope.vis.listen(_this, handler.event, metaHandler);


        });

    };

    Controller.prototype.import = function(doc) {
        this.angular.scope.document.import(doc);

        this.angular.scope.graph.import(this.angular.scope.document, 0);

        this.angular.scope.vis.load(
            this.angular.scope.document,
            this.angular.scope.graph
        );

    };

    Controller.prototype.getTabClass = function(index) {
        if (this.angular.scope.graph.index === index) {
            return 'active';
        }
        return '';
    };

    Controller.prototype.reset = function(document) {

        this.angular.root.current_document = document;
        this.angular.root.$emit('graph.set_state', this.angular.window.APPLICATION_SATES.EDIT_GRAPH);

    };

    Controller.prototype.selectGraph = function(index) {
        if (index !== undefined && index !== null && this instanceof Controller) {
            if (index !== this.angular.scope.graph.index) {

                this.angular.scope.graph.import(this.angular.scope.document, index);

                this.angular.scope.vis.load(this.angular.scope.document, this.angular.scope.graph);

                this.angular.scope.vis.fit();
            }
        }
    };

    Controller.prototype.addNewGraph = function() {

        var index = this.angular.scope.graph.add(this.angular.scope.document);

        if (index !== undefined && index !== null) {
            this.selectGraph(index);
        }

    };


    function Service($http) {
        this.http = $http;
    }

    Service.prototype.load  = function(id, callback, errorCallback) {
        var _this = this;
        this.http.get('/documents/' + id + '.json').then(function(successResponse) {
            callback.call(_this, successResponse.data);
        }, function(errorResponse) {
            if (errorCallback !== undefined && errorCallback !== null && typeof(errorCallback) === 'function') {
                errorCallback.call(_this, errorResponse);
            }
        });
    };

    Service.prototype.save  = function(unsaved_document, unsaved_graphs, successCallback, errorCallback) {
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
                        tags: [],
                        removed_nodes: [],
                        removed_edges: []
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

                        if (graph.hasOwnProperty('removed_edges')) {
                            graph.removed_edges.forEach(function(edge_id) {
                                transfer_object.removed_edges.push(edge_id);
                            });
                        }

                        if (graph.hasOwnProperty('removed_nodes')) {
                            graph.removed_nodes.forEach(function(node_id) {
                                transfer_object.removed_nodes.push(node_id);
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

    Service.prototype.new   = function(document, successCallback, errorCallback) {
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

    ANGULAR.service('graphService', ['$http', Service]);
    ANGULAR.controller('graphController', ['$scope', '$rootScope', '$route', '$window', '$timeout', 'graphService', Controller]);


})();