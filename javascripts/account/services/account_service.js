angular.module("accountDashboardServices")
    .service("userAccountServices",
        ["networkHelper","userModel", "ld", "$q", "$location", "$window", '$rootScope', 'listingsService',
            function(networkHelper, userModel, ld, $q, $location, $window, $rootScope, listingsService) {
                var userAccountServices = {
                    determineBankInfoAvailability: function() {
                        return (userModel.user.bank_account_info.account_id === '') ? true : false;
                    },
                    checkEmail: function(params){
                        var httpOptions = {};
                        var userEmailEndPoint = "api/v1/email";
                        angular.extend(httpOptions, {httpMethod: "GET"});
                        return networkHelper.postNetworkRequest(userEmailEndPoint, params, httpOptions);
                    },
                    checkEmailVerfication: function(){
                        var params = {'email' : userModel.user.contact_info.email };
                        var promise = this.checkEmail(params);
                        var deferredObject = $q.defer();

                        promise.then(function (checkEmailResponse) {
                            var emailVerified = false;
                            if (checkEmailResponse['email_exists'] === true && checkEmailResponse['activation_key'] === '') {
                                emailVerified = true
                            }
                            deferredObject.resolve(emailVerified);
                        });
                        return deferredObject.promise;
                    },
                    checkBankAccountInfo: function(){
                        var deferredObject = $q.defer();
                        var isAnyPendingActivationListingAvailable = false;

                        listingsService.cachedListings.result.forEach(function(listingItem, listingItemNum, listingsArray) {
                          if(listingItem.status === 'PENDING_ACTIVATION' && !('bank_account_info' in userModel.user)){
                            isAnyPendingActivationListingAvailable = true;
                          }
                          deferredObject.resolve(isAnyPendingActivationListingAvailable);
                        });

                        return deferredObject.promise;
                    },
                  bankValidationStatus: function(params){
                    var httpOptions = {};
                    var bankStatusEndPoint = "api/v1/bank/bank_validation_status";
                    var routeScope = "/borrower/"
                    angular.extend(httpOptions, {httpMethod: "GET"});
                    return networkHelper.postNetworkRequest(bankStatusEndPoint, params, httpOptions, routeScope);
                  }
                };
                return userAccountServices;
            }
        ]
    );

function filterActiveBankAccountsOnly(bankAccount){
    if(bankAccount.bank_account_status === 2){
        return true;
    }
    else{
        return false;
    }
}
