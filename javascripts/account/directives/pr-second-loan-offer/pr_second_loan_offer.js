angular.module("accountDashboardDirectives")
    .directive('prSecondLoanOffer', ['$window', function($window){
        return {
            templateUrl: 'account/directives/pr-second-loan-offer/second_loan_offer_tmpl.html',
            scope: true,
            restrict: "E",
            controller: ['$scope', 'loansService', 'loansModel', '$filter','accountEventTrackerService', function ($scope, loansService, loansModel, $filter,accountEventTrackerService) {
                SecondLoanOfferVM = this;
                SecondLoanOfferVM.loanEligibility = false;
                $scope.accountEventTrackerService = accountEventTrackerService;
                var openLoans = loansModel.data.filter(function(loan){if(loan.status !== 'CLOSED') { return true; } });
                var eligibleAmount = 35000;

                for(var i = 0; i < openLoans.length; i ++){
                    eligibleAmount = eligibleAmount - parseFloat(openLoans[i].balanceAmount_unformatted)
                }
                loansService.getSecondLoanEligiblity().then(function(response){
                    if(response.success){
                        if(response.loan_eligibility_result.eligibility_status === 'ELIGIBLE'){
                            SecondLoanOfferVM.loanEligibility = true;
                            SecondLoanOfferVM.eligibleAmount = $filter('formatCurrencyWithNoDecimalsForWholeNumbers')(eligibleAmount);
                        }
                    }
                });

            }],
            link: function (scope, element, attrs) {
                scope.applyNow = function(){
                    $window.location = '/borrower/#/prospect/pre-registration';
                }
            },
            controllerAs: 'SecondLoanOfferVM'
        };
    }]);