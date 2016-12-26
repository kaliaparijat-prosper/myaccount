angular.module("accountDashboardServices", ['accountDashboardNetworkServices'])
.service("accountDashboardHelpers",
    ["networkHelper","userModel", "ld", "$q", "$location", "$window",
        function(networkHelper, userModel, ld, $q, $location, $window) {
            var accountDashboardHelpers = {
                assignUserModelData: function(userServiceObject) {
                    userModel.user = userServiceObject.user = userServiceObject.user_data.user;
                    return userModel.user;
                },
                redirectUserByRole: function(currentUser){
                    var userRole = currentUser.roles;
                    var isInstitutionalLender = userRole.search('Institutional Lender') !== -1;
                    var isLender = userRole.search('Lender') !== -1;
                    var isBorrower = userRole.search('Borrower') !== -1;
                    var workFlowType = ld.has($location.search(), 'type') ? $location.search().type : 'core';
                    if(!isBorrower){
                        $window.location = '/account/overview';
                        return;
                    }
                    else{
                        if (isLender) {
                            $window.location = '/account/overview';
                            return;
                        }
                        else if (isInstitutionalLender) {
                            $window.location = '/account/overview';
                            return;
                        }
                        else if(currentUser.merchants_info && (currentUser.merchants_info.length > 0) && currentUser.merchants_info[0].valid_offer){
                            $window.location = '/borrower/apply/funnel/registration?type=phl&provider_id='+currentUser.merchants_info[0].third_party_id;
                            return;
                        }
                        else{
                            return;
                        }
                    }

                },
                loadMomentTimeZoneData: function(){
                    moment.tz.load({
                        zones : [
                            'America/Los_Angeles|PST PDT|80 70|0101|1Lzm0 1zb0 Op0'
                        ],
                        links : [
                            'America/Los_Angeles|US/Pacific'
                        ],
                        version : '2014e'
                    });
                }
            };
            return accountDashboardHelpers;
        }
    ]
);
