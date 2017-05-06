(function() {

    var documentManager = angular.module('graph.documents', ['ngResource']);


    var docController = function($rootScope, $scope, $window, $http, documentService) {

        $scope.documents = [];

        $scope.select_document = function(document) {
            documentService.load(document, function(data) {
                $rootScope.$emit('graph.select_document', data);
            });
        };

        documentService.list(function(data) {
            for( var i = 0; i < data.length; i++) {
                $scope.documents.push(data[i]);
            }
        });

    };

    var docService = function($http) {
        this.http = $http;
        this.urls = {
            'list': '/documents.json'
        };
    };

    /**
     * because what is life without callback hell
     * @param callback
     */
    docService.prototype.list = function(callback) {
        var _this = this;
        this.http.get(this.urls.list).then(function(response) {
            if (callback !== undefined && callback !== null) {
                callback.call(_this, response.data);
            }
        }, function(errorResponse) {

        });
    };

    docService.prototype.load = function(document, callback) {
        var _this = this;
        this.http.get(document.url).then(function(successResponse) {
           callback.call(_this, successResponse.data);
        }, function(errorResponse) {

        });
    };

    documentManager.service('documentService', ['$http', docService]);
    documentManager.controller('documentController', ['$rootScope', '$scope', '$window', '$http', 'documentService', docController]);




})();