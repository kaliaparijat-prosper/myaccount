angular.module("accountDashboardModels",["accountDashboardDataFormatters"])
    .service("loansModel",
        ['ld', '$q', '$timeout', 'jq', "$filter", "userModel",
            function(ld, $q, $timeout, jq, $filter, userModel) {
                var loansDataObject = {
                    mapServerWithClientData: function(serverData, spectrumBankAccounts){
                        var clientData =  {
                            amountBorrowed: $filter('formatCurrency')(serverData.amount_borrowed),
                            amountBorrowedWithNoDecimal: $filter('formatCurrencyWithZeroDecimal')(serverData.amount_borrowed),
                            purpose: (serverData.loan_description)? (serverData.loan_description.toLowerCase() + " loan") : "loan",
                            number: "#" + serverData.loan_number,
                            is_first_bill: serverData.is_first_bill,
                            status: serverData.loan_status.toUpperCase(),
                            paidOffPercentage: Math.round(serverData.paided_percentage),
                            balanceAmount: $filter('formatCurrency')(serverData.current_principal_balance),
                            balanceAmount_unformatted: serverData.current_principal_balance,
                            rate: serverData.borrower_rate.toFixed(2) + "%",
                            isPriorLoan: serverData.is_prior_loan,
                            due: {
                                date: {
                                    monthly_unformatted: serverData.monthly_due_date ? moment().date(serverData.monthly_due_date).format('MM/DD/YYYY') : ($filter('formatDate1')(serverData.next_payment_due_date)) ? $filter('formatDate1')(serverData.next_payment_due_date) : 'N/A',
                                    monthly: serverData.monthly_due_date ? $filter('formatDateWithSuffix')(moment().date(serverData.monthly_due_date).format('MM/DD/YYYY')) : ($filter('formatDate1')(serverData.next_payment_due_date)) ? $filter('formatDate1')(serverData.next_payment_due_date) : 'N/A',
                                    next: $filter('formatDate1')(serverData.next_payment_due_date),
                                    original: serverData.monthly_due_date,
                                    past: serverData.past_due_date ? serverData.past_due_date : null
                                },
                                amount: {
                                    monthly_unformatted: serverData.monthly_amount_due ? serverData.monthly_amount_due : "0.00",
                                    monthly: $filter('formatCurrency')(serverData.monthly_amount_due) ? $filter('formatCurrency')(serverData.monthly_amount_due) : "0.00",
                                    past: $filter('formatCurrency')(serverData.past_due_amount) ? $filter('formatCurrency')(serverData.past_due_amount) : null,
                                    total: $filter('formatCurrency')(serverData.total_payment_due) ? $filter('formatCurrency')(serverData.total_payment_due) : null,
                                    total_unformatted: serverData.total_payment_due ? serverData.total_payment_due : 0.00
                                }
                            },
                            payment: {
                                last:  {
                                    account: (serverData.payment_history) ? $filter('formatBankAccountNumber')(serverData.last_payment_account) : null,
                                    amount: (serverData.payment_history) ? $filter('formatCurrency')(serverData.last_payment_amount) : null,
                                    date: (serverData.payment_history) ? $filter('formatDate1')(serverData.last_payment_date) : null,
                                    mode: (serverData.payment_history) ? $filter('formatPaymentMode')(serverData.last_payment_mode) : null
                                },
                                history: serverData.payment_history
                            },
                            lateFeeAmount: serverData.late_fee_amount,
                            nsfFees: serverData.nsf_fee,
                            autopay: {
                                status: (serverData.auto_ach === true) ? 'ON' : 'OFF',
                                bankName: serverData.auto_pay_bank_name,
                                account: (serverData.auto_pay_account) ? $filter('formatBankAccountNumber')(serverData.auto_pay_account.slice(-4)) : null,
                                pendingActivation: serverData.auto_ach_req_inprogress,
                                activationDate: (serverData.auto_ach_effective_date) ? serverData.auto_ach_effective_date : null,
                                requestedDate: 'NA',
                                requestedDateTime: 'NA',
                                requestStatus: serverData.auto_ach_req_status
                            },
                            closed: {
                                in_scra: serverData.in_scra,
                                in_bankruptcy: serverData.in_bankruptcy,
                                fraud_indicator: serverData.fraud_indicator,
                                in_debt_sale: serverData.in_debt_sale,
                                charge_off_status: serverData.charge_off_status
                            },
                            daysPastDue: serverData.days_past_due,
                            isPaidOff: serverData.is_paid_off,
                            originatedDate: $filter('formatDate1')(serverData.origination_date),
                            originatedDate_unformatted: moment(serverData.origination_date, "YYYY-MM-DD")._d,
                            termInMonths: serverData.term + " months",
                            maturityDate: $filter('formatDate1')(serverData.maturity_date),
                            payOffAmount: $filter('formatCurrency')(serverData.payoff_amount),
                            hasNextScheduledPayment: serverData.has_next_scheduled_payments,
                            totalMissedPayment: serverData.total_missed_payments
                        };

                        // next_scheduled_payment_amount/date are conditional fields, so populate them only if they are available and hasNextScheduledPayment is true
                        if (clientData.hasNextScheduledPayment === true && !_.isNaN(serverData.next_schedule_payment_amount) && !_.isEmpty(serverData.next_schedule_payment_date)) {
                            clientData.next = {
                                schedulePaymentAmount: serverData.next_schedule_payment_amount,
                                schedulePaymentDate: serverData.next_schedule_payment_date
                            };
                        }

                        clientData.bankAccounts = [];
                        if(typeof serverData.auto_ach_req_date !== 'undefined' && serverData.auto_ach_req_date !== ''){
                            clientData.autopay.requestedDate = serverData.auto_ach_req_date.replace(/\s/g, '').slice(0,10);
                            clientData.autopay.requestedDateTime = moment(clientData.autopay.requestedDate.slice(0,18), "YYYY-MM-DDHH-MM-SS");
                        }

                        this.spectrumBankAccounts = spectrumBankAccounts.result;
                        function anyPrimaryAccountAvailableFunction(account){
                            if(account['is_primary']) {
                                return true;
                            }
                            else{
                                return false;
                            }
                        }
                        var anyPrimaryAccountAvailable = spectrumBankAccounts.result.filter(anyPrimaryAccountAvailableFunction);


                        var bank_accounts_list = this.spectrumBankAccounts;
                        for (var index = 0, len = bank_accounts_list.length; index < len; index++) {
                            clientData.bankAccounts.push({
                                bankAccountNameString :  bank_accounts_list[index]['bank_name'] + " ***" + bank_accounts_list[index]['account_number'].replace(/\*/g, ''),
                                isPrimary : bank_accounts_list[index]['is_primary'],
                                wholeBankInfo: bank_accounts_list[index]
                            });
                            if(anyPrimaryAccountAvailable.length > 0 && bank_accounts_list[index]['is_primary']){
                                clientData.selectedBankAccount = {wholeBankInfo : { account_id: clientData.bankAccounts[index]['wholeBankInfo']['account_id']}};
                            }
                            else{
                                clientData.selectedBankAccount = {wholeBankInfo : { account_id: clientData.bankAccounts[index]['wholeBankInfo']['account_id']}};
                            }
                        }


                        // BOR-9902 assign placeholder value for account_id if no bank account was assigned
                        if (_.isUndefined(clientData.selectedBankAccount)) {
                          clientData.selectedBankAccount = {wholeBankInfo : { account_id: 'closed bank account' }};
                        }

                        if(!isNaN(Number(clientData.payOffAmount.replace(/[^0-9\.]+/g,"")))){
                            clientData.payOffAmount_unformatted = Number(clientData.payOffAmount.replace(/[^0-9\.]+/g,""))
                        }
                        return clientData;
                    },

                    businessHelpers: {
                        isCurrentTimeAfterCutOff: function(){
                            return moment().tz('America/Los_Angeles').isAfter(moment({hour: 17, minute: 30, seconds: 00}));
                        },
                        isThisTimeAfterCutOff: function(time){
                            return moment(time, 'YYYY-MM-DDHH-MM-SS').tz('America/Los_Angeles').isAfter(moment(time, 'YYYY-MM-DDHH-MM-SS').hours(18).minutes(30).seconds(0));
                        },
                        noOfDaysBefore: function(specificDate){
                            var startDate = moment(new Date()); //todays date
                            var endDate = moment(specificDate, "MMM. DD, YYYY"); // another date
                            var duration = moment.duration(endDate.diff(startDate));
                            var durationInDays = Math.abs(Math.ceil(duration.asDays()));
                            return durationInDays;
                        }
                    },

                    paymentPolicyData: {},

                    spectrumBankAccounts: {},

                    data: []
                };
                return loansDataObject;
            }
        ]);
