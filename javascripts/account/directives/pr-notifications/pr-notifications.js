angular.module("accountDashboardDirectives")
    .directive('prNotification', ['$window', '$timeout', function($window, $timeout){
        return {
            templateUrl: 'account/directives/pr-notifications/notifications_directive_tmpl.html',
            scope: {
                type: '=type',
                heading: '=heading',
                subtext: '=subtext',
                close: '=close',
                scroll: '=scroll'
            },
            restrict: "E",
            controller: ['$scope', 'userAccountServices', 'userModel', 'accountEventTrackerService',function ($scope, userAccountServices, userModel,accountEventTrackerService) {
                NotificationsVM = this;
                $scope.accountEventTrackerService = accountEventTrackerService;
            }],
            link: function(scope, element, attrs) {
                var position = element.position();
                var offsetHeight = element.children().prop('offsetHeight'); // element is the angular directive whereas children is the DOM element

                if (scope.scroll) {

                    $timeout(function(){
                     $('html,body').animate({
                       scrollTop: position.top - offsetHeight
                  });
                }, 500);
              }
            },
            controllerAs: 'NotificationsVM'
        };
    }]);