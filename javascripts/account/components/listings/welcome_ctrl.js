angular.module('account.listings')
  .controller('WelcomeCtrl', ['$scope', '$modalInstance', 'EventDispatchingSvc', function ($scope, $modalInstance, EventDispatchingSvc) {
    var welcomeVM = this;

    angular.extend(welcomeVM, new EventDispatchingSvc($scope));

    welcomeVM.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.welcomeVM = welcomeVM;

  }]);
