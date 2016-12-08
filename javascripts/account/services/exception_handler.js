angular.module("accountExceptionHandler", [
    "ui.router",
    "psp.services.eventDispatcher",
    "utils.vendor"
])
    .controller("exceptionCtrl",['$scope', '$state', 'variantName', '$location', function($scope, $state, variantName, $location) {

    }])
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider,$urlRouterProvider) {
        $stateProvider
            .state('forbidden', {
                url: "/signin" //NOT WORKING
            })

    }])
    .run(['$rootScope','EventDispatchingSvc', '$state', '$window' , 'userModel', 'userService', function($rootScope, EventDispatchingSvc, $state, $window, userModel, userService){
        var initialize_errors  = this;
        angular.extend(initialize_errors, new EventDispatchingSvc($rootScope));

        initialize_errors.listen("event:exception", function(event, eventCode){
            switch(eventCode.toString()){
                case "E-100":
                    $window.location = '/signin';
                    break;
            }
        })
    }]);

