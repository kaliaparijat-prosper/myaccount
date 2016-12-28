/**
 * `AccountDocumentsController` imports.
 */

AccountDocumentsController.$inject = [
  '$scope',
  '$timeout',
  'Upload',
  'featureFlags',
  'listingsModel',
  '$window',
  '$location',
  'docUploadConstants',
  'documentsService',
  'ld'
];

/**
 * Expose `accountDashboardDirectives`.
 */

angular.module("accountDashboardDirectives")
  .directive('prDocumentUpload', [function(){
    return {
      templateUrl: 'account/directives/pr-document-upload/documents_directive_tmpl.html',
      scope: true,
      restrict: "E",
      controller: AccountDocumentsController,
      link: function (scope, element, attrs) {},
      controllerAs: 'DocumentUploadVM'
    };
  }]);

/**
 * Define `AccountDocumentsController`.
 */

function AccountDocumentsController($scope, $timeout, Upload, featureFlags, listingsModel, $window, $location, docUploadConstants, documentsService, ld) {
  var DocumentUploadVM = this;
  DocumentUploadVM.documentCategories = [];
  DocumentUploadVM.allHoldsProcessed = false;
  DocumentUploadVM.pendingHoldsOnly = false;
  DocumentUploadVM.user = $scope.ListingsVM.user;
  DocumentUploadVM.docUploadSize = docUploadConstants.DOC_UPLOAD_SIZE;
  DocumentUploadVM.isWaitingForResponse = false;
  DocumentUploadVM.required_documents = {};

  //featureFlags.onFeatureRunning('docUpload', __init);
  __init('docUpload');

  function __init(activeVariant) {

    var activeListings = listingsModel.data.filter(function(listingsItem){
      if(['SAVED_DRAFT', 'PENDING_ACTIVATION', 'ACTIVE', 'PENDING_COMPLETION', 'ON HOLD', 'WITHDRAWN', 'EXPIRED'].indexOf(listingsItem.status) !== -1){
        return true;
      }
      else{
        return false;
      }
    });

    if (activeListings) {
      getAllDocuments();
    }
  }

  function documentListener(doc_data) {
    var refreshIntervalId = setInterval(function () {
      if(!DocumentUploadVM.isWaitingForResponse){
        DocumentUploadVM.isWaitingForResponse = true;
        var params = {listing_id:doc_data.listing_id};
        documentsService.verificationStatus(params).then(function(isGDSRun) {
          DocumentUploadVM.isWaitingForResponse = false;
          if(isGDSRun) {
            documentsService.getAll().then(function(data) {
              if(!ld.isEmpty(data)) {
                //hide notification
                $('.no-doc-required').hide();
                $('.doc-refresh-notification').show();
                DocumentUploadVM.docRefresh = true;

                DocumentUploadVM.allHoldsProcessed = false;
                DocumentUploadVM.pendingHoldsOnly = false;
                DocumentUploadVM.required_documents = data;
                DocumentUploadVM.processDocuments(data);
                // Defining the analytics constants
                var analyticsAttrib = {
                  type: "event",
                  evars: {
                    user_id: doc_data.alt_key
                  },
                  trackingCode: "event_doc_upload_refresh"
                };
                // Adobe Analytics doc upload refresh call
                adobeAnalytics.track(analyticsAttrib);
                //// ADOBE ANALYTICS END ////
              }
            });
            stopInterval();
          }
        });

        function stopInterval() {
          clearInterval(refreshIntervalId);
        }
      }
    }, parseInt(docUploadConstants.DOC_LISTENER_DELAY_SECONDS));
  }


  var replacementCategoryNames = [
    {
      defaultName: "Income Documents",
      replacementName: "Proof of Income"
    },
    {
      defaultName: "Military Identification Card",
      replacementName: "Military ID Card"
    },
    {
      defaultName: "Bank Account Documents",
      replacementName: "Bank Account Verification"
    },
    {
      defaultName: "Government Identification Card with Picture",
      replacementName: "Proof of Identity"
    },
    {
      defaultName: "Tax documents",
      replacementName: "Tax Documents"
    },
    {
      defaultName: "Utility bill",
      replacementName: "Utility Bill"
    }
  ]



  var additionalDocumentExplainers = [
    {
      docTypeId: 19,
      docTypeName: "Employment Offer Letter",
      explainer: "We are requesting an employment offer letter because of length of current employment or need to verify specific terms of employment."
    },
    {
      docTypeId: 4,
      docType: "Explanation of Income",
      explainer: "We are requesting an explanation of income because we can not determine/verify the stated income with documents provided."
    },
    {
      docTypeId: 1,
      docType: "Name Change Document",
      explainer: "We are requesting name change documents due to name variations within documentation provided and Prosper profile."
    },
    {
      docTypeId: -1,
      docType: "default",
      explainer: "We need additional documents to verify your information. Please submit following:"
    }
  ]



  DocumentUploadVM.docUploadTips = [
    {
      id: 13,
      tips: [
        "Personal check should have your name and full address",
        "We cannot accept starter checks and deposit slips",
        "Ensure image is clear with all 4 corners visible"
      ]
    },
    {
      id: 8,
      tips: [
        "Upload bank statement, not a transaction history. Bank statements can generally be found in the Statements section after logging-in to your online banking",
        "First page should be completely visible (no cut-offs)",
        "Please do not cross-out any information"
      ]
    },
    {
      id: 9,
      tips: [
        "Upload unexpired ID card with clear picture and all numbers visible",
        "For best results, use a camera without flash in order to avoid excessive glare"
      ]
    },
    {
      id: 17,
      tips: [
        "Upload unexpired ID card with clear picture and all numbers visible",
        "For best results, use a camera without flash in order to avoid excessive glare"
      ]
    },
    {
      id: 11,
      tips: [
        "Upload unexpired U.S. passport with clear picture and all numbers visible",
        "For best results, use a camera without flash in order to avoid excessive glare "
      ]
    },
    {
      id: 18,
      tips: [
        "Utility bill should include address in customer's name",
        "Do not provide cell phone bills",
        "Acceptable bills include:  power, water, gas, electric, sewage, trash, landlines, cable, mortgage statement, home security bill, renters insurance bill"
      ]
    },
    {
      id: 6,
      tips: [
        "Upload current military ID card with full name and picture"
      ]
    },
    {
      id: 12,
      tips: [
        "Paystub should include: your name, company name, pay period, pay date, and year to date earnings"
      ]
    },
    {
      id: 15,
      tips: [
        "Upload most recent Social Security benefits statement with name and gross benefit amount"
      ]
    },
    {
      id: 8,
      tips: [
        "Upload copy of your official W2 with all info visible"
      ]
    },
    {
      id: 10,
      tips: [
        "Upload copy of your 1099 with all boxes visible"
      ]
    },
    {
      id: 2,
      tips: [
        "Upload full first page of individual-only 1040"
      ]
    },
    {
      id: 16,
      tips: [
        "Upload signed Social Security card",
        "Social security renewal letters are not accepted"
      ]
    }
  ];



  DocumentUploadVM.toggleFormVisibility = function(id) {
    DocumentUploadVM['showFormFor_' + id] = !DocumentUploadVM['showFormFor_' + id];
  };

  DocumentUploadVM.toggleRadio = function (docCategory, docType) {
    DocumentUploadVM['docTypeFor_' + docCategory] = docType;
  };




  DocumentUploadVM.documentCategoryForId = function(id) {
    var docs = DocumentUploadVM.documentCategories;
    for (var i = 0; i < docs.length; i++) {
      for (var j = 0; j < docs[i].document_types.length; j++) {
        if (docs[i].document_types[j].type.id == id) {
          return docs[i].document_types[j];
        }
      }
    }
    return "Not Available";
  };


  DocumentUploadVM.uploadFiles = function(file, workflow_id, document_type_id, errFiles, document_category_index, sortId) {

    var errors = errFiles && errFiles[0];
    var is_optional = false;

    if (typeof DocumentUploadVM.documentCategories[document_category_index].is_additional_document !== 'undefined' ) {
      is_optional = DocumentUploadVM.documentCategories[document_category_index].is_additional_document;
    }


    DocumentUploadVM.f = file;

    DocumentUploadVM['uploadErrorsFor_' + sortId] = errors;

    DocumentUploadVM.sortId = sortId;

    if(errors && errors.length !== 0 && errors.$error == "maxSize") {
      //// ADOBE ANALYTICS ////
      // Defining the analytics constants
      var analyticsAttrib = {
        type : "event",
        trackingCode : "event_document_upload_max_size_exceeded"
      };
      // Adobe Analytics change loan amount call
      adobeAnalytics.track(analyticsAttrib);
      //// ADOBE ANALYTICS END ////
    }


    if (file) {
      DocumentUploadVM.documentCategories[document_category_index].uploading = true;


      file.upload = Upload.upload({
        url: '  /borrower/api/v1/user/required_documents',
        data: {'document': file, 'workflow_id': workflow_id, 'type': document_type_id, 'is_optional': is_optional},
        ignoreLoadingBar: true
      });

      file.upload.then(function (response) {
        $timeout(function () {

          //// ADOBE ANALYTICS ////
          // Defining the analytics constants
          var analyticsAttrib = {
            type : "event",
            trackingCode : "event_document_upload_success"
          };
          // Adobe Analytics change loan amount call
          adobeAnalytics.track(analyticsAttrib);
          //// ADOBE ANALYTICS END ////


          file.result = response.data;
            DocumentUploadVM.processDocuments(response.data);
            location.hash = "#"+DocumentUploadVM.sortId;
        });
      }, function (response) {
        console.log('error_response', response);
        if (response.status > 0) {

          //// ADOBE ANALYTICS ////
          // Defining the analytics constants
          var analyticsAttrib = {
            type : "event",
            trackingCode : "event_document_upload_error"
          };
          // Adobe Analytics change loan amount call
          adobeAnalytics.track(analyticsAttrib);
          //// ADOBE ANALYTICS END ////

          DocumentUploadVM.documentCategories[document_category_index].uploading = false;
            switch(response.status.toString()){
              case "401":
                $window.location = '/signin';
                break;

              case "407":
                DocumentUploadVM['uploadErrorsFor_' + sortId] = {
                  '$error': "duplicateFileNameError",
                  name: DocumentUploadVM.f.name,
                  message : response.data.error
                }
                break;

              default:
                DocumentUploadVM['uploadErrorsFor_' + sortId] = {
                  '$error': "serverError",
                  name: DocumentUploadVM.f.name,
                  message : ''
                }
                break;
            }

        }

      }, function (evt) {
        file.progress = Math.min(100, parseInt(100.0 *
        evt.loaded / evt.total));
      });
    }
  };

  function getAllDocuments(params) {
    // TODO: 3 statuses: Rejected, Empty (not submittied), and Received.
    // if everything is rejected, then category is rejected.
    $scope.$on('docRequestCompleted', function (event, doc_data) {
      DocumentUploadVM.required_documents = doc_data;
      DocumentUploadVM.processDocuments(doc_data);

      //get GDS holds as soon as GDS runs
      if (featureFlags.isActiveVariant("documentListener", "new") && ld.isEmpty(doc_data)) {
        documentListener(doc_data);
      }
    });
  }

  function getAdditionalDocumentExplainer(id) {
    var ade = additionalDocumentExplainers;
    for (var i = 0; i < ade.length; i++) {
      if(ade[i].docTypeId == id) {
        return ade[i].explainer;
      }
    }
    return ade[ade.length - 1].explainer;
  }

  function extractAdditionalDocumentRequests(documents) {
    var newDocuments = [];

    documents.forEach(function(doc){
      doc.sorting_id = doc.id;

      newDocuments.push(doc);

      if(doc.document_types && doc.document_types.length > 0) {
        doc.document_types.forEach(function(type, index){
          var newDoc;
          type.sorting_id = type.type.id;
          if(type.is_optional) {
            newDoc = angular.copy(doc);
            newDoc.is_additional_document = true;
            newDoc.additional_document_name = type.type.name;
            newDoc.additional_document_explainer = getAdditionalDocumentExplainer(type.type.id);
            newDoc.sorting_id = newDoc.id + "_" + index;
            type.sorting_id = type.type.id + "_" + index;
            newDoc.document_types = [type];
            newDocuments.push(newDoc);
          }
        });

      }
    });
    return newDocuments;
  }


  DocumentUploadVM.processDocuments = function (documents) {
    // create 3 main statuses in the ui
    var rejected = [];
    var unsubmitted = [];
    var received = [];
    var verified = [];

    var hasRejectedHolds = false;
    var hasUnsubmittedHolds = false;
    var hasPendingHolds = false;

    documents = extractAdditionalDocumentRequests(documents);

    documents.forEach(function(doc){
      if(doc.document_types && doc.document_types.length > 0) {
        doc.uploading = false;
        DocumentUploadVM['uploadErrorsFor_' + doc.sorting_id] = null;
        DocumentUploadVM['docTypeFor_' + doc.sorting_id] = doc.document_types[0].type.id;
        doc.isOpen = isDrawerOpen(doc.sorting_id);


        addUploadTipsForCategory(doc.document_types);

        if (isRejected(doc)) {
          doc.status.name === 'In Review' ? doc.status.name = 'Pending review' : doc.status.name = 'Submit a new document';
          if(doc.is_additional_document) {
            doc.status.name = 'Submit a new document';
          }
          hasRejectedHolds = true;
          rejected.push(doc);
          return;
        }

        if (isNotSubmitted(doc)) {
          doc.status.name = 'Take action now';
          hasUnsubmittedHolds = true;
          unsubmitted.push(doc);
          return;
        }


        if (isVerified(doc)) {
          doc.status.name = 'Done';
          verified.push(doc);
          return;
        }

        hasPendingHolds = true;
        doc.status.name = 'Pending review';
        if(doc.status.name === 'Pending review') {
          DocumentUploadVM['showFormFor_' + doc.sorting_id] = false;
        }

        received.push(doc);
      }
    });

    if(!hasRejectedHolds && !hasUnsubmittedHolds && !hasPendingHolds) {
      DocumentUploadVM.allHoldsProcessed = true;
    }

    if(!hasRejectedHolds && !hasUnsubmittedHolds && hasPendingHolds) {
      DocumentUploadVM.pendingHoldsOnly = true;
    }

    if(unsubmitted.length > 0 || received.length > 0 || rejected.length > 0 || verified.length > 0) {
      $scope.ListingsVM.showDocuments = true;
    }

    var result = rejected.concat(unsubmitted).concat(received).concat(verified);


    DocumentUploadVM.documentCategories = result;

    replaceCategoryNames();

  };

  function replaceCategoryNames() {
    var docs = DocumentUploadVM.documentCategories;

    for (var i = 0; i < docs.length; i++) {
      if(docs[i].is_additional_document) {
        docs[i].type = docs[i].additional_document_name;
      }
      for (var j = 0; j < replacementCategoryNames.length; j++) {
        if (docs[i].type === replacementCategoryNames[j].defaultName) {
          docs[i].type = replacementCategoryNames[j].replacementName;
        }
      }
    }

  }


  function addUploadTipsForCategory(docTypes) {

    for (var i = 0; i < docTypes.length; i++) {

      docTypes[i].uploadTips = {};

      for(var j = 0 ; j < DocumentUploadVM.docUploadTips.length; j++) {
        if(docTypes[i].type.id == DocumentUploadVM.docUploadTips[j].id) {
          docTypes[i].uploadTips = DocumentUploadVM.docUploadTips[j];
          break;
        }
      }
      if(typeof docTypes[i].uploadTips.tips === "undefined") {
        docTypes[i].uploadTips.tips = ["Make sure image is clear and readable"];
      }
    }
  }


  function isDrawerOpen(categoryId) {
    var docs = DocumentUploadVM.documentCategories;
    for (var i = 0; i < docs.length; i++) {
      if (docs[i].sorting_id === categoryId && docs[i].isOpen) {
        return true;
      }
    }
    return false;
  }

  function isNotSubmitted(doc) {
    if (!isVerified(doc)) {
      for (var i = 0, n = doc.document_types.length; i < n; i++) {
        var type = doc.document_types[i];
        var isEmpty = !(type.documents && type.documents.length > 0);
        if (!isEmpty) return false;
      }
    } else  {
      return false;
    }
    return true;
  }



  function isRejected(doc) {
    if (!isVerified(doc)) {

      var unRejectedDocuments = 0;

      for (var i = 0, n = doc.document_types.length; i < n; i++) {
        var type = doc.document_types[i];
        if (type.documents && type.documents.length > 0) {
          for (var j = 0, m = type.documents.length; j < m; j++) {
            if (type.documents[j].status.name !== "Rejected") {
              unRejectedDocuments++;
            }
            if (unRejectedDocuments > 0) {
              return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  }

  function isVerified(doc) {
    if (doc.status.name === 'Processed') {
      return true;
    }
    if (doc.status.name === 'Not needed') {
      return true;
    }
    return false;
  }


}
