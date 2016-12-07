angular.module("accountDashboardDirectives")
    .directive('prPaymentDetails', ['$window','$modal', 'modalService', function($window,$modal,modalService){
        return {
            templateUrl: 'account/directives/pr-payment-details/payment_details_directive_tmpl.html',
            restrict: "E",
            controller: ['$scope', '$state','$filter','userAccountServices', 'userModel','accountEventTrackerService','loansService','accountDashboardHelpers','$modal', 'modalService',function ($scope, $state,$filter,userAccountServices, userModel,accountEventTrackerService,loansService,accountDashboardHelpers,$modal, modalService) {
                var PaymentDetailsVM = this;
                $scope.PaymentDetailsVM = PaymentDetailsVM;
                $scope.showPaymentGridDetails = false;
                $scope.loan_number=0;
                $scope.showPaymentHistory = true;

                PaymentDetailsVM.showPaymentHistory= function() {
                    if ($scope.loan === undefined){
                        $scope.loan_number = $scope.item.loan_number;
                    }
                    else{
                        $scope.loan_number = $scope.loan.number.slice(1);
                    }
                        loansService.getPaymentHistory($scope.loan_number).then(function (data) {
                            PaymentDetailsVM.results = data.result;
                            PaymentDetailsVM.paymentDate = data.result[0].payment_effective_date;
                            PaymentDetailsVM.paymentType = data.result[0].payment_type;
                            PaymentDetailsVM.amount = data.result[0].total_paid;
                            PaymentDetailsVM.principal = data.result[0].principal;
                            PaymentDetailsVM.interest = data.result[0].interest;
                        });
                        loansService.getScheduledPayment($scope.loan_number).then(function (paymentdata) {
                            PaymentDetailsVM.scheduledPayment = paymentdata;
                            var target = ($scope.item)?$('#'+ "prior_"+$scope.loan_number):$('#'+ $scope.loan_number);
                            $('html, body').animate({
                                scrollTop: target.offset().top - 50
                            },900);
                            $scope.showPaymentDetailsTable = true;
                        });
                };
                $scope.accountEventTrackerService = accountEventTrackerService;
                PaymentDetailsVM.showPayment = function(){
                    var param_loan_number = ($scope.item)? $scope.$parent.item.loan_number: $scope.$parent.loan.number.slice(1);
                    var param_loan_desc = ($scope.item)?$scope.$parent.item.loan_description: $scope.$parent.loan.purpose;
                    var param_loan_amt =  ($scope.item)?$scope.$parent.item.amount_borrowed: $scope.$parent.loan.amountBorrowedWithNoDecimal;
                    $state.go("account.payment-details",{
                        loan_number: param_loan_number,
                        loan_description:param_loan_desc,
                        loan_amount : param_loan_amt
                    } );
                };
                PaymentDetailsVM.welcomeModal = function(paymentId,amt,date){
                    var params={
                        loan_id:$scope.loan_number,
                        payment_id:paymentId,
                        amount:amt,
                        date:date
                    };
                    modalService.showCancelPayment('static', params, 'cancel-payment-modal small reveal new-modal');
                };
            }],
            link: function (scope, element, attrs) {
                scope.hideAllPayment = function() {
                    var target = (scope.item)?$('#'+ "prior_"+scope.loan_number):$('#'+ scope.loan_number);
                    $('html, body').animate({
                        scrollTop: (target.offset().top)
                    },900);
                    scope.showPaymentDetailsTable=false;
                };


            },
            controllerAs: 'PaymentDetailsVM'
        };
    }])
    .controller('PaymentDetailsGridCtrl', ['$scope','$state','userAccountServices', 'userModel','accountEventTrackerService','loansService','$modal', 'modalService','$timeout','$filter','$stateParams', function($scope,$state,userAccountServices, userModel,accountEventTrackerService,loansService,$modal, modalService,$timeout,$filter,$stateParams) {
        PaymentDetailsGridVM = this;
        PaymentDetailsGridVM.list={};
        PaymentDetailsGridVM.loan_description="";
        $scope.PaymentDetailsGridVM=PaymentDetailsGridVM;
        $scope.PaymentDetailsGridVM.busy=true;
        $scope.PaymentDetailsGridVM.temparr = [];
        $scope.loan_number=0;
        PaymentDetailsGridVM.init= function() {
             PaymentDetailsGridVM.loan_description =  $stateParams.loan_description;
                PaymentDetailsGridVM.loan_amount = $stateParams.loan_amount;
                $scope.PaymentDetailsGridVM.loan_number = $stateParams.loan_number;
                loansService.getScheduledPayment(PaymentDetailsGridVM.loan_number).then(function (paymentdata) {
                    $scope.PaymentDetailsGridVM.scheduledPayment = paymentdata;
                    for(var j=0;j<paymentdata.length;j++){
                        $scope.PaymentDetailsGridVM.temparr.push(paymentdata[j]);
                    }
                });
            loansService.getPaymentHistory(PaymentDetailsGridVM.loan_number).then(function (data) {
                $scope.PaymentDetailsGridVM.paymentHistory = data.result;
                for(var item=0;item<data.result.length;item++){
                    $scope.PaymentDetailsGridVM.temparr.push(data.result[item]);
                }

                $scope.PaymentDetailsGridVM.results = [];
                for (var i = 0; i <= 4; i++) {
                    $scope.PaymentDetailsGridVM.results.push( $scope.PaymentDetailsGridVM.temparr[i]);
                }
                $scope.PaymentDetailsGridVM.totalCount=$scope.PaymentDetailsGridVM.temparr.length;

                PaymentDetailsGridVM.paymentDate = data.result[0].payment_effective_date;
                PaymentDetailsGridVM.paymentType = data.result[0].payment_type;
                PaymentDetailsGridVM.amount = data.result[0].total_paid;
                PaymentDetailsGridVM.principal = data.result[0].principal;
                PaymentDetailsGridVM.interest = data.result[0].interest;
            });
            $scope.PaymentDetailsGridVM.busy=false;
        };
        var target = $('.payment-grid');
        $('html, body').animate({
            scrollTop: target.offset().top - 50
        },900);
        $scope.showGridView=true;

        PaymentDetailsGridVM.loadMore = function() {

            if($scope.PaymentDetailsGridVM.results) {
                var maxLength = $scope.PaymentDetailsGridVM.temparr.length;
                var last = $scope.PaymentDetailsGridVM.results.length-1;
                for (var i = 1; i <= 5; i++) {
                    if($scope.PaymentDetailsGridVM.temparr[last + i]) {
                        $scope.PaymentDetailsGridVM.results.push($scope.PaymentDetailsGridVM.temparr[last + i]);
                    }
                }
            }
        };

        PaymentDetailsGridVM.back = function(){
            $state.go("account.home");
        };
        PaymentDetailsGridVM.welcomeModal = function(paymentId,amt,date){
            var params={
                loan_id: $scope.PaymentDetailsGridVM.loan_number,
                payment_id: paymentId,
                amount: amt,
                date: date
            };
            modalService.showCancelPayment('static',params,'cancel-payment-modal small reveal new-modal');
        };
      PaymentDetailsGridVM.init();


    }])
    .controller('PaymentCancelCtrl', ['$scope','$state','loansService','$modal', 'modalService','modalParams', 'paymentNotifications','$filter', function($scope,$state,loansService,$modal,modalService,modalParams, paymentNotifications,$filter) {
        var PaymentCancelVM = this;
        $scope.PaymentCancelVM = PaymentCancelVM;
        $scope.PaymentCancelVM.amount = modalParams.amount;

        $scope.PaymentCancelVM.cancel = function () {
            modalService.close();
        };

        PaymentCancelVM.yesContinue = function () {
            loansService.cancelScheduledPayment(modalParams.loan_id, modalParams.payment_id).then(function (paymentData) {
                $scope.pay_amount =$filter('currency')(modalParams.amount,'$',2);
                $scope.pay_date = modalParams.date;
               var paymentEle = $("tr#pay_" + modalParams.payment_id);
                if(paymentData.message === "success" && paymentEle) {
                    paymentEle.remove();
                    modalService.close();
                    if(typeof angular.element($('#'+modalParams.loan_id)).scope() === 'undefined'){
                        paymentNotifications.notifications.push({
                            amount: $scope.pay_amount,
                            date: $scope.pay_date,
                            loan_id: modalParams.loan_id
                        });
                    }
                    else{
                        angular.element($('#'+modalParams.loan_id)).scope().cancelPaymentNotification($scope.pay_amount,$scope.pay_date);
                        angular.element($('#'+modalParams.loan_id)).scope().$apply();
                    }
                }
                else{
                    modalService.close();
                }
            });

        }
}]);
