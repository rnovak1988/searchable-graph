/**
 * This file contains the definition for the Finite State Machine that represents the user interaction model from the
 * client side.
 */
(function() {


    /**
     * Enumeration of possible Application states
     * @type {{HOME: string, MANAGE_DOCUMENT: string, EDIT_GRAPH: string}}
     */
    window.APPLICATION_SATES = {
        'HOME': 'This represents the state of the application after the user has just logged in',
        'MANAGE_DOCUMENT': 'This state is after the user has clicked on one of the document links from the home page',
        'EDIT_GRAPH': 'This state represents that a document has been chosen, and graphs are being edited'
    };

    /**
     * Enumeration of possible states for the document module
     * @type {{SELECT: string, CREATE: string}}
     */
    window.DOCUMENT_STATE = {
        'SELECT': 'User is currently selecting a document from list of existing documents',
        'CREATE': 'User is currently creating a new, (initially) empty document'
    };

    /**
     * Enumeration of possible states for the Graph module
     * @type {{BASE: string, ADD_NODE: string, EDIT_NODE: string, ADD_EDGE: string, EDIT_EDGE: string}}
     */
    window.GRAPH_STATE = {
        'BASE': 'initial state, after the graph is loaded into the graph module',
        'ADD_NODE': 'Adding a node to the currently selected graph',
        'EDIT_NODE': 'Editing the information for a selected node',
        'ADD_EDGE': 'Add an edge between two nodes',
        'EDIT_EDGE': 'Edit the information for an edge (including removing that edge)'
    };



})();