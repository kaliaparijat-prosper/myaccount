(function () {
  'use strict';

  angular.module('account.documentUpload', [])
  .service('documentsService', ['networkHelper', function (networkHelper) {
    var vm = this;

    /**
     * Get all documents.
     *
     * @see https://confluence.prosper.com/pages/viewpage.action?title=Document+API&spaceKey=tech
     */

    this.getAll = function(params){
      var httpOptions = {};
      var requiredDocumentsEndPoint = "api/v1/user/required_documents";
      var routeScope = "/borrower/"
      angular.extend(httpOptions, {httpMethod: "GET", ignoreLoadingBar: true});
      return networkHelper.postNetworkRequest(requiredDocumentsEndPoint, params, httpOptions, routeScope);

    }

    this.verificationStatus = function(params){ //listing_id
      var httpOptions = {};
      var verificationStatusEndPoint = "api/v1/listings/verification_status";
      var routeScope = "/borrower/"
      angular.extend(httpOptions, {httpMethod: "GET"});
      return networkHelper.postNetworkRequest(verificationStatusEndPoint, params, httpOptions, routeScope);
    }

    this.verificationStatus = function(params){ //listing_id
      var httpOptions = {};
      var verificationStatusEndPoint = "api/v1/listings/verification_status";
      var routeScope = "/borrower/"
      angular.extend(httpOptions, {httpMethod: "GET"});
      return networkHelper.postNetworkRequest(verificationStatusEndPoint, params, httpOptions, routeScope);
    }

  }]);
}());