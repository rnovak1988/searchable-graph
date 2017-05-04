/**
 * This file contains the logic for the main routing of the application, essentially the "wrapper UI" that sits on-top
 * of everything else. Documents and Graph modules are their own components that exist separately
 */

//= require application/common
//= require application/graph
//= require application/document
//= require_self

(function() {

    var container = angular.module('graph.main', ['ngResource', 'ngRoute']);


})();