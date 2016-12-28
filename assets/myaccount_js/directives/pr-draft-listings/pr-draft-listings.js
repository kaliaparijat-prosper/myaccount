angular.module("accountDashboardDirectives")
    .directive('prDraftListings', ['$window', 'featureFlags', function($window, featureFlags){
        return {
            templateUrl: 'account/directives/pr-draft-listings/draft_listings_directive_tmpl.html',
            scope: true,
            restrict: "E",
            controller: ['$scope', 'userAccountServices', 'userModel','accountEventTrackerService', function ($scope, userAccountServices, userModel,accountEventTrackerService) {
                DraftListingVM = this;
                DraftListingVM.info = $scope.ListingsVM.listingDetails;
                $scope.accountEventTrackerService = accountEventTrackerService;
            }],
            link: function (scope, element, attrs) {
                scope.completeListing = function() {
                    window.location = '/borrower/#/offers?loan_amount='+DraftListingVM.info.loan_amount + '&listing_category_id='+DraftListingVM.info.draftListingLevel+'&credit_quality_id=1&loan_purpose_id=0';
                };

            },
            controllerAs: 'DraftListingVM'
        };
    }]);
