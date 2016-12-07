angular.module("account.payments", [
        "pickadate",
        'ngSanitize',
        'accountDashboardDirectives',
        'paymentNotificationsModule'
    ])
    .directive('prPaymentWidget', ['paymentsService', 'userModel', 'loansModel', 'loansService', '$filter', '$timeout', '$window', 'paymentNotifications', function (paymentsService, userModel, loansModel, loansService, $filter, $timeout, $window, paymentNotifications) {
        return {
            restrict: 'E',
            scope: true,
            controller: ['$scope', '$rootScope', 'loansService', '$filter', '$compile','accountEventTrackerService', function ($scope, $rootScope, loansService, $filter, $compile,accountEventTrackerService) {
                $scope.autoPay = {
                    tooltip: false
                };
                $scope.accountEventTrackerService = accountEventTrackerService;

                $scope.autoPayUnavailableText = "AutoPay cannot be turned on until you manually submit a payment and bring your account current.";

                $scope.fieldError = {
                    makePaymentScheduledAccount: null,
                    makePaymentScheduledDate: null,
                    makePaymentScheduledAmount: null
                };

                $scope.showDueWarningText = false;
                $scope.showAutoPayRow = true;
                $scope.showMorePaymentInformation = false;
                $scope.showMoreAutoACHInformation = false;
                $scope.payoffAmount = '';
                $scope.showPaymentConfirmationAdditionalInfo = false;
                $scope.showAutoACH = false;
                $scope.showLoanMainContent = true;
                $scope.persistedNotifications = [];
                $scope.autoPayStatusText = $scope.loan.autopay.status;
                $scope.notifications = [];
                $scope.showPaymentBar = false;
                $scope.showLoanDetailsTable = false;
                $scope.autoPayDisabled = false;
                $scope.showAdditionalInfoRow = false;
                $scope.showDetailsThirdRow = true;
                $scope.loan.statusText = 'FUNDED';
                $scope.loan.autopay.unavailable = false; // autopay is only 'unavailable' when a loan is bankrupt or charged off or late loan
                $scope.noAmountDue = $filter('formatCurrency')(0);
                $scope.paymentRequestInProgress = false;
                $scope.addConfirmClass=false;
                $scope.addFailClass=false;
                $scope.thinPaymentBtn = false;
                $scope.cancelPaymentNotification=function(amount,date){
                    loanWidgetHelpers.renderNotification('notification-success', 'Thank you, You have cancelled your payment of '+ amount+ ' for ' + $filter('formatDate1')(date),  '', true, true);

                };
                $scope.makePayment = {
                    footerIcon: $scope.railsVariables.clockIcon,
                    message: '',
                    bankAccount: $scope.loan.selectedBankAccount,
                    date: moment().format("MM/DD/YY"),
                    footerAttention: false
                };

                var getScheduledPaymentSuccessMessage = function (amt, date) {
                    return 'Thank you, you\'ve scheduled a payment of ' + $filter('formatCurrency')(amt) + ' for ' + $filter('formatDate1')(date) + '. ';
                };

                var daysAfterOrigination = moment().diff(moment($scope.loan.originatedDate, "MMM. DD, YYYY"), 'days');
                var daysBetweenOriginationAndDueDate = moment($scope.loan.due.date.next, "MMM. DD, YYYY").diff(moment($scope.loan.originatedDate, "MMM. DD, YYYY"), 'days');
                var daysBeforeDueDate = loansModel.businessHelpers.noOfDaysBefore($scope.loan.due.date.next);
                $scope.makePaymentScheduledAccount = $scope.loan.selectedBankAccount;
                $scope.accountId = $filter('formatBankAccountName')($scope.makePaymentScheduledAccount.wholeBankInfo.account_id);

                var manualPaymentDefaultMessage = 'Your payment has been scheduled. Because you chose manual payments method, you authorized Prosper to take your first monthly payment via electronic transfer from your bank account on the due date. For future payments, please manually make your next monthly payments below.';
                var autoPayOnMessage = '<div id="auto-pay-tooltip-text" > <div> <p class="disclaimer light autoPayToolTipTextContent">Never miss a payment with AutoPay. If you need to turn off AutoPay, please call us at (866) 615-6319 during:</p> </div> <div class="make-table autoPayTooltipContentWrapper autoPayToolTipTextContent"> <div class="make-table-cell autoPayTooltipContentLeft autoPayToolTipTextContent"> <p class="disclaimer light autoPayToolTipTextContent">Monday - Friday</p> <p class="disclaimer light autoPayToolTipTextContent">5am - 6pm (PST)</p> <p class="disclaimer light autoPayToolTipTextContent">8am - 9pm (EST)</p> </div> <div class="autoPayToolTipTextContent make-table-cell autoPayTooltipContentRight"> <p class="disclaimer light autoPayToolTipTextContent">Saturday</p> <p class="disclaimer light autoPayToolTipTextContent">6am - 2:30pm (PST)</p> <p class="disclaimer light autoPayToolTipTextContent">9am - 5:30pm (EST)</p> </div> </div> </div>';
                var autoPayOffTooltipMessage = 'Avoid late fees with AutoPay. Choose a bank account for recurring monthly payments and you\'re all set. Payment will be debited on the due date. Turn off AutoPay at any time.';

                var loanWidgetHelpers = {
                    renderNotification: function (type, heading, subtext, showClose, temporary, scroll) {

                        var notificationModel = {
                            type: type,
                            heading: heading,
                            subtext: subtext,
                            showClose: showClose,
                            scroll: (typeof scroll !== 'undefined') ? scroll : false
                        };
                        $scope.persistedNotifications.orderId = $scope.persistedNotifications.length + 1;
                        $scope.persistedNotifications.push(notificationModel);
                    }
                };
                if(paymentNotifications.notifications.length > 0){
                    for(var i=0;i<paymentNotifications.notifications.length;i++) {
                        loanWidgetHelpers.renderNotification('notification-success', 'Thank you, You have cancelled your payment of ' + paymentNotifications.notifications[i].amount + ' for ' + $filter('formatDate1')(paymentNotifications.notifications[i].date), '', true, true);
                    }
                    paymentNotifications.notifications.length=0;
                }

                if (loansModel.businessHelpers.isCurrentTimeAfterCutOff()) {
                    $scope.makePaymentScheduledDate = moment().add(1, 'day').format("MM/DD/YY");
                    $scope.startDate = moment().add(1, 'day')._d;
                    $scope.placeholderText = moment().add(1, 'day').format("MM/DD/YY");
                }
                else {
                    $scope.makePaymentScheduledDate = moment().format("MM/DD/YY");
                    $scope.startDate = moment()._d;
                    $scope.placeholderText = moment().format("MM/DD/YY");
                }

                if($scope.loan.bankAccounts.length === 0){
                    //$scope.paymentForm.makePaymentScheduledAccount.$invalid = true;
                    $scope.autoPayUnavailableText = "To turn on AutoPay, you'll need a valid bank account. Please contact us for more information.";
                    $scope.fieldError.makePaymentScheduledAccount = 'To add an account, please contact us.';

                }


                $scope.$on('autoach_success', function(event) {
                    $scope.showLoanMainContent = true;
                    $scope.showPaymentConfirmation = false;
                    $scope.showAutoACH = false;
                    loanWidgetHelpers.renderNotification('notification-success', 'AutoPay will be turned on.', 'Your request to turn on AutoPay is being processed.', true, true);
                    $scope.makePayment.message = '';
                    $scope.autoPayStatusText = 'ON';
                    $scope.autoPayTooltiptext = autoPayOnMessage;
                });

                $scope.$on('autoach_failure', function(event) {
                    $scope.showLoanMainContent = true;
                    $scope.showPaymentConfirmation = false;
                    $scope.showAutoACH = false;
                    loanWidgetHelpers.renderNotification('notification-failure', 'AutoPay cannot be turned on.', 'We\'re experiencing a technical issue, please try later.', true, true);
                });

                $scope.latePayment = function() {
                    if ($scope.loan.daysPastDue > 0 && $scope.loan.isPaidOff != true) {
                        var pastDueDate = $filter('formatDateWithSuffix')(moment($scope.loan.due.date.past).format("MM/DD/YYYY"));
                        $scope.loan.statusText = '<h6 class="make-inline-block strong attention">LATE</h6>';

                        $scope.rightPane.row4 = {
                            label: 'Past due on ' + pastDueDate,
                            tooltipText: 'Past due (monthly payment + interest)',
                            tooltip: false,
                            message: '<h6 class="strong attention make-inline-block">' + $scope.loan.daysPastDue + ' days past due</h6>',
                            totalMissedPayment: $filter('formatCurrency')($scope.loan.totalMissedPayment),
                            subRows: {
                                row1: {
                                    label: 'Past due fees',
                                    message: $filter('formatCurrency')($scope.loan.lateFeeAmount)
                                },
                                row2: {
                                    label: 'Non-Sufficient Funds(NSF) fees',
                                    message: $filter('formatCurrency')($scope.loan.nsfFees)
                                },
                                row3: {
                                    label: 'Current monthly payment due ' + $filter('formatDateWithSuffix')($scope.loan.due.date.next),
                                    message: $scope.loan.due.amount.monthly
                                },
                                row4: {
                                    label: '<strong>Total payment due</strong>',
                                    message: '<strong>' + $scope.loan.due.amount.total + '</strong>'
                                }
                            }
                        };
                        $scope.showDetailsThirdRow = false;
                        $scope.showDetailsFourRow = true;

                        if (parseFloat($scope.loan.lateFeeAmount) === 0) {
                            delete $scope.rightPane.row4.subRows.row1;
                        }

                        if (parseFloat($scope.loan.nsfFees) === 0) {
                            delete $scope.rightPane.row4.subRows.row2;
                        }

                        if(typeof $scope.loan.due.amount.total !== 'string' || $scope.loan.due.amount.total === null){
                            $scope.makePaymentScheduledAmount = 0.00;
                        }
                        else {
                            $scope.makePaymentScheduledAmount = parseFloat($scope.loan.due.amount.total_unformatted);
                        }
                        loanWidgetHelpers.renderNotification('notification-failure', ('Your loan is ' + $scope.loan.daysPastDue + ' days past due (payment was due ' + pastDueDate + ').'), 'Please make a payment below to bring your account current.', false, false);
                    }
                };

                $scope.initLoan = function () {

                    $scope.runPaymentBarPassSanityCheck = function(){
                        $scope.fieldError.makePaymentScheduledAmount = null;
                        if (typeof $scope.makePaymentScheduledDate === 'undefined') {
                            $scope.makePaymentScheduledDate = moment($scope.placeholderText,'MM/DD/YY').format("MM/DD/YY");
                        }
                        if (isNaN(parseInt($scope.makePaymentScheduledAmount)) ===
                            true) {
                            $scope.paymentForm.scheduledPaymentAmount.$invalid = true;
                            $scope.fieldError.makePaymentScheduledAmount = 'Please enter a valid amount.';
                        }
                        else if (parseInt($scope.makePaymentScheduledAmount) === 0) {
                            $scope.paymentForm.scheduledPaymentAmount.$invalid = true;
                            $scope.fieldError.makePaymentScheduledAmount = 'Make sure your payment amount is greater than zero.';
                        }
                        else if(parseFloat($scope.makePaymentScheduledAmount) > $scope.loan.payOffAmount_unformatted){
                            $scope.fieldError.makePaymentScheduledAmount = 'Payment amount cannot be greater than payoff amount';
                            $scope.paymentForm.scheduledPaymentAmount.$invalid = true;

                        }
                        else if($scope.makePaymentScheduledAccount.wholeBankInfo.account_id === 'closed bank account'){
                            $scope.paymentForm.selectBankAccount.$invalid = true;
                            $scope.fieldError.makePaymentScheduledAccount = 'To add an account, please contact us.';
                        }
                        else{
                            $scope.paymentForm.selectBankAccount.$invalid = false;
                            $scope.paymentForm.scheduledPaymentAmount.$invalid = false;
                            $scope.paymentForm.validatedDateInput.$invalid = false;

                            $scope.fieldError = {
                                makePaymentScheduledAccount: null,
                                makePaymentScheduledDate: null,
                                makePaymentScheduledAmount: null
                            };
                            return true;
                        }
                        return false;
                    }

                    $scope.validatePaymentFields = function (AutoACH) {
                        if($scope.runPaymentBarPassSanityCheck()) {
                            if ($scope.loan.autopay.status === 'OFF' && parseFloat($scope.makePaymentScheduledAmount) > parseFloat($scope.loan.due.amount.monthly.slice(1))) {
                                $scope.showPaymentConfirmationAdditionalInfo = true;
                            }
                            else if ($scope.loan.autopay.status === 'ON') {
                                $scope.showPaymentConfirmationAdditionalInfo = true;
                            }
                            else {
                                $scope.showPaymentConfirmationAdditionalInfo = false;
                            }
                            $scope.showPaymentConfirmation = true;
                            $scope.showLoanMainContent = false;
                        }
                    };

                    $scope.scrollToLoanTitle = function () {
                        var loanSection =  $('.show-for-small .loans-section.panel-secondary');
                        var titleBarHeight = $('.title-bar').css('height');
                        $window.scrollTo(0, (loanSection.offset().top  - titleBarHeight));
                    };

                    if($filter('formatCurrency')($scope.makePaymentScheduledAmount)=== $scope.loan.payOffAmount){
                        $scope.accountEventTrackerService.trackEvents('event_user_paid_loan_off_early');
                    }

                    if ($scope.loan.hasNextScheduledPayment === true && !_.isEmpty($scope.loan.next)) {
                        loanWidgetHelpers.renderNotification('notification-success', getScheduledPaymentSuccessMessage($scope.loan.next.schedulePaymentAmount, $scope.loan.next.schedulePaymentDate), '', true, true);
                    }

                    $scope.loan.closedStatusBar = false;
                    $scope.debtSale = '';
                    $scope.loan.monthlyPaymentAmount = $scope.loan.due.amount.total;


                    if ($scope.loan.status === 'FLATCANCLD') {
                      var cancelledLoanNotificationText = "We're sorry, your loan request has been cancelled.";
                      loanWidgetHelpers.renderNotification('notification-reminder', cancelledLoanNotificationText, '', false, false);
                      $scope.loan.statusText = 'Cancelled';
                      $scope.isFlatCancelledLoan = true;
                    }
                    else if ($scope.loan.status === 'CLOSED') {
                        $scope.debtSale = true;
                        $scope.showAdditionalInfoRow = false;
                        $scope.showAutoPayRow = false;
                        $scope.showLoanDetailsTable = false;
                        $scope.showDetailsThirdRow = false;
                        $scope.autoPayTooltiptext = autoPayOnMessage;
                        $scope.loan.paidOffPercentage = $scope.loan.paidOffPercentage

                        if (typeof $scope.loan.closed.in_debt_sale !== 'undefined' && $scope.loan.closed.in_debt_sale !== '-NA-' && $scope.loan.closed.in_debt_sale !== 'N/A') {

                            var closedLoanNotificationText = 'Your loan is late/charged off';
                            loanWidgetHelpers.renderNotification('notification-failure', closedLoanNotificationText, '', false, false);
                            $scope.loan.statusText = 'Debt sale';
                        }
                        else if (typeof $scope.loan.closed.in_debt_sale !== 'undefined' && $scope.loan.closed.in_scra === true) {
                            $scope.loan.statusText = 'Closed';
                        }
                        else if (typeof $scope.loan.closed.in_debt_sale !== 'undefined' && $scope.loan.closed.in_bankruptcy === true) {
                            var closedLoanNotificationText = 'Your loan is late/charged off';
                            loanWidgetHelpers.renderNotification('notification-failure', closedLoanNotificationText, '', false, false);
                            $scope.loan.statusText = 'Bankruptcy';
                        }
                        else if (typeof $scope.loan.closed.in_debt_sale !== 'undefined' && $scope.loan.closed.fraud_indicator !== 'N/A') {
                            $scope.loan.statusText = 'Closed';
                        }
                        else if (typeof $scope.loan.closed.in_debt_sale !== 'undefined' && $scope.loan.closed.charge_off_status !== 'N/A') {
                            var closedLoanNotificationText = 'Your loan is late/charged off';
                            loanWidgetHelpers.renderNotification('notification-failure', closedLoanNotificationText, '', false, false);
                            $scope.loan.statusText = 'Debt sale';
                        }
                        else {
                            $scope.debtSale = false;
                            $scope.loan.closedStatusBar = true;
                            $scope.loan.statusText = 'PAID OFF';
                            ($scope.loan.paidOffPercentage === 0) ? $scope.loan.paidOffPercentage = 100 : $scope.loan.paidOffPercentage = $scope.loan.paidOffPercentage;
                            loanWidgetHelpers.renderNotification('notification-info', 'Congratulations', 'You\'ve paid off your loan.', true, true);
                        }
                    }
                    else if ($scope.loan.status === 'IN BANKRUPTCY' || $scope.loan.status === 'CHARGED OFF') {
                        $scope.loan.status =  $scope.loan.status.charAt(0) + $scope.loan.status.slice(1).toLowerCase();
                        $scope.loan.statusText = '<h6 class="make-inline-block strong attention">' + $scope.loan.status +'</h6>';
                        $scope.loan.autopay.unavailable = true; // set this to false under the event a loan is bankrupt or is charged off.
                        $scope.autoPayTooltiptext = autoPayOnMessage;
                        $scope.showAutoPayRow = true;
                        $scope.showLoanDetailsTable = false;

                        $scope.rightPane = {
                            row1: {
                                label: 'Remaining balance',
                                tooltipText: 'Payoff amount as of today (principal + interest + any late fees)',
                                tooltip: false,
                                message: null,
                                amount: $scope.loan.payOffAmount
                            },
                            row2: {
                                label: 'Last payment',
                                tooltipText: 'This is your last posted payment. Scheduled payments are not included.',
                                tooltip: false
                            },
                            row3: {
                                label: 'Total payment due',
                                boldLabel: true,
                                tooltipText: 'Payment after 8 p.m. EST will be made the next business day.',
                                tooltip: false
                            }
                        };

                        if ($scope.loan.payment.history === true && $scope.loan.payment.last.amount !== '$0') {
                            $scope.rightPane.row2.message = 'POSTED ' + $scope.loan.payment.last.mode + ' from ' + $scope.loan.payment.last.account + ' on ' + $scope.loan.payment.last.date + '&nbsp;';
                        }
                        else if ($scope.loan.payment.history === false) {
                            $scope.loan.payment.last.amount = 'N/A';
                        }

                        $scope.firstBill = true;
                        $scope.makePaymentScheduledAmount = parseFloat(parseFloat($scope.loan.payOffAmount.slice(1).replace(/,/g, '')).toFixed(2));
                        var notificationText = 'Your loan is late/charged off';
                        if($scope.loan.status.toUpperCase() === 'IN BANKRUPTCY'){
                            notificationText = 'Your loan is in bankruptcy.';
                        }
                        loanWidgetHelpers.renderNotification('notification-failure', notificationText, 'Please pay off your total balance of '+ $scope.loan.payOffAmount +' to bring your account current.', false, false);
                        $scope.makePayment.message = 'Please pay off your total balance of '+ $scope.loan.payOffAmount +' to bring your account current.';
                        $scope.makePayment.footerIcon = $scope.railsVariables.exclamationIconRed;
                        $scope.makePayment.footerAttention = true;
                        $scope.showPaymentBar = true;
                        $scope.loan.monthlyPaymentAmount = $scope.loan.payOffAmount;
                    }
                    if ($scope.loan.autopay.status === 'ON') {
                        $scope.addConfirmClass=false;
                        $scope.addFailClass=false;
                        if($scope.loan.due.amount.total_unformatted > 0) {
                            $scope.loan.monthlyPaymentAmount = $scope.loan.due.amount.monthly;
                        }
                        else{
                            $scope.loan.monthlyPaymentAmount = $scope.loan.due.amount.total;
                        }
                          $scope.autoPayTooltiptext = autoPayOnMessage;
                          $scope.showPaymentBar = false;
                          $scope.makePaymentScheduledAmount = parseFloat($scope.loan.due.amount.monthly_unformatted);

                          if ($scope.loan.due.date.next !== 'N/A' && $scope.loan.daysPastDue === 0) {
                              $scope.makePayment.message = "You\'re all set. Your automatic payment is scheduled for " + $scope.loan.due.date.next;
                          }
                          else {
                              $scope.makePayment.message = '';
                          }

                          if (!$scope.loan.payment.history) {
                              $scope.loan.payment.last.amount = 'N/A';
                              if (daysAfterOrigination <= 15) {
                              }
                          }

                          if ( $scope.loan.status !== 'CLOSED' && !$scope.debtSale && $scope.loan.autopay.pendingActivation) {
                              loanWidgetHelpers.renderNotification('notification-reminder', 'Your request to turn on AutoPay is being processed.', '', true, false);
                          }

                          $scope.rightPane = {
                              row1: {
                                  label: 'Remaining balance',
                                  tooltipText: 'Payoff amount as of today (principal + interest + any late fees)',
                                  tooltip: false,
                                  message: null,
                                  amount: $scope.loan.payOffAmount
                              },
                              row2: {
                                  label: 'Last payment',
                                  tooltipText: 'This is your last posted payment. Scheduled payments are not included.',
                                  tooltip: false,
                                  message: ''
                              },
                              row3: {
                                  label: 'Monthly automatic payment',
                                  tooltipText: 'Payment after 8 p.m. EST will be made the next business day.',
                                  tooltip: false,
                                  message: 'SCHEDULED for ' + $scope.loan.due.date.next
                              }
                          };

                          if ($scope.loan.payment.history && $scope.loan.payment.last.amount !== '$0') {
                              $scope.rightPane.row2.message = 'POSTED ' + $scope.loan.payment.last.mode + ' from ' + $scope.loan.payment.last.account + ' on ' + $scope.loan.payment.last.date + '&nbsp;';
                          }
                          $scope.latePayment();

                          // To turn ON AutoPay, the request is made by the user, but its not yet processed by Spectrum.
                          if ($scope.loan.autopay.pendingActivation && $scope.loan.status !== 'CLOSED') {
                              $scope.autoPayDisabled = true;
                          }
                          else if (!$scope.loan.autopay.pendingActivation && $scope.loan.autopay.pendingActivation !== 'NA' && typeof $scope.loan.autopay.activationDate !== 'undefined' && $scope.loan.autopay.activationDate !== 'N/A' && $scope.loan.status !== 'CLOSED' && $scope.loan.due.date.next !== 'N/A' && (moment().isBefore(moment($scope.loan.autopay.activationDate, "YYYY-MM-DD")) || moment().isSame(moment($scope.loan.autopay.activationDate, "YYYY-MM-DD")))) {
                              $scope.isAutoPayFeasibleForNextDue = false;
                              var autoPayActivationDate = $scope.loan.autopay.activationDate;
                              var autoPayActivationDateUIFormat = moment($scope.loan.autopay.activationDate, 'YYYY-MM-DD').format("MMM. DD, YYYY");
                              var dueDateReFormatted = moment($scope.loan.due.date.next, 'MMM. DD, YYYY').format("YYYY-MM-DD");

                              if (autoPayActivationDate === dueDateReFormatted) {
                                  $scope.autoPayConfirmationText = 'AutoPay is scheduled for ' + autoPayActivationDateUIFormat + '. ' + 'After that, payments will occur on the ' + $filter('formatDateWithOnlySuffix')(moment(autoPayActivationDateUIFormat, 'MMM. DD, YYYY')) + ' of each month.';
                                  $scope.autoPayFooterText = "You\'re all set. Your automatic payment is scheduled for " + autoPayActivationDateUIFormat;
                                  $scope.isAutoPayFeasibleForNextDue = true;
                                  loanWidgetHelpers.renderNotification('notification-success', $scope.autoPayConfirmationText, '', true, true);
                              }
                              else {
                                  $scope.rightPane.row3.message = 'SCHEDULED for ' + autoPayActivationDateUIFormat;
                                  $scope.autoPayConfirmationText = 'AutoPay is scheduled for ' + autoPayActivationDateUIFormat + '. ' + 'After that, payments will occur on the ' + $filter('formatDateWithOnlySuffix')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) + ' of each month.';
                                  $scope.autoPayFooterText =  'AutoPay is scheduled for ' + autoPayActivationDateUIFormat + '.<br/>'  + '<span>Please manually make the current monthly payment of ' +$scope.loan.due.amount.monthly+' by '+ $filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) +'.</span>';
                                  $scope.makePayment.message =  'AutoPay is scheduled for ' + autoPayActivationDateUIFormat + '.<br/>'  + '<span>Please manually make the current monthly payment of ' +$scope.loan.due.amount.monthly+' by '+ $filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) +'.</span>';
                                  $scope.showPaymentBar = true;
                                  $scope.autoPayDisabled = true;
                                  loanWidgetHelpers.renderNotification('notification-reminder', $scope.autoPayConfirmationText,  'Please manually make the current monthly payment of ' +$scope.loan.due.amount.monthly+' by '+$filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) +'.', false, false);
                              }
                          }
                      }
                      else if ($scope.loan.autopay.status === 'OFF') {
                          $scope.loan.monthlyPaymentAmount = $scope.loan.due.amount.total;
                          $scope.showPaymentBar = true;
                          $scope.makePayment.message = '';
                          $scope.makePaymentScheduledAmount = parseFloat($scope.loan.due.amount.total_unformatted)
                          $scope.autoPayTooltiptext = autoPayOffTooltipMessage;

                          if($scope.loan.autopay.pendingActivation){
                              loanWidgetHelpers.renderNotification('notification-reminder', 'Your request to turn off AutoPay is being processed!', '', true, false);
                              $scope.autoPayDisabled = true;
                          }

                          if (!$scope.loan.payment.history) {
                              $scope.loan.payment.last.amount = 'N/A';
                              if(daysAfterOrigination <= 31 && daysBeforeDueDate > 10){
                                  loanWidgetHelpers.renderNotification('notification-success', 'Congratulations, Your loan has been funded.', '', true, true);
                                  $scope.showDetailsThirdRow = false;
                                  $scope.additionalInfoRowMessage = manualPaymentDefaultMessage;
                                  $scope.showAdditionalInfoRow = true;
                              }
                              else if(daysAfterOrigination <= 31 && daysBeforeDueDate <= 10) {
                                  $scope.showDetailsThirdRow = true;
                                  $scope.showAdditionalInfoRow = false;
                                  $scope.firstBill = true;
                              }
                          }

                          $scope.rightPane = {
                              row1: {
                                  label: 'Remaining balance',
                                  tooltipText: 'Payoff amount as of today (principal + interest + any late fees)',
                                  tooltip: false,
                                  message: null,
                                  amount: $scope.loan.payOffAmount
                              },
                              row2: {
                                  label: 'Last payment',
                                  tooltipText: 'This is your last posted payment. Scheduled payments are not included.',
                                  tooltip: false
                              },
                              row3: {
                                  label: 'Payment due',
                                  boldLabel: false,
                                  paymentDate: $filter('formatDateWithSuffix')($scope.loan.due.date.next),
                                  tooltipText: 'Payment after 8 p.m. EST will be made the next business day.',
                                  tooltip: false,
                                  message: ''
                              }
                          };

                          if (daysBeforeDueDate > 0 && daysBeforeDueDate <= 10 && $scope.loan.due.amount.total_unformatted > 0 && $scope.loan.status !== 'IN BANKRUPTCY' && $scope.loan.status !== 'CHARGED OFF' && $scope.loan.status !== 'CLOSED') {
                              var latePayNotifications = {
                                  before10days: {
                                      message: 'Reminder',
                                      subtext: 'Your payment of ' + $scope.loan.monthlyPaymentAmount+ ' is due on ' + $scope.loan.due.date.next
                                  }
                              };
                              $scope.dueWarningText  = daysBeforeDueDate;
                              $scope.showDueWarningText = true;
                              loanWidgetHelpers.renderNotification('notification-reminder', latePayNotifications.before10days.message, latePayNotifications.before10days.subtext, true, true);
                          }

                          if ($scope.loan.payment.history && $scope.loan.payment.last.amount !== '$0') {
                              $scope.rightPane.row2.message = 'POSTED ' + $scope.loan.payment.last.mode + ' from ' + $scope.loan.payment.last.account + ' on ' + $scope.loan.payment.last.date + '&nbsp;';
                          }

                          $scope.latePayment();
                      }
                    }// ends initLoan;

                    $scope.handlePayment = function (autoACHMode) {
                        $scope.paymentRequestInProgress = true;
                        var spectrumDateFormat = 'YYYY-MM-DD';
                        var params = {
                            loan_id: $scope.loan.number.slice(1),
                            additional_amount: parseFloat($scope.makePaymentScheduledAmount),
                            payment_post_date: moment($scope.makePaymentScheduledDate, 'MM/DD/YY').format(spectrumDateFormat)
                        };

                        for (var index = 0, len = loansModel.spectrumBankAccounts.length; index < len; index++) {
                            if (loansModel.spectrumBankAccounts[index]['account_id'] === $scope.makePaymentScheduledAccount.wholeBankInfo.account_id) {
                                params.routing_number = loansModel.spectrumBankAccounts[index]['routing_number'];
                                params.account_number = loansModel.spectrumBankAccounts[index]['account_number'];
                            }
                        }

                        loansService.postPayment(params).then(function (postPaymentResponse) {
                          $scope.paymentRequestInProgress = false;
                          // do not allow proxy users to make payments on a customer's behalf
                          if(postPaymentResponse.error === 'E-118') {
                            $window.location = '/borrower/#/error/E-118';
                          } else {
                            $scope.makePayment.footerAttention = false;
                            $scope.makePayment.footerIcon = $scope.railsVariables.clockIcon;
                            var paymentNotifications = {};
                            var makePaymentModel = {
                                amount: $filter('formatCurrency')($scope.makePaymentScheduledAmount),
                                account: $filter('formatBankAccountName')($scope.makePaymentScheduledAccount.wholeBankInfo.account_id).slice(-7),
                                date: $filter('formatDate1')($scope.makePaymentScheduledDate)
                            };

                            if($scope.loan.autopay.status === 'ON'){
                                paymentNotifications = {
                                    success : {
                                        footer: 'Additional payment of ' + makePaymentModel.amount  + ' is scheduled for ' + makePaymentModel.date + '   from ' + makePaymentModel.account + '. ',
                                        message: getScheduledPaymentSuccessMessage($scope.makePaymentScheduledAmount, $scope.makePaymentScheduledDate)
                                    }

                                };
                            }
                            else{
                                paymentNotifications = {
                                    success : {
                                        footer: 'A payment of ' + makePaymentModel.amount + ' is scheduled for ' + makePaymentModel.date + '   from ' + makePaymentModel.account  + '. ',
                                        message: getScheduledPaymentSuccessMessage($scope.makePaymentScheduledAmount, $scope.makePaymentScheduledDate)
                                    }
                                };
                            }

                            paymentNotifications.failure = {
                                    message: 'We were unable to process your payment.',
                                    footer: 'Your payment of ' + makePaymentModel.amount + ' for ' + makePaymentModel.date + ' from ' + makePaymentModel.account + ' has failed.',
                                    subtext: 'Your payment of ' + makePaymentModel.amount + ' for ' + makePaymentModel.date + ' from ' + makePaymentModel.account + ' has failed. Please try again or <a class=\'white onHoldSupportLink contactUsLink\' href=\'/help/support.aspx\'>contact us.</a>'
                            };

                            if (postPaymentResponse.status && postPaymentResponse.message === 'success') {
                                loanWidgetHelpers.renderNotification('notification-success', paymentNotifications.success.message, '', true, true, true);
                                $scope.makePayment.message = paymentNotifications.success.footer;
                                $scope.showPaymentConfirmation = false;
                                $scope.showSuccessPaymentConfirmation= true;
                                $scope.addConfirmClass=true;
                                $scope.addFailClass=false;
                                $scope.showPaymentBar = false;

                                if(autoACHMode === 'auto'){
                                    $scope.showPaymentBar = false;

                                }
                                else {
                                    $scope.thinPaymentBtn = true;
                                    $scope.showPaymentBar = true;
                                }
                            }
                            else{
                                    loanWidgetHelpers.renderNotification('notification-failure', paymentNotifications.failure.message, paymentNotifications.failure.subtext, true, true, true);
                                    $scope.makePayment.message = paymentNotifications.failure.footer;
                                    $scope.makePayment.footerIcon = $scope.railsVariables.exclamationIconRed;
                                    $scope.showFailedPaymentConfirmation =true;
                                    $scope.showPaymentConfirmation = false;
                                    $scope.addFailClass=true;
                                    $scope.addConfirmClass=false;
                                    $scope.makePayment.footerAttention = true;
                                if(autoACHMode !== 'auto'){
                                    $scope.thinPaymentBtn = true;

                                }

                            }
                          }
                        }).catch(function(error) {
                          $scope.paymentRequestInProgress = false;
                        });
                    };

                    $scope.showPaymentFields = function(AutoACH){
                        $scope.makePaymentScheduledAmount = 0;
                        $scope.thinPaymentBtn = false;
                        $scope.showPaymentBar = true;
                    };
                    $scope.backToLoan = function(){
                        $scope.showSuccessPaymentConfirmation = false;
                        $scope.showFailedPaymentConfirmation =false;
                        $scope.showPaymentBar=false;
                        $scope.showLoanMainContent = true;
                        $scope.makePaymentScheduledAmount=0;
                        if (loansModel.businessHelpers.isCurrentTimeAfterCutOff()) {
                            $scope.makePaymentScheduledDate = moment().add(1, 'day').format("MM/DD/YY");
                            $scope.startDate = moment().add(1, 'day')._d;
                            $scope.placeholderText = $scope.makePaymentScheduledDate;
                            $scope.validatedDate = $scope.startDate;
                        }
                        else {
                            $scope.makePaymentScheduledDate = moment().format("MM/DD/YY");
                            $scope.startDate = moment()._d;
                            $scope.placeholderText = $scope.makePaymentScheduledDate ;
                            $scope.validatedDate = $scope.startDate;
                        }
                    };


                    $scope.turnOnAutoPayIfAutoPayEnabled = function() {
                      if(!$scope.autoPayDisabled) {
                        $scope.turnOnAutoPay();
                      }
                    };

                    $scope.turnOnAutoPay = function () {
                        $scope.isAutoPayFeasibleForNextDue = false;

                        var daysBeforeDueDate = loansModel.businessHelpers.noOfDaysBefore($scope.loan.due.date.next);
                        if ((daysBeforeDueDate === 10 && !loansModel.businessHelpers.isCurrentTimeAfterCutOff()) || daysBeforeDueDate > 10) {
                            $scope.autoPayConfirmationText = 'AutoPay will be scheduled for ' + $filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) + '. ' + 'After that, payments will occur on the ' + $filter('formatDateWithOnlySuffix')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) + ' of each month.';
                            $scope.autoPayFooterText = "You\'re all set. Your automatic payment is scheduled for " + $scope.loan.due.date.next;
                            $scope.isAutoPayFeasibleForNextDue = true;
                        }
                        else{
                          // We should not show the "Please manually make" msg when turning on autoPay in the first bill cycle
                            if ($scope.loan.is_first_bill) {
                              $scope.autoPayConfirmationText = 'AutoPay will be scheduled for ' + $filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY').add(1, 'months')) + '. ' + 'After that, payments will occur on the ' + $filter('formatDateWithOnlySuffix')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) + ' of each month.<br/>';
                            } else {
                              $scope.autoPayConfirmationText = 'AutoPay will be scheduled for ' + $filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY').add(1, 'months')) + '. ' + 'After that, payments will occur on the ' + $filter('formatDateWithOnlySuffix')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) + ' of each month.<br/>' + '<span class="bold">Please manually make the current monthly payment of ' +$scope.loan.due.amount.monthly+' by '+$filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) +'.</span>';
                            }
                            $scope.autoPayFooterText =  'AutoPay is scheduled for ' + $filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY').add(1, 'months')) + '.<br/>'  + '<span class="warning">Please manually make the current monthly payment of ' +$scope.loan.due.amount.monthly+' by '+$filter('formatDate1')(moment($scope.loan.due.date.next, 'MMM. DD, YYYY')) +'.</span>';
                        }
                        $scope.showLoanMainContent = false;
                        $scope.showPaymentConfirmation = false;
                        $scope.showAutoACH = true;
                        $scope.showLoanDetails = false;

                    };

                    var payDateOptions = {
                        today: new Date,
                        dueDate: $scope.loan.due.date.next
                    };
                    $scope.remainingBalance = false;
                    $scope.paymentDue = false;
                    $scope.showLoanDetails = false;
                    $scope.showPaymentConfirmation = false;
                    $scope.showLoanMainContent = true;

                    $scope.payDateOptions = paymentsService.getPayDateOptions(payDateOptions);

                    var maxDate = new Date(parseInt(moment(payDateOptions.dueDate, 'MMM. DD, YYYY').format("YYYY")), parseInt(moment(payDateOptions.dueDate, 'MMM. DD, YYYY').format("M")) - 1, parseInt(moment(payDateOptions.dueDate, 'MMM. DD, YYYY').format("D")));
                    if(moment(maxDate).diff($scope.startDate, 'days') < 0){
                        if(loansModel.businessHelpers.isCurrentTimeAfterCutOff()){
                            maxDate = moment().add(1, 'day')._d;
                        }
                        else{
                            maxDate = moment()._d;

                        }

                    }

                    $scope.endDate = maxDate;
                    $scope.current = 43;
                    $scope.max = 100;
                    $scope.offset = 0;
                    $scope.timerCurrent = 0;
                    $scope.uploadCurrent = 0;
                    $scope.stroke = 45;
                    $scope.radius = 100;
                    $scope.isSemi = true;
                    $scope.rounded = false;
                    $scope.responsive = true;
                    $scope.clockwise = true;
                    $scope.currentColor = '#2DC2BF';
                    $scope.bgColor = '#eaeaea';
                    $scope.duration = 1000;
                    $scope.currentAnimation = 'linearEase';
                    $scope.railsVariables = $rootScope.railsVariables;
                    $scope.getStyle = function () {
                        var transform = ($scope.isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';

                        return {
                            'top': $scope.isSemi ? 'auto' : '50%',
                            'bottom': $scope.isSemi ? '0' : 'auto',
                            'left': '51%',
                            'transform': transform,
                            '-moz-transform': transform,
                            '-webkit-transform': transform,
                            'font-size': '0.25rem'
                        };
                    };

                    $scope.getColor = function () {
                        return $scope.gradient ? 'url(#gradient)' : $scope.currentColor;
                    };


                $scope.isAdditionalPaymentsMsgShown = function(loan) {
                  var isFirstBill = loan.is_first_bill;
                  var monthlyAmountDue = loan.due.amount.total_unformatted;
                  var manualPaymentAmount = $scope.makePaymentScheduledAmount;
                  var isAutoPayOn;
                  loan.autopay.status === 'ON' ? isAutoPayOn = true : isAutoPayOn = false;

                  if (!isAutoPayOn && isFirstBill) {
                    return true;
                  } else if (!isAutoPayOn && !isFirstBill && manualPaymentAmount > monthlyAmountDue) {
                    return true;
                  } else {
                    return false;
                  }
                };

                $scope.initLoan();
            }],
            templateUrl: 'account/components/payments/templates/payment_widget_tmpl.html',
            link: function (scope, element, attributes) {

                scope.$watch("makePaymentScheduledDate", function (attr) {
                    var effective_date = moment(scope.makePaymentScheduledDate, 'MM/DD/YY').format("YYYY-MM-DD");
                    if(typeof scope.makePaymentScheduledDate !== 'undefined'){
                        loansService.getPayOffAmount({effective_date: effective_date, loan_id: scope.loan.number.slice(1)}).then(function(payOffResponse){
                            if(payOffResponse.status){
                              scope.loan.payOffAmount_unformatted = payOffResponse.pay_off_amount;
                                scope.payoffAmount = 'Payoff amount is ' +   $filter('formatCurrency')(payOffResponse.pay_off_amount) + ' for the selected date.';
                            }
                        });
                    }

                });

                renderToolTip = function (element, toolTipElement, params) {

                    var defaults = {
                        style: {
                            classes: 'myaccount qtip-rounded qtip-dark tooltip-gray',
                            width: '25rem'
                        },
                        position: {
                            my: 'top center', at: 'bottom center',
                            adjust: {
                                y: 5
                            }
                        }
                    };
                    _.extend (defaults, params); // copy user supplied params over to defaults
                    $(element).find(toolTipElement).qtip(defaults);

                };

                $timeout(function () {
                    renderToolTip (element, '.loan-info-help-icon-tooltip');
                    renderToolTip (element, '.auto-pay-unavailable-tooltip', {
                        content: {
                            text: scope.autoPayUnavailableText
                        }
                    });
                    renderToolTip (element, '.auto-pay-tooltip', {
                        content: {
                            text: scope.autoPayTooltiptext
                        }
                    });
                });

                $(document).on('click', '.goToScheduledPayments', function(event){
                    event.stopPropagation();
                    $('.show-payment').trigger('click');

                });

                $(".picker__footer button").select(function (e) {
                    e.stopPropagation();
                    return false;
                });

                $(element).find('.progress-wrapper').on("click", function () {
                    var currentlyPaidOff = $(element).find('.progress-wrapper').scope().loan.paidOffPercentage;
                    $(element).find('.progress-wrapper').scope().loan.paidOffPercentage = 0;
                    $(element).find('.progress-wrapper').scope().$apply();
                    $(element).find('.progress-wrapper').scope().loan.paidOffPercentage = currentlyPaidOff;
                    $(element).find('.progress-wrapper').scope().$apply();
                });
            }
        }
    }]);
