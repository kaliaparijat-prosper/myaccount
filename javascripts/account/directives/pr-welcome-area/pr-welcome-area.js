angular.module("accountDashboardDirectives")
    .directive('prWelcomeArea', ['userService', function(userService){
        return {
            templateUrl: 'account/directives/pr-welcome-area/welcome_area_directive_tmpl.html',
            scope: true,
            restrict: "E",
            controller: ['$scope', 'userModel','messagesService', '$window', function ($scope, userModel, messagesService, $window) {
                WelcomeVM = this;
                WelcomeVM.first_name = userModel.user.personal_info.first_name;
                WelcomeVM.unreadMessages = 0;

                WelcomeVM.greeting = "Welcome, " + userModel.user.personal_info.first_name + ".";

                var middleInital = '';
                if(userModel.user.personal_info.middle_initial !== ''){
                    middleInital = userModel.user.personal_info.middle_initial + '. ';
                }

                var unreadMessages = 0;

                messagesService.getMessages().then(function(messagesResponse){
                    messagesResponse.result.forEach(function(messageObject,index){
                        if(!messageObject.user_read && messageObject.show_onsite){
                            unreadMessages++;
                        }
                    });
                    if (unreadMessages === 1) {
                        WelcomeVM.unreadMessagesText = "1 new message.";
                    }
                    else {
                        WelcomeVM.unreadMessagesText = unreadMessages + " new messages.";
                    }
                    WelcomeVM.unreadMessages = unreadMessages;

                    if(WelcomeVM.unreadMessages === 0){
                        $('.welcomeMessagesWrapper').css("margin-left", "0px");
                        $('.welcome-note').css("margin-bottom", "0px");
                    }

                });
            }],
            link: function(scope, element, attrs){


            },
            controllerAs: 'WelcomeVM'
        };
    }]);