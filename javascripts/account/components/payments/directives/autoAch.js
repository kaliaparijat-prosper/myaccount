angular.module("account.payments")
    .directive('autoAch', ['loansModel','loansService', function(loansModel, loansService){
        return {
            templateUrl: 'account/components/payments/templates/auto_ach_tmpl.html',
            scope: true,
            restrict: "E",
            controller: ['$scope', 'loansModel', 'loansService', 'userModel', '$window', function ($scope, loansModel, loansService, userModel, $window) {
                $scope.confirmation = function(){
                    var params = {
                        loan_id: $scope.loan.number.slice(1),
                        auto_ach: true,
                        source: 'web'
                    };
                    var bank_accounts_list = loansModel.spectrumBankAccounts;

                    for (var index = 0, len = bank_accounts_list.length; index < len; index++) {
                        if (bank_accounts_list[index]['account_id'] === $scope.makePaymentScheduledAccount.wholeBankInfo.account_id) {
                            params.bank_routing_number = bank_accounts_list[index]['routing_number'];
                            params.bank_account_number = bank_accounts_list[index]['account_number'];
                            params.financial_institution_name = bank_accounts_list[index]['bank_name'];
                            params.bank_account_type = bank_accounts_list[index]['account_type'];
                        }
                    }

                    params.monthly_due_date = $scope.loan.due.date.original;
                    loansService.postAutoACHOn(params).then(function (postAutoACHOnResponse) {
                      // do not allow proxy users to enable ACH on a user's behalf
                      if(postAutoACHOnResponse.error === 'E-118') {
                        $window.location = '/borrower/#/error/E-118';
                      } else {
                        if(postAutoACHOnResponse.status === true && postAutoACHOnResponse.message === 'success'){
                            $scope.$emit( "autoach_success" );
                        }
                        else{
                            $scope.$emit( "autoach_failure" );
                        }
                      }
                    }
                    );
                }

            }],
            link: function(scope, element, attrs){


            }
        };
    }]);
