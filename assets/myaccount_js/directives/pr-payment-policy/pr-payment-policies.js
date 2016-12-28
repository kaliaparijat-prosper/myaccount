angular.module("accountDashboardDirectives")
    .directive('prPaymentModal', ['$window', 'userService', function($window, userService){
        return {
            templateUrl: 'account/directives/pr-payment-policy/payment_policies_directive_tmpl.html',
            scope: true,
            restrict: "E",
            controller: ['$scope', 'userAccountServices', 'userModel', 'userService', function ($scope, userAccountServices, userModel, userService) {
                PaymentModalVM = this;
                $scope.userReadThePolicyUpdate = false;

            }],
            link: function (scope, element, attrs) {
                scope.$watch("userReadThePolicyUpdate", function (attr) {
                    if(typeof scope.userReadThePolicyUpdate !== 'undefined' && scope.userReadThePolicyUpdate === true){
                        userService.postPaymentPolicy().then(function(postPaymentPolicyResponse){
                            console.log("postPaymentPolicyResponse", postPaymentPolicyResponse.status);
                        });
                    }

                });
            },
            controllerAs: 'PaymentModalVM'
        };
    }]);