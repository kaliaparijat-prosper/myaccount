angular.module("accountDashboardModels")
    .service("listingsModel",
        ['ld', '$q', '$timeout', 'jq', "$filter",
            function(ld, $q, $timeout, jq, $filter) {

                var listingsObject = {
                    data: {}
                }
                return listingsObject;

            }]);