(function() {

    var VIS_CONTAINER_ID = 'graph-container';

    var ANGULAR = angular.module('graph.editor', []);

    function Vis() {

        var _this = this;

        this.current = null;

        this.defaultGroups = null;

        this.container = document.getElementById(VIS_CONTAINER_ID);

        this.data = {
            nodes: new vis.DataSet([]),
            edges: new vis.DataSet([]),
            tags: new vis.DataSet([]),
            clusters: new vis.DataSet([])
        };

        this.options = {
            interaction: {
                selectConnectedEdges: false
            },
            manipulation: {
                enabled: true,
                deleteNode: function(data, callback) {

                    var removed = {};

                    data.nodes.forEach(function(nodeId) {
                         _this.current.removed_nodes.push(nodeId);
                        removed[nodeId] = true;
                    }, _this);

                    var edges = _this.data.edges.get({
                        filter: function(e) {
                            return (removed[e.from] === true) || (removed[e.to] === true);
                        }
                    });

                    _this.listeners.forEach(function(handler) {
                        if (handler.name === 'deselectNode') {
                            handler.fn.apply(handler.context, [null]);
                        }
                    });

                    callback(data);

                    edges.forEach(function(edge) {
                        _this.data.edges.remove(edge);
                        _this.current.removed_edges.push(edge.id);
                    });

                },
                deleteEdge: function(data, callback) {

                    data.edges.forEach(function(edgeId) {
                        _this.current.removed_edges.push(edgeId);
                    });

                    _this.listeners.forEach(function(handler) {
                        if (handler.name === 'deselectEdge') {
                            handler.fn.apply(handler.context, [null]);
                        }
                    });

                    callback(data);
                }
            },
            layout: {
                randomSeed: 8
            },
            physics: {
                enabled: true
            }
        };

        this.listeners = [];

        this.handle = new vis.Network(this.container, this.data, this.options);

        this.resetGroups = function() {
            _this.__resetGroups();
        };

        this.syncGroups = function() {
            _this.__syncGroups();
        };

        this.syncClusters = function() {
            return _this.__syncClusters.apply(_this, arguments);
        };

        this.syncCluster = function() {
            return _this.__syncCluster.apply(_this, arguments);
        }

        this.updateCluster = function() {
            _this.__updateCluster.apply(_this, arguments);
        };

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

            var data = {
                nodes: new vis.DataSet(this.current.nodes),
                edges: new vis.DataSet(this.current.edges),
                tags: new vis.DataSet([]),
                clusters: new vis.DataSet([])
            };

            this.data = data;
            this.handle.setData(this.data);
            this.data.tags.add(this.current.tags);

            this.syncGroups();
            this.syncClusters();

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
        this.data.clusters.clear();
    };

    Vis.prototype.sync = function() {

        if (this.current !== null) {

            this.handle.storePositions();

            this.current.nodes = this.data.nodes.get();
            this.current.edges = this.data.edges.get();

        }

    };

    Vis.prototype.__syncGroups = function() {

        var _this = this;

        var options = {groups: {}};

        if (this.current !== null && this.current.tags !== undefined && this.current.tags !== null) {
            this.current.tags.forEach(function(tag) {
                ['color', 'shape'].forEach(function(property) {
                   if (tag.hasOwnProperty(property) && tag[property] !== undefined && tag[property] !== null) {
                       if (!options.groups.hasOwnProperty(tag.id)) options.groups[tag.id] = {};

                       options.groups[tag.id][property] = tag[property];
                   }
                });


                if (tag.hasOwnProperty('_icon') && tag._icon !== undefined && tag._icon !== null) {
                    options.groups[tag.id]['shape'] = 'icon';
                    options.groups[tag.id]['icon'] = {
                        face: 'FontAwesome',
                        code: tag._icon
                    };
                    if (tag.hasOwnProperty('color') && tag.color !== undefined && tag.color !== null) {
                        options.groups[tag.id]['icon']['color'] = tag.color;
                    }
                }
            });
        }
        try{
            this.handle.setOptions(options);
        } catch(e) {
            console.log(e);
        }

        this.defaultGroups = {};
        $.extend(true, this.defaultGroups, this.handle.groups.groups );

    };

    Vis.prototype.__resetGroups = function() {
        if (this.defaultGroups !== null) {
            try {
                this.handle.setOptions({groups: this.defaultGroups});
            } catch (e) {
                console.log(e);
            }
        }
    };

    Vis.prototype.__syncClusters = function() {
        var _this = this;
        if (this.current !== null && this.current.hasOwnProperty('clusters')) {
            this.handle.setData(this.data);
            this.current.clusters.forEach(function(cluster) {
                if (_this.handle.clustering.isCluster(cluster.id)) {
                    _this.updateCluster(cluster);
                } else {
                    _this.syncCluster(cluster);
                }
            });
        }
    };

    Vis.prototype.__syncCluster = function(cluster) {
        if (cluster !== undefined && cluster !== null) {

            var options = {
                joinCondition: function (node) {
                    return node.cluster === cluster.id;
                },
                clusterNodeProperties: {
                    allowSingleNodeCluster: true
                }
            };


            ['id', 'color', 'shape', 'label'].forEach(function (prop) {
                if (cluster.hasOwnProperty(prop)
                    && cluster[prop] !== undefined
                    && cluster[prop] !== null
                    && cluster[prop] !== '')
                    options.clusterNodeProperties[prop] = cluster[prop];
            });

            if (cluster.hasOwnProperty('_icon') && cluster._icon !== undefined && cluster._icon !== null) {
                options.clusterNodeProperties['shape'] = 'icon';
                options.clusterNodeProperties['icon'] = {
                    face: 'FontAwesome',
                    code: cluster._icon
                };
                if (cluster.hasOwnProperty('color') && cluster.color !== undefined && cluster.color !== null) {
                    options.clusterNodeProperties['icon']['color'] = cluster.color;
                }
            }

            var _this = this;
            var nodes = null;

            this.handle.clustering.cluster(options);

        }
    };

    Vis.prototype.__updateCluster = function(cluster) {
        if (cluster !== undefined && cluster !== null) {
            if (this.handle.clustering.isCluster(cluster.id)) {

                if (cluster.shape === 'icon' && cluster.hasOwnProperty('_icon')) {
                    cluster.icon = {
                        face: 'FontAwesome',
                        code: cluster._icon
                    };
                    if (cluster.hasOwnProperty('color') && cluster['color'] !== undefined && cluster['color'] !== null
                        && cluster['color'] !== '')
                        cluster.icon.color = cluster['color'];
                }

                this.handle.clustering.updateClusteredNode(cluster.id, cluster);
            }
        }
    };

    function Document() {

        this.previous_state = null;
        this.previous_title = null;

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
            data.hasOwnProperty('title')) {

            this.current.id = parseInt(data.id);
            this.current.title = data.title;

            if (!data.hasOwnProperty('graphs')) {
                data.graphs = [];
            }

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

    Document.prototype.rename = function(scope, window) {

        this.previous_state = scope.state;
        this.previous_title = this.current.title;

        scope.state = window.GRAPH_STATE.RENAME_DOCUMENT;

    };

    Document.prototype.cancelRename = function(scope, window) {

        if (this.previous_state !== null) {

            if (this.previous_title !== null) {
                this.current.title = this.previous_title;
                this.previous_title = null;
            }

            scope.state = this.previous_state;

        } else {
            scope.state = window.GRAPH_STATE.BASE;
        }

    };

    Document.prototype.saveRename = function(root, scope, window) {

        this.previous_title = null;

        if (root.current_document !== null) {
            root.current_document.title = this.current.title;
        }

        if (this.previous_state !== null) {
            scope.state = this.previous_state;
            this.previous_state = null;
        } else {
            scope.state = window.GRAPH_STATE.BASE;
        }

    };

    function Graph() {

        var _this = this;

        this.STATES = {
            EDIT_TAGS: 'Edit the properties of tags',
            EDIT_CLUSTERS: 'Add/Edit Clusters'
        };

        this.state = null;

        this.tag = new Tag();
        this.cluster = new Cluster();

        this.index = null;
        this.current = null;

        this.previous_state = null;

        this.open_clusters = new vis.DataSet([]);

        [
            this.__tabClass,
            this.__addCluster,
            this.__collapseClusters,
            this.__openCluster,
            this.__openAllClusters,
            this.__openSearch,
            this.__cancelSearch,
            this.__syncClusters
        ].forEach(function(method) {
            _this[method.name] = function() {
                return method.apply(_this, arguments);
            };
        });

        /*
        this.tabClass = function(state) {
            return _this.__tabClass(state);
        };

        this.addCluster = function() {
            return _this.__addCluster.apply(_this, arguments);
        };
        */


    }

    Graph.newGraph = function() {
        return {
            id:         vis.util.randomUUID(),
            nodes:      [],
            edges:      [],
            tags:       [],
            clusters:   [],
            removed_nodes: [],
            removed_edges: []
        };
    };

    Graph.prototype.hasClosedClusters = function(vis) {

        function filterGenerator(cluster) {
            return {
                filter: function(item) {
                    return item.cluster === cluster.id;
                }
            };
        }

        if (this.current !== null && this.current.hasOwnProperty('clusters') && this.current.clusters.length > 0) {
            for (var i = 0; i < this.current.clusters.length; i++) {
                try {
                    if (vis.data.clusters.get(this.current.clusters[i].id) &&
                        vis.data.nodes.get(filterGenerator(this.current.clusters[i])).length > 0 &&
                        this.open_clusters.get(this.current.clusters[i].id) === null) {
                        return true;
                    }
                } catch(e) {
                    console.log("got an exception: " + e);
                }
            }
        }
        return false;
    };

    Graph.prototype.hasOpenClusters = function(vis) {
        return this.open_clusters.length > 0;
    };

    Graph.prototype.__openAllClusters = function openAllClusters(event, scope, window) {
        var _this = this;
        _this.current.clusters.forEach(function(cluster) {
            if (_this.open_clusters.get(cluster.id) === null) {
                scope.vis.handle.openCluster(cluster.id);
                _this.open_clusters.add(cluster);
            }
        });
    };

    Graph.prototype.__collapseClusters = function collapseClusters(event, scope, window) {

        this.open_clusters.forEach(function(cluster) {
            scope.vis.syncCluster(cluster);
        });
        this.open_clusters.clear();

    };

    Graph.prototype.__openCluster = function openCluster(clusterId, scope, window) {
        var cluster = null;
        var _this = this;
        if (this.current !== null && this.current.hasOwnProperty('clusters')) {
            this.current.clusters.forEach(function(cluster) {
                if (cluster.id === clusterId) {
                    _this.open_clusters.add(cluster);
                    scope.vis.handle.clustering.openCluster(clusterId);
                }
            });
        }
    };

    Graph.prototype.__tabClass = function tabClass(state) {
        if (this.state === state) return 'active';
        return '';
    };

    Graph.prototype.__addCluster = function addCluster() {
        var cluster = Cluster.newCluster();
        this.current.clusters.push(cluster);
        this.cluster.select(cluster);
    };

    Graph.prototype.__openSearch = function openSearch(scope, window) {
        this.previous_state = scope.state;
        scope.state = window.GRAPH_STATE.SEARCH_GRAPH;
    };

    Graph.prototype.__cancelSearch = function cancelSearch(scope, window) {
        if (this.previous_state !== null) {
            scope.state = this.previous_state;
        } else {
            scope.state = window.GRAPH_STATE.BASE;
        }
        this.previous_state = null;
    };

    Graph.prototype.__search = function(scope, window) {

    };

    Graph.prototype.__syncClusters = function syncClusters(scope, window) {
        var _this = this;
        if (this.current !== undefined && this.current !== null && this.current.hasOwnProperty('clusters')) {
            scope.vis.handle.setData(scope.vis.data);
            this.current.clusters.forEach(function(cluster) {
                if (_this.open_clusters.get(cluster.id) === null) {
                    scope.vis.syncCluster(cluster);
                }
            });
        }
    };

    Graph.prototype.import = function(document, index) {

        if (document !== undefined && document !== null && document instanceof Document &&
            index !== undefined && index !== null) {

            if (this.index !== null && this.current !== null)
                document.current.graphs[this.index] = this.current;

            this.index = index;
            this.current = document.current.graphs[index];
            this.open_clusters.clear();


            if (this.current !== null) {
                this.current.backup_tags = [];
                $.extend(true, this.current.backup_tags, this.current.tags);

                this.current.backup_clusters = [];
                $.extend(true, this.current.backup_clusters, this.current.clusters);
            }

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

    Graph.prototype.edit = function(scope, window) {

        this.previous_state = scope.state;
        this.state = this.STATES.EDIT_TAGS;
        this.tag.current = null;

        scope.state = window.GRAPH_STATE.EDIT_OPTIONS;

    };

    Graph.prototype.update = function(scope, window) {
        var _this = this;

        if (this.previous_state !== null) {
            scope.state = this.previous_state;
        } else {
            scope.state = window.GRAPH_STATE.BASE;
        }
        this.state = null;
        this.tag.current = null;

        this.current.backup_tags = [];
        $.extend(true, this.current.backup_tags, this.current.tags);

        this.current.backup_clusters = [];
        $.extend(true, this.current.backup_clusters, this.current.clusters);

        scope.vis.handle.setData(scope.vis.data);
        scope.vis.syncGroups();

        this.current.clusters.forEach(function(cluster) {
            if (_this.open_clusters.get(cluster.id) === null) {
                scope.vis.syncCluster(cluster);
            }
        });

    };

    Graph.prototype.cancelEdit = function(scope, window) {
        if (this.previous_state !== null) {
            scope.state = this.previous_state;
        } else {
            scope.state = window.GRAPH_STATE.BASE;
        }
        this.state = null;
        this.tag.current = null;
        this.cluster.current = null;

        if (this.current.hasOwnProperty('backup_tags')) {
            this.current.tags = [];
            $.extend(true, this.current.tags, this.current.backup_tags);

            scope.vis.resetGroups();
        }

        if (this.current.hasOwnProperty('backup_clusters')) {
            this.current.clusters = [];
            $.extend(true, this.current.clusters, this.current.backup_clusters);
        }

    };

    Graph.prototype.addTag = function() {
        if (this.current !== null) {
            var newTag = Tag.newTag(this.current.id);
            this.current.tags.push(newTag);
            this.tag.select(newTag);
        }
    };

    function Tag() {
        this.current = null;
    }

    Tag.newTag = function(graph_id) {
        return {
            id: vis.util.randomUUID(),
            graph_id: graph_id,
            name: null,
            shape: null,
            icon: null
        };
    };

    Tag.prototype.select = function(tag) {
        this.current = tag;

    };

    Tag.prototype.class = function(tag) {
        if (tag === this.current) return 'active';
        return '';
    };

    function Cluster() {
        var _this = this;

        this.current = null;

        this.select = function() {
            return _this.__select.apply(_this, arguments);
        };

        this.class = function() {
            return _this.__class.apply(_this, arguments);
        };
    }

    Cluster.newCluster = function() {
        var id = vis.util.randomUUID();
        return {
            id:     id,
            label:  id,
            shape:  null,
            color:  null,
            icon:   null
        };
    };

    Cluster.prototype.__select = function(cluster) {
        this.current = cluster;
    };

    Cluster.prototype.__class = function(cluster) {
        if (this.current === cluster) return 'active';
        return '';
    };

    function Node() {

        var _this = this;

        this.current = null;

        this.shapes = [
            'box',
            'square',
            'database',
            'circle',
            'ellipse',
            'text',
            'icon'
        ];

        this.icons = [];

        this.defaults = {
            shape: this.shapes[0]
        };

        this.hasTag = function(value) {
            return _this.__hasTag(value);
        };

    }

    Node.prototype.select = function(event, scope, window) {

        var node_id = event.nodes[0];

        if (this.current !== undefined && this.current !== null && this.current.hasOwnProperty('id'))
            this.update(event, scope, window);

        if (scope.vis.handle.isCluster(node_id)) {

            scope.graph.openCluster(node_id, scope, window);
            scope.vis.handle.unselectAll();

            scope.state = window.GRAPH_STATE.BASE;

        } else {

            this.current = scope.vis.data.nodes.get(node_id);

            this.current.backup_cluster = this.current.cluster;

            scope.state = window.GRAPH_STATE.EDIT_NODE;
        }

    };

    Node.prototype.update = function(event, scope, window) {

        if (this.current !== null) {

            if (this.current.hasOwnProperty('shape') &&
                (this.current.shape === undefined || this.current.shape === null || this.current.shape === '')) {

                this.current.shape = undefined;

                scope.vis.data.nodes.update(this.current);

                delete this.current['shape'];

            } else {
                if (this.current.shape === 'icon' && this.current.hasOwnProperty('_icon') && this.current._icon !== undefined &&
                    this.current._icon !== null) {

                    this.current.icon = {
                        face: 'FontAwesome',
                        code: this.current._icon
                    };
                    scope.vis.data.nodes.update(this.current);

                }
            }

            scope.vis.data.nodes.update(this.current);

            if (this.current.hasOwnProperty('cluster')) {
                scope.graph.syncClusters(scope, window);
            }

            this.current = null;

            if (scope.state === window.GRAPH_STATE.EDIT_NODE)
                scope.state = window.GRAPH_STATE.BASE;
        }
        this.current = null;

    };

    Node.prototype.__hasTag = function(value) {
        if (this.current !== null && this.current.tags !== undefined && this.current.tags !== null && this.current.tags instanceof Array) return this.current.tags.includes(value.id);
        return false;
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
                },
                {
                    event: 'expandClusters',
                    ref: this.angular.scope.graph.__openAllClusters,
                    args: [
                        this.angular.scope, this.angular.window
                    ],
                    context: this.angular.scope.graph
                },
                {
                    event: 'collapseClusters',
                    ref: this.angular.scope.graph.__collapseClusters,
                    args: [
                        this.angular.scope, this.angular.window
                    ],
                    context: this.angular.scope.graph
                }
            ],
            'angular': [
                {
                    event: 'graph.save_document',
                    listener: function(event, data) {
                        _this.angular.scope.document.save(_this.angular.service, _this.angular.scope.vis);
                    },
                    handle: null
                },
                {
                    event: 'graph.rename_document',
                    listener: function(event, data) {
                        _this.angular.scope.document.rename(_this.angular.scope, _this.angular.window);
                        _this.angular.timeout();
                    },
                    handle: null
                }
            ],
            'options': [
                {
                    event: 'editOptions',
                    ref: this.angular.scope.graph.edit,
                    args: [this.angular.scope, this.angular.window],
                    context: this.angular.scope.graph
                },
                {
                    event: 'cancelOptions',
                    ref: this.angular.scope.graph.cancelEdit,
                    args: [this.angular.scope, this.angular.window],
                    context: this.angular.scope.graph
                },
                {
                    event: 'updateOptions',
                    ref: this.angular.scope.graph.update,
                    args: [this.angular.scope, this.angular.window],
                    context: this.angular.scope.graph
                },
                {
                    event: 'cancelRename',
                    ref: this.angular.scope.document.cancelRename,
                    args: [this.angular.scope, this.angular.window],
                    context: this.angular.scope.document
                },
                {
                    event: 'saveRename',
                    ref: this.angular.scope.document.saveRename,
                    args: [this.angular.root, this.angular.scope, this.angular.window],
                    context: this.angular.scope.document
                },
                {
                    event: 'openSearch',
                    ref: this.angular.scope.graph.__openSearch,
                    args: [this.angular.scope, this.angular.window],
                    context: this.angular.scope.graph
                },
                {
                    event: 'cancelSearch',
                    ref: this.angular.scope.graph.__cancelSearch,
                    args: [this.angular.scope, this.angular.window],
                    context: this.angular.scope.graph
                },
                {
                    event: 'search',
                    ref: this.angular.scope.graph.__search,
                    args: [this.angular.scope, this.angular.window],
                    context: this.angular.scope.graph
                }
            ]
        };

        this.__initialize($route);
        this.__initializeVis();

        this.angular.scope.$on('$destroy', function() {
            _this.angular.scope.vis.destroy();
        });

        $service.icons(function(icons) {
            icons.forEach(function(icon) {
                _this.angular.scope.node.icons.push(icon);
            });
        }, function(err) {
            console.log(err);
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

            _this.angular.scope[handler.event] = function() {
                metaHandler(null);
            };

        });

        this.handlers.options.forEach(function(handler) {
            _this.angular.scope[handler.event] = function() {
                handler.ref.apply(handler.context, handler.args);
                _this.angular.timeout();
            };
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

                this.__initializeVis();

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

    Service.prototype.icons = function(successCallback, errorCallback) {
        var _this = this;

        if (typeof(Storage) !== 'undefined') {
            var iconStr = localStorage.getItem('graph.font-awesome.icons');
            if (iconStr !== undefined && iconStr !== null) {
                var icons = JSON.parse(iconStr);
                if (icons !== undefined && icons !== null && icons instanceof Array)
                    if (successCallback !== undefined && successCallback !== null)
                        successCallback.apply(_this, [icons]);
            } else {
                this.http.get('/icons.json').then(function(successResponse) {
                    var icons = successResponse.data;

                    localStorage.setItem('graph.font-awesome.icons', JSON.stringify(icons));

                    if (successCallback !== undefined && successCallback !== null) successCallback.apply(_this, [successResponse.data]);
                }, function(errorResponse) {
                    if (errorCallback !== undefined && errorCallback !== null) errorCallback.apply(_this, [errorResponse]);
                });
            }
        } else {
            this.http.get('/icons.json').then(function(successResponse) {
                if (successCallback !== undefined && successCallback !== null) successCallback.apply(_this, [successResponse.data]);
            }, function(errorResponse) {
                if (errorCallback !== undefined && errorCallback !== null) errorCallback.apply(_this, [errorResponse]);
            });
        }

    };

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
                        clusters: [],
                        removed_nodes: [],
                        removed_edges: []
                    };

                    for (var i = 0; i < unsaved_graphs.length; i++) {
                        var graph = unsaved_graphs[i];
                        var nodes = graph.nodes;
                        var edges = graph.edges;
                        var tags = graph.tags;
                        var clusters = graph.clusters;

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
                                icon: node.hasOwnProperty('_icon') ? node['_icon'] : null,
                                cluster: node.cluster,
                                x: node['x'],
                                y: node['y'],
                                tags: node.tags,
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
                                graph_id: graph.id,
                                color: tag.color,
                                shape: tag.shape,
                                icon: tag.hasOwnProperty('_icon') ? tag['_icon'] : null
                            });
                        }

                        for (var cluster_index = 0; cluster_index < clusters.length; cluster_index++) {
                            var cluster = clusters[cluster_index];
                            transfer_object.clusters.push({
                                id: cluster.id,
                                graph_id: graph.id,
                                color: cluster.color,
                                shape: cluster.shape,
                                label: cluster.label,
                                icon: cluster.hasOwnProperty('_icon') ? cluster['_icon'] : null
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