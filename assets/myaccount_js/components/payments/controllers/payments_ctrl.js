angular.module('account.payments')
  .controller('PaymentsCtrl', ['$scope', 'paymentsService', 'loansModel', 'userLoans', 'userService', 'spectrumBankAccounts', function ($scope, paymentsService, loansModel, userLoans, userService, spectrumBankAccounts) {
        var PaymentsVM = this;
        PaymentsVM.priorLoan = false;
        PaymentsVM.activeLoan = false;
        PaymentsVM.init = function(){
        if(userLoans === '' || userLoans.result === null || userLoans.total_count === 0) {
        }
        else {
            loansModel.serverDataArray = [];
            loansModel.clientDataArray = [];
            loansModel.showPaymentPolicyUpdate = false;

            userService.getPaymentPolicy().then(function(showPaymentPolicyResponse){
                if(showPaymentPolicyResponse.status){
                    if(showPaymentPolicyResponse.result[0].display){
                        loansModel.showPaymentPolicyUpdate = true;
                        $(".paymentModal").css("display", "block");
                    }
                }
            });

            for (var index = 0, len = userLoans.result.length; index < len; index++) {
                if(userLoans.result[index].is_prior_loan) {
                    PaymentsVM.priorLoan = true;
                }
                if(userLoans.result[index].loan_status === "OPEN"){
                    PaymentsVM.activeLoan = true;
                }
                loansModel.serverDataArray[index] = userLoans.result[index];
                var clientData = loansModel.mapServerWithClientData(loansModel.serverDataArray[index], spectrumBankAccounts);
                loansModel.clientDataArray[index] = clientData;
            }
            PaymentsVM.loans = loansModel.data = loansModel.clientDataArray;
            PaymentsVM.getDisplayStatusForLoan = function(currentLoan, loans) {
                // display loan, if it is the only available loan OR if it is not a prior loan amongst more than one loan
                return ((currentLoan.isPriorLoan === false && loans.length > 1) || loans.length === 1);
            }
        }
    };
    PaymentsVM.init();
  }]);
