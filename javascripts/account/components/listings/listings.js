angular.module("account.listings", ['accountDashboardModels'])
    .controller('ListingsController', ['$scope', '$timeout', '$rootScope', 'userListingsObject', 'listingsService', 'listingsModel', 'selectedOffersObject', '$modal', 'featureFlags', 'userServiceObject', '$location', 'ld', function($scope, $timeout, $rootScope, userListingsObject, listingsService, listingsModel, selectedOffersObject, $modal, featureFlags, userServiceObject, $location, ld){
        var ListingsVM = this;
        ListingsVM.showActiveListing = false;
        ListingsVM.showDraftListing = false;

        ListingsVM.showDocuments = false; 
        ListingsVM.user = userServiceObject.user;

        function listingsInit(){
            //show welcome modal if first time user
            $timeout(function() {
              var locSearch = $location.search();
              if (ld.has(locSearch, 'skipThankyou') && locSearch.skipThankyou === 'true') {
                welcomeModal();
              }
            });
            processUserListingsObject();
            if(userListingsObject.result.length > 0){
                determineListingStatus();
            }
        }

        function welcomeModal() {
          var modalWidth = 'full';
          if ($(this).width() > 640) {
            modalWidth = 'small';
          }
           var templateUrl= 'welcomeModalContent.html',
           controller='WelcomeCtrl',
           hidOnClick= true,
           styleClass= 'welcome-modal reveal new-modal ' + modalWidth,
           params= '';

            var locSearch = $location.search();
            if (ld.has(locSearch, 'debitCardAdded') && locSearch.debitCardAdded === 'true') {
                $rootScope.debitCardAdded = true
            }

           __modal(templateUrl, controller, hidOnClick, styleClass, params);
        }

        function __modal (templateUrl, controller, hideOnClick, styleClass, params){
          var modalInstance = $modal.open({
            templateUrl: templateUrl,
            backdrop: hideOnClick,
            controller: controller,
            windowClass:styleClass,
            resolve: {
              modalParams: function () {
                return params;
              }
            }
          });
          return modalInstance;
        }

        $(window).on('resize', function() {
          if ($(this).width() > 640) {
            $('.welcome-modal').addClass('small');
            $('.welcome-modal').removeClass('full');
          }

        });

        function determineSavedDraftLevel(){
            ListingsVM.listingDetails.draftListingLevel = 1;
            if (ListingsVM.listingDetails.loan_product === 'UNALLOCATED' &&
                ListingsVM.listingDetails.is_partial_funding_approved === false &&
                typeof ListingsVM.listingDetails.funding_term === 'undefined') {
                //REGISTER Page
                ListingsVM.listingDetails.draftListingLevel = 1;
            }
            else if (ListingsVM.listingDetails.loan_product === 'PRIME' &&
                ListingsVM.listingDetails.is_partial_funding_approved === true &&
                typeof ListingsVM.listingDetails.funding_term !== 'undefined') {
                //Offers Page
                if(selectedOffersObject.code === 'OFF-0008'){
                    ListingsVM.listingDetails.draftListingLevel = 1;

                }
                else{
                    ListingsVM.listingDetails.draftListingLevel = 2;

                }

            }
        }
        function determineListingStatus() {
            switch (ListingsVM.listingDetails.status) {
                case 'SAVED_DRAFT':
                    determineSavedDraftLevel();
                    ListingsVM.showDraftListing = true;
                    break;
                case 'PENDING_ACTIVATION':
                    ListingsVM.showActiveListing = true;
                    break;
                case 'ACTIVE':
                    ListingsVM.showActiveListing = true;
                    ListingsVM.notificationType = 'notification-info';
                    break;
                case 'CANCELLED':
                case 'EXPIRED':
                    ListingsVM.showActiveListing = true;
                    ListingsVM.notificationType = 'notification-warning';
                    break;
                case 'WITHDRAWN':
                    ListingsVM.showActiveListing = true;
                    ListingsVM.notificationType = 'notification-success';
                    break;
                case 'On Hold':
                    break;
                case 'Expired':
                    break;
                case 'PENDING_COMPLETION':
                    ListingsVM.showActiveListing = true;
                    break;
                case 'Failed Group Leader Review':
                    break;

            }
        }
        function processUserListingsObject(){

            listingsModel.data = userListingsObject.result;


            userListingsObject.result.forEach(function(listingItem, listingItemNum, listingsArray){
                if(listingItemNum === 0){
                    ListingsVM.listingDetails = {
                        listing_id : listingItem.listing_id,
                        apr : listingItem.apr * 100,
                        current_rate: listingItem.current_rate,
                        amount_funded: listingItem.amount_funded,
                        amount_funded_percent: Math.round(listingItem.amount_funded_percent * 100),
                        loan_amount: listingItem.loan_amount,
                        status: listingItem.status,
                        title: listingItem.title,
                        product_spec_id: listingItem.product_spec_id,
                        is_partial_funding_approved: listingItem.is_partial_funding_approved,
                        loan_product: listingItem.loan_product

                    };
                    if(typeof listingItem.funding_term !== 'undefined'){
                        ListingsVM.listingDetails.funding_term = listingItem.funding_term;
                    }
                    if(typeof listingItem.monthly_payment !== 'undefined'){
                        ListingsVM.listingDetails.monthly_payment = listingItem.monthly_payment;
                    }
                }
            });
        }
        listingsInit();
    }]);
