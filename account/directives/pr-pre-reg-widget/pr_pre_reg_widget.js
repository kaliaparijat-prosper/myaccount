angular.module("accountDashboardDirectives")
    .directive('prPreRegWidget', ['$window', function($window){
        return {
            templateUrl: 'account/directives/pr-pre-reg-widget/pre_reg_widget_tmpl.html',
            scope: true,
            restrict: "E",
            controller: ['$scope', '$filter', '$rootScope', 'loansModel', 'listingsModel', function ($scope, $filter, $rootScope, loansModel, listingsModel) {
                PreRegWidgetVM = this;
                var activeListings = listingsModel.data.filter(function(listingsItem){
                    if(['SAVED_DRAFT', 'PENDING_ACTIVATION', 'ACTIVE', 'PENDING_COMPLETION', 'ON HOLD'].indexOf(listingsItem.status) !== -1){
                        return true;
                    }
                    else{
                      return false;
                    }
                });

                var filteredNonClosedLoansList = loansModel.data.filter(function(loanData){
                    if(['CLOSED'].indexOf(loanData.status) !== -1){
                        return false;
                    }
                    else{
                        return true;
                    }
                });

                var debtSalesList = loansModel.data.filter(function(loanData){
                    if(['CLOSED'].indexOf(loanData.status) !== -1 && (loanData.closed.in_debt_sale !== '-NA-' || loanData.closed.in_scra === true || loanData.closed.in_bankruptcy === true || loanData.closed.fraud_indicator !== 'N/A' || loanData.closed.charge_off_status !== 'N/A')){
                        return true;
                    }
                    else{
                        return false;
                    }
                });

                if(activeListings.length === 0 && filteredNonClosedLoansList.length === 0 && debtSalesList.length === 0){
                    PreRegWidgetVM.showWidget = true;
                }

            }],
            link: function (scope, element, attrs) {

                scope.applyNow = function(){
                    $window.location = '/borrower/#/prospect/pre-registration';
                }
            },
            controllerAs: 'PreRegWidgetVM'
        };
    }]);