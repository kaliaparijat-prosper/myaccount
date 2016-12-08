angular.module("accountDashboardDirectives")
    .directive('prPriorLoans', ['$window','$modal', 'modalService', function($window,$modal,modalService){
        return {
            templateUrl: 'account/directives/pr-prior-loans/prior_loans_directive_tmpl.html',
            restrict: "E",
            controller: ['$scope', '$state','$filter','userAccountServices', 'userModel','accountEventTrackerService','loansService','accountDashboardHelpers','$modal', 'modalService', function ($scope, $state,$filter,userAccountServices, userModel,accountEventTrackerService,loansService,accountDashboardHelpers,$modal, modalService) {
                PriorLoansVM = this;
                $scope.PriorLoansVM = PriorLoansVM;
                $scope.PriorLoansVM.userLoans = $scope.$parent.userLoans.result;
                $scope.PriorLoansVM.priorLoans = [];
                PriorLoansVM.init = function() {
                    if(PriorLoansVM.userLoans) {
                        for (var i = 0; i < PriorLoansVM.userLoans.length; i++) {
                            if (PriorLoansVM.userLoans[i].is_prior_loan === true) {
                                $scope.PriorLoansVM.priorLoans.push(PriorLoansVM.userLoans[i]);
                            }
                        }
                    }
                    // display prior loan if there are prior loans AND if they are no current loans (i.e, all userLoans are priorLoans)
                    $scope.PriorLoansVM.showPriorLoans = PriorLoansVM.priorLoans.length > 0 && (PriorLoansVM.userLoans.length === PriorLoansVM.priorLoans.length)
                }
                PriorLoansVM.showPayment = function(){
                    $state.go("account.payment-details");
                };
                PriorLoansVM.init();

            }],
            link: function (scope, element, attrs) {
                scope.completeListing = function() {
                    $window.location = '/borrower/#/landing?type=legacy';
                };


            },
            controllerAs: 'PriorLoansVM '
        };
    }])
