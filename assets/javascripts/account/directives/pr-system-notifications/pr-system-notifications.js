angular.module("accountDashboardDirectives")
    .directive('prSystemNotifications', ['$window', 'resendEmailService', 'userModel', function($window, resendEmailService, userModel) {
        return {
            templateUrl: 'account/directives/pr-system-notifications/system_notifications_directive_tmpl.html',
            scope: {
                notificationType: '@',
                railsVariables: '='
            },
            restrict: 'E',
            controller: ['$scope', 'userAccountServices', 'userModel', function ($scope, userAccountServices, userModel) {
                $scope.showSystemNotification = false;

                function animateOpenNotification(notificationType){
                    var marginTop = "1rem";
                    if (Foundation.MediaQuery.current === "small") {
                        var marginTop = "0.625rem";
                    }
                    setTimeout(function () {
                        $(".system-notification."+notificationType).css("display", "block");
                        if(notificationType === 'email-verification'){
                            $(".system-notification."+notificationType).css("margin-top", "-5rem");
                        }
                        $(".system-notification."+notificationType).css("opacity", "0.5");
                        $(".system-notification."+notificationType).animate({
                            marginTop: "1rem", opacity: 1
                        }, 1250, function () {
                        });
                    }, 0);
                }

                if($scope.notificationType === 'email-verification') {
                    userAccountServices.checkEmailVerfication()
                        .then(
                            function (emailVerified) {
                                if (!emailVerified) {
                                    var emailAddress = userModel.user.contact_info.email;
                                    var daysDifference = 3 - moment(new Date).diff(moment(userModel.user.account_creation_date, 'YYYY-MM-DD'), 'days');
                                    // BOR-9981: bad user data may cause daysDifference to return a negative number
                                    if (daysDifference < 0) daysDifference = 0;
                                    var daysRemainingToVerify = (daysDifference === 1)? (daysDifference+" day") : (daysDifference+" days");
                                    $scope.showSystemNotification = true;
                                    $scope.notificationTitle = "Verify your email";
                                    $scope.notificationContent = "We've sent a verification email to " + emailAddress + ". This email will expire in " + daysRemainingToVerify + ".";
                                    $scope.buttonText = "Resend email";
                                    animateOpenNotification($scope.notificationType);
                                }
                            },
                            function () {
                            }
                        );
                }
                else if($scope.notificationType === 'bank-information') {
                    userAccountServices.checkBankAccountInfo().then(
                        function (bankInfoRequired) {
                            if (bankInfoRequired) {
                                $scope.showSystemNotification = true;
                                $scope.notificationTitle = "Missing bank info";
                                $scope.notificationContent = "To deposit funds into your account, we'll need to verify your bank info.";
                                $scope.buttonText = "Enter bank info";
                                animateOpenNotification($scope.notificationType);
                            }
                        }
                    );
                }
                else if($scope.notificationType === 'account-suspended') {
                    if(userModel.user.status === 'SUSPENDED') {
                        $scope.showSystemNotification = true;
                        $scope.notificationTitle = "Account suspended";
                        $scope.successMessage = true;
                        $scope.notificationContent = "Since your account has been temporarily suspended, your scheduled transfers or listings may have been cancelled. <br/> <a class='warning bold onHoldSupportLink' href='/help/support.aspx'>Please contact us.</a>";
                        animateOpenNotification($scope.notificationType);
                    }
                }
                else if($scope.notificationType === 'account-hold') {
                    if(userModel.user.status === 'ONHOLD') {
                        $scope.showSystemNotification = true;
                        $scope.notificationTitle = "Account on hold";
                        $scope.successMessage = true;
                        $scope.notificationContent = "Your account has been placed on hold. To get back on track, <a  class='warning bold onHoldSupportLink' href='/help/support.aspx'>please contact us.</a>";
                        animateOpenNotification($scope.notificationType);
                    }
                }
            }],
            link: function (scope, elem, attr, ctrl) {


                scope.notificationAction = function(){
                    scope.successMessage = true;
                    scope.loading = true;

                    if(scope.notificationType === 'email-verification'){
                        scope.successMessageText = 'Resending verification email ';

                        var params = {};
                        params.email = userModel.user.contact_info.email;
                        resendEmailService.resendEmail(params).then(function(response){
                            if(response.success === true){
                                scope.successMessageText = 'We\'ve sent you a verification email. Please check your inbox.';
                                scope.loading = false;

                            }
                        });
                    }
                    else if(scope.notificationType === 'bank-information'){
                        scope.successMessageText = 'Redirecting to bank info page ...';
                        scope.loading = false;

                        $window.location = '/borrower/#/bank-info';
                    }

                }


            }
        };
    }]);
