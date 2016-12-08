angular.module("accountDashboardDirectives")
    .directive('prActiveListings', ['listingsService', '$rootScope', '$window', function(listingsService, $rootScope, $window){
    return {
        templateUrl: 'account/directives/pr-active-listings/active_listings_directive_tmpl.html',
        scope: true,
        restrict: "E",
        link: function(scope, element, attrs){
            ActiveListingVM.withdrawListing = function(){
              var baseUrl = window.appConfig.PROSPER_API_BASE_URL || window.appConfig.PROSPER_BASE_URL;
              $window.location = baseUrl + '/secure/account/borrower/borrower_withdraw_listing.aspx';
                // Commented out for BOR-9939 -- We are using .NET withdraw listing for now
                //var params = {
                    //id : ActiveListingVM.info.listing_id
                //}
                //listingsService.withdrawListing(params).then(function(response){
                    //ActiveListingVM.showWithdrawListing = false;
                    //ActiveListingVM.info.status = 'WITHDRAWN';
                   //ActiveListingVM.notificationType = 'notification-success';
                    //ActiveListingVM.notificationHeading = "Your loan request has been withdrawn.";
                    //ActiveListingVM.notificationSubtext = "If you've changed your mind, you can <a class='white' target='blank' href='/get-rate'>apply for a new loan</a>.";

                //});
            }

            $(document).on('click', '.getRate', function(event){
                event.stopPropagation();
                event.preventDefault();
                history.pushState({}, 'Prosper - My Account', '/myaccount');
                $window.location = '/borrower/#/prospect/pre-registration';
                return false;
            });

        },
        controller: ['$scope', 'userAccountServices', 'userModel', '$timeout', 'documentsService', 'ld', '$rootScope', function ($scope, userAccountServices, userModel, $timeout, documentsService, ld, $rootScope) {
            //remove hash if any
            removeHash();
            ActiveListingVM = this;
            if($scope.ListingsVM.showActiveListing){
                ActiveListingVM.info = $scope.ListingsVM.listingDetails;
                ActiveListingVM.showWithdrawListing = false;

                ActiveListingVM.loaderWidth = ActiveListingVM.info.amount_funded_percent + '%';
                ActiveListingVM.showLoader =  (ActiveListingVM.info.amount_funded_percent > 0);
                 ActiveListingVM.listingItemFundedStatusBar ='';
                ActiveListingVM.notificationShowClose = true;

                ActiveListingVM.notificationType = 'notification-success';
                ActiveListingVM.showNotification = true;
                ActiveListingVM.showNoDocNeeded = false;

                //check for bank validation status
                var params = {};
                params.listing_id = ActiveListingVM.info.listing_id;
                userAccountServices.bankValidationStatus(params).then(
                  function (bankInfoStatus) {
                    if(bankInfoStatus.isWaitingForCallback && bankInfoStatus.waitingTimeInSec <= 1200) {
                      $('.bank-information').hide();
                      ActiveListingVM.showNoDocNeeded = true;
                      ActiveListingVM.notificationDocType = 'no-doc-required';
                      ActiveListingVM.notificationDocHeading = "We are still verifying your bank account. Please stand by";
                    }else{
                      documentsService.getAll().then(function(data) {
                        data.listing_id = ActiveListingVM.info.listing_id;
                        data.alt_key = $scope.ListingsVM.user.alt_key;
                        //broadcast to render documents
                        $rootScope.$broadcast('docRequestCompleted', data);

                        if(ld.isEmpty(data) && ['WITHDRAWN', 'EXPIRED', 'CANCELLED'].indexOf(ActiveListingVM.info.status) === -1) {
                          ActiveListingVM.showNoDocNeeded = true;
                          ActiveListingVM.notificationDocType = 'no-doc-required';
                          ActiveListingVM.notificationDocHeading = "We currently have all we need, please standby";
                        }
                      });
                    }
                  }
                );

              switch(ActiveListingVM.info.status) {
                    case 'ACTIVE':
                    case 'PENDING_COMPLETION':
                    case 'PENDING_ACTIVATION':
                        ActiveListingVM.showNotification = false;
                        break;
                    case 'CANCELLED':
                        ActiveListingVM.notificationType = 'notification-warning';
                        ActiveListingVM.notificationHeading = "We're sorry, your loan request has been cancelled.";
                        ActiveListingVM.notificationSubtext = "We've sent you a message with full details. If you still need funds, you can <a class='white getRate' href='/borrower/#/prospect/pre-registration'>apply for a new loan</a>.";
                        break;
                    case 'EXPIRED':
                        ActiveListingVM.notificationType = 'notification-warning';
                        ActiveListingVM.notificationHeading = "We're sorry, your loan request has expired.";
                        ActiveListingVM.notificationSubtext = "If you still need funds, you can <a class='white getRate' href='/borrower/#/prospect/pre-registration'>apply for a new loan</a>.";
                        break;
                    case 'WITHDRAWN':
                        ActiveListingVM.notificationType = 'notification-success';
                        ActiveListingVM.notificationHeading = "Your loan request has been withdrawn.";
                        ActiveListingVM.notificationSubtext = "If you've changed your mind, you can <a class='white getRate' href='/borrower/#/prospect/pre-registration'>apply for a new loan</a>.";
                        break;
                }


            }

          function removeHash() {
            var loc = window.location.href,
            index = loc.indexOf('#');

            if (index > 0) {
              window.location = loc.substring(0, index);
            }
          }

        }],
        controllerAs: 'ActiveListingVM'
    };
}])
