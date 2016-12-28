angular.module("accountDashboardDirectives")
    .directive('prDocuments', ['$window','listingsService', function($window,listingsService){
        return {
            templateUrl: 'account/directives/pr-documents/documents_directive_tmpl.html',
            scope: true,
            restrict: "E",
            controller: ['$scope', 'userAccountServices', 'userModel', 'listingsService',  'listingsModel', function ($scope, userAccountServices, userModel,listingsService, listingsModel) {
                function getListingsDocuments(listing_id){
                    var params = {listing_id: listing_id};
                    addressHoldFound = false;
                    listingsService.listingStatus(params).then(function(listingStatusListWithHolds){
                        var filteredHoldsListBasedOnHoldTypes = listingStatusListWithHolds.Holds.filter(filterBasedOnHoldTypes);
                        $scope.ListingsVM.holdsList = filteredHoldsListBasedOnHoldTypes.filter(filterBasedOnADDRESSHOLD);
                        if($scope.ListingsVM.holdsList.length > 0){
                            DocumentsVM.holdsList = $scope.ListingsVM.holdsList.map(function(obj){
                                var rObj = {};
                                if(obj.description === 'Bank Ownership'){
                                    obj.description = 'Bank ownership';
                                }
                                else if(obj.description === 'Proof of Current Income'){
                                    obj.description = 'Proof of current income';
                                }
                                else if(obj.description === 'End of year Tax Document'){
                                    obj.description = 'End-of-year tax document';
                                }
                                else if(obj.description === 'Valid Government Identification Card with Picture'){
                                    obj.description = 'Valid government-issued photo ID';
                                }
                                else if(obj.description === 'Utility Bill within the last 30 days'){
                                    obj.description = 'Utility Bill (within last 30 days)';
                                }
                                else if(obj.description === 'Social Security Card'){
                                    obj.description = 'Social Security card';
                                }
                                rObj['description'] = obj.description;
                                rObj['workflow_status'] = obj.workflow_status;
                                rObj['display_message'] = obj.display_message;
                                rObj['showIconAndStatus'] = true;

                                if(obj.workflow_status.toUpperCase() === 'IN REVIEW'){
                                    rObj['documentStatusIcon'] = railsVariables.documentCheckedIcon;
                                    rObj['documentStatus'] = 'document-item-checked';
                                    rObj['workflow_status'] = 'CURRENTLY REVIEWING...';
                                }
                                else if(obj.workflow_status.toUpperCase() === 'PROCESSED'){
                                    rObj['documentStatus'] = 'document-item-checked';
                                    rObj['workflow_status'] = 'APPROVED';
                                    rObj['documentStatusIcon'] = railsVariables.documentCheckedIcon;
                                }
                                else{
                                    rObj['documentStatusIcon'] = railsVariables.documentUnCheckedIcon;
                                    rObj['documentStatus'] = 'document-item-unchecked';
                                    rObj['workflow_status'] = 'Please upload';
                                    rObj['pleaseUpload'] = 'please-upload';
                                    rObj['showIconAndStatus'] = false;
                                }
                                rObj[obj.key] = obj.value;
                                return rObj;
                            });

                            if(DocumentsVM.holdsList.length > 0){
                                $scope.ListingsVM.showDocuments = true;
                            }

                        }
                    });
                }
                function filterBasedOnHoldTypes(documentItem){
                    if((documentItem.mnemonic.toUpperCase() === 'BOV'  ||
                        documentItem.mnemonic.toUpperCase() === 'MIL' ||
                        documentItem.mnemonic.toUpperCase() === 'ADR' ||
                        documentItem.mnemonic.toUpperCase() === 'ADDRESS' ||
                        documentItem.mnemonic.toUpperCase() === 'POE' ||
                        documentItem.mnemonic.toUpperCase() === 'POI' ||
                        documentItem.mnemonic.toUpperCase() === 'IDV' ||
                        documentItem.mnemonic.toUpperCase() === 'UB'  ||
                        documentItem.mnemonic.toUpperCase() === 'SSC') &&
                        !(documentItem.workflow_status.toUpperCase() === 'NOT NEEDED' ||
                        documentItem.workflow_status.toUpperCase() === 'NOT_NEEDED' ||
                        documentItem.workflow_status.toUpperCase() === 'RECEIVED')
                    ){
                        return true;
                    }
                    else{
                        return false;
                    }
                }
                function filterBasedOnADDRESSHOLD(documentItem){
                    if(documentItem.mnemonic === 'UB' || documentItem.mnemonic === 'ADDRESS'){
                        if(addressHoldFound){
                            return false;
                        }
                        else{
                            addressHoldFound = true;
                            return true;
                        }
                    }
                    else{
                        return true;
                    }
                }
                DocumentsVM = this;
                DocumentsVM.uploadDocument = function(){
                    $window.location = '/secure/account/common/documents.aspx';
                };
                var activeListings = listingsModel.data.filter(function(listingsItem){
                    if(['SAVED_DRAFT', 'PENDING_ACTIVATION', 'ACTIVE', 'PENDING_COMPLETION', 'ON HOLD'].indexOf(listingsItem.status) !== -1){
                        return true;
                    }
                    else{
                      return false;
                    }
                });

                if(activeListings.length > 0){
                    getListingsDocuments(activeListings[0].listing_id);
                }


            }],
            link: function (scope, element, attrs) {


            },
            controllerAs: 'DocumentsVM'
        };
    }]);
