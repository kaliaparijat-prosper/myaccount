angular.module("accountDashboardNetworkServices", [])
    .value("userCookie","prosper-federation")
    .service("listingsService",
        ["networkHelper",
            function(networkHelper) {
                var listingsObj = {
                    cachedListings: null,
                    httpOptions: {},
                    getListings: function(params) {
                        var select_offer_url = "api/v1/listings/";
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        return networkHelper.postNetworkRequest(select_offer_url, params, this.httpOptions);
                    },
                    withdrawListing: function(params) { //listing_id
                        var withdraw_listing_url = "api/v1/listings/";
                        angular.extend(this.httpOptions, {httpMethod: "DELETE"});
                        return networkHelper.postNetworkRequest(withdraw_listing_url, params, this.httpOptions);
                    },
                    listingStatus: function(params) { //listing_id
                        var listing_status_url = "api/v1/listing/status";
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        return networkHelper.postNetworkRequest(listing_status_url, params, this.httpOptions);
                    }
                };
                return listingsObj;
            }
        ]
    )
    .service("resendEmailService",
        ["networkHelper",
            function(networkHelper) {
                var resendEmailObj = {
                    httpOptions: {},
                    resendEmail: function(params) { //email
                        var resend_email_url = "api/v1/user/resend_verification_email";
                        angular.extend(this.httpOptions, {httpMethod: "POST"});
                        return networkHelper.postNetworkRequest(resend_email_url, params, this.httpOptions);
                    }
                };
                return resendEmailObj;
            }
        ]
    )
    .service("offersService",
        ["networkHelper",
            function(networkHelper) {
                var selected_offers_url = "api/v1/offers/selected";

                var selectedOffersObj = {
                    httpOptions: {},
                    selectedOffers: function(params) {
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        return networkHelper.postNetworkRequest(selected_offers_url, params, this.httpOptions, '/borrower/');
                    }
                };
                return selectedOffersObj;
            }
        ]
    )
    .service("messagesService",
        ["networkHelper",
            function(networkHelper) {
                var messagesObj = {
                    httpOptions: {},
                    getMessages: function(params) { //messages
                        var messages_url = "api/v1/user/emails";
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        return networkHelper.postNetworkRequest(messages_url, params, this.httpOptions);
                    }
                };
                return messagesObj;
            }
        ]
    )
    .service("userService",
        ["networkHelper",
            function(networkHelper, userCookie) {
                var get_user_url = "api/v1/user/get_user";
                var post_payment_policy_update = "api/v1/user/update_payment_policy";
                var get_payment_policy = "api/v1/user/check_payment_policy";
                var post_payment_policy = "api/v1/user/update_payment_policy";
                var spectrumBankAccountsList = "api/v1/user/bank_accounts";
                var getUserRequestURL = 'api/v1/user/is_user_signed_in';
                var previousSuccessfulLogin = "api/v1/users/loginhistory/previoussuccessfullogin";


                var userServiceObj = {
                    httpOptions: {},
                    getCurrentUser: function(params) {
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        var promise = networkHelper.postNetworkRequest(getUserRequestURL, params, this.httpOptions, '/borrower/');
                        return promise;
                    },
                    updatePaymentPolicy: function(params){
                        angular.extend(this.httpOptions, {httpMethod: "POST"});
                        var promise = networkHelper.postNetworkRequest(post_payment_policy_update, params, this.httpOptions);
                        return promise;
                    },
                    getPaymentPolicy: function(params){
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        var promise = networkHelper.postNetworkRequest(get_payment_policy, params, this.httpOptions);
                        return promise;
                    },
                    postPaymentPolicy: function(params){
                        angular.extend(this.httpOptions, {httpMethod: "DELETE"});
                        var promise = networkHelper.postNetworkRequest(post_payment_policy, params, this.httpOptions);
                        return promise;
                    },
                    getSpectrumBankAccountList: function(params){
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        var promise = networkHelper.postNetworkRequest(spectrumBankAccountsList, params, this.httpOptions, '/borrower/');
                        return promise;
                    },
                    getPreviousSuccessfulLogin: function(){
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        var promise = networkHelper.postNetworkRequest(previousSuccessfulLogin, {}, this.httpOptions);
                        return promise;

                    }


                };
                return userServiceObj;
            }
        ]
    )
    .service("loansService",
        ["networkHelper",
            function(networkHelper, userCookie) {
                var getUserLoans = "api/v1/loans/userloans";
                var getPayoffamount = "api/v1/loans/payoffamount";
                var postPayment = "api/v1/payment";
                var postAutoACHOn = "api/v1/autoach";
                var getSecondLoanEligiblity = "api/v1/loans/secondloan";
                //var getPaymentHistory = "api/v1/loans/id/paymenthistory";


                var userLoansObj = {
                    httpOptions: {},
                    getUserLoans: function(params) {
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        var promise = networkHelper.postNetworkRequest(getUserLoans, params, this.httpOptions);
                        return promise;
                    },
                    getPayOffAmount: function(params) {
                        angular.extend(this.httpOptions, {httpMethod: "GET", ignoreLoadingBar: true});
                        var promise = networkHelper.postNetworkRequest(getPayoffamount, params, this.httpOptions);
                        return promise;
                    },
                    postPayment: function(params) {
                        angular.extend(this.httpOptions, {httpMethod: "POST"});
                        var promise = networkHelper.postNetworkRequest(postPayment, params, this.httpOptions);
                        return promise;
                    },
                    postAutoACHOn: function(params) {
                        angular.extend(this.httpOptions, {httpMethod: "POST"});
                        var promise = networkHelper.postNetworkRequest(postAutoACHOn, params, this.httpOptions);
                        return promise;
                    },
                    getSecondLoanEligiblity: function(params) {
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        var promise = networkHelper.postNetworkRequest(getSecondLoanEligiblity, params, this.httpOptions);
                        return promise;
                    },
                    getPaymentHistory: function(loanId){
                        var getPaymentHistory = "api/v1/loans/" + loanId + "/paymenthistory";
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        var promise = networkHelper.postNetworkRequest(getPaymentHistory, {}, this.httpOptions);
                        return promise;

                    },
                    getScheduledPayment: function(loanId){
                        var getScheduledPayment = "api/v1/loans/" + loanId + "/payment";
                        angular.extend(this.httpOptions, {httpMethod: "GET"});
                        var promise = networkHelper.postNetworkRequest(getScheduledPayment, {}, this.httpOptions);
                        return promise;

                    },
                    cancelScheduledPayment: function(loanId,paymentId){
                        var cancelPayment = "api/v1/loans/" + loanId + "/payment?payment_id=" + paymentId;
                        angular.extend(this.httpOptions, {httpMethod: "DELETE"});
                        var promise = networkHelper.postNetworkRequest(cancelPayment, {}, this.httpOptions);
                        return promise;

                    }
                };
                return userLoansObj;
            }
        ]
    );
