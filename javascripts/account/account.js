angular.module("accountApp", [
    'ui.router',
    'templates',
    'ngSanitize',
    'ngAnimate',
    'ngFileUpload',
    'psp.common.header',
    'psp.directive.footer',
    'psp.common.error_codes',
    'psp.services.eventDispatcher',
    'accountDashboardDirectives',
    'accountDashboardServices',
    'accountDashboardNetworkServices',
    'accountDashboardDataFormatters',
    'account.payments',
    'account.listings',
    'account.documentUpload',
    'angular-svg-round-progress',
    'accountDashboardModels',
    'network-helper',
    'accountExceptionHandler',
    'accountErrorCodes',
    'accountConstants',
    'angular-loading-bar',
    'mm.foundation.accordion',
    'prosper.featureFlags',
    'borrower.analytics',
    'accountAnalyticsService',
    'mm.foundation.modal',
    'borrower.modal',
    'psp.filters.collections'
])
  .config([
    "$stateProvider",
    "$urlRouterProvider",
    "$locationProvider",
    "cfpLoadingBarProvider",
    "$httpProvider",
    function ($stateProvider, $urlRouterProvider, $locationProvider, cfpLoadingBarProvider, $httpProvider) {
      cfpLoadingBarProvider.latencyThreshold = 200;
      cfpLoadingBarProvider.includeSpinner = true;
      //$urlRouterProvider.otherwise('/');
      $stateProvider
        .state("account", {
          url: '/myaccount',
          abstract: true,
          templateUrl: "account/templates/account_tmpl.html",
            controller: 'accountCtrl',
            resolve: {
                userServiceObject:['userService', function(userService) {
                    return userService.getCurrentUser();
                }],
                populateUserModelService:['userServiceObject', 'accountDashboardHelpers', function(userServiceObject, accountDashboardHelpers) {
                    return accountDashboardHelpers.assignUserModelData(userServiceObject);
                }]
            }
        })

        .state("account.home", {
          url: '',
            resolve: {
                userListingsObject:['listingsService', function(listingsService) {
                    return listingsService.getListings({})
                     .then(function(listingsData) {
                        return listingsService.cachedListings = listingsData;
                     });
                }],
                selectedOffersObject:['offersService', function(offersService) {
                    return offersService.selectedOffers();
                }],
                userLoans:['loansService', 'userListingsObject', function(loansService, userListingsObject) {
                    return loansService.getUserLoans();
                }],
                spectrumBankAccounts:['userService', function(userService) {
                    return userService.getSpectrumBankAccountList();
                }],
                previousSuccessfulLogin:['userService', function(userService) {
                    return userService.getPreviousSuccessfulLogin();
                }]
            },
          views: {
            "account-content" : {
              templateUrl: "account/templates/account_content_tmpl.html",
                controller: ['$scope', 'userLoans', function($scope, userLoans){
                    $scope.userLoans = userLoans;
                }]
            },
            "account-listings@account.home" : {
                templateUrl: "account/templates/account_listings_tmpl.html",
                controller: 'ListingsController',
                controllerAs: 'ListingsVM'
            },
            "account-loans@account.home" : {
              templateUrl: "account/components/payments/templates/payments_tmpl.html",
              controller: 'PaymentsCtrl',
              controllerAs: 'PaymentsVM'
            }
          }
        })
        .state("account.payment-details", {
            url: '',
              views: {
                  "account-content": {
                      templateUrl: "account/directives/pr-payment-details/payment_details_grid_directive_tmpl.html",
                      controller:'PaymentDetailsGridCtrl',
                      controllerAs: 'PaymentDetailsGridVM'
                  }
              },
              params: {
                  loan_number: 0,
                  loan_description:" ",
                  loan_amount:0
              }
        });
       $locationProvider.html5Mode(true);
    }
  ])
  .run(['$rootScope', '$state', '$stateParams', '$timeout', '$window', 'userService', 'cfpLoadingBar', 'accountDashboardHelpers', 'userModel',
      function ($rootScope,   $state,   $stateParams, $timeout, $window, userService, cfpLoadingBar, accountDashboardHelpers, userModel) {
        accountDashboardHelpers.loadMomentTimeZoneData();
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.railsVariables = railsVariables;

        $rootScope.startLoader = function() {
            cfpLoadingBar.start();
        };

        $rootScope.completeLoader = function () {
            cfpLoadingBar.complete();
        };

        $rootScope.$on('cfpLoadingBar:completed', function (event, toState, toParams, fromState, fromParams, error) {
          $('.footer-primary').css('display', 'block');
        });


        $(document).on('click', '.onHoldSupportLink', function(e){
            e.stopPropagation();
            location.href= "/help/support.aspx";
        });

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        console.log("error:", error, event, toState, fromState);
        throw error;

        });
      }
    ]
  )

  .controller('accountCtrl', ['$scope', 'userService', 'userServiceObject', 'userModel', 'listingsService', '$window', 'ld', '$location', 'userAccountServices', 'accountDashboardHelpers','analyticsService',
      function($scope, userService, userServiceObject, userModel, listingsService, $window, ld, $location, userAccountServices, accountDashboardHelpers,analyticsService){
      var accountVM = this;
      var baseUrl = window.appConfig.PROSPER_API_BASE_URL || window.appConfig.PROSPER_BASE_URL;

      accountInit();

      function accountInit(){
        setUpMyAccountFlags();
      }

      function setUpMyAccountFlags() {
        var ff = window.prosper.featureFlags;
        if ((ff.isRunning('docUpload') && ff.getFeatureData('docUpload').source !== "url") || typeof ff.isRunning('docUpload') === 'undefined') {
          var optimizely = window.optimizely || {};
          var activeExp = optimizely.variationNamesMap;

          if (typeof activeExp == 'object') {
            for (var experimentKey in activeExp) {
              var optimizelyData = optimizely.allExperiments[experimentKey];
              if (optimizelyData.enabled) {
                ff.setFeatureByObject({
                  name: 'docUpload',
                  variants: ['old', 'new'],
                  running: true,
                  traffic: window.appConfig.FF_DOC_UPLOAD_TRAFFIC || 0,
                  numericId: userServiceObject.user.user_id});
              }
            }
          }
        }
      }

      analyticsService.data = $.extend(true, {pageNames:[], evars:{}}, {
          type : "page"
          ,pageNames : ['overview']
          ,url : location.href
          ,workFlow : ['account']
          ,funnel : 'bor'
          ,trackingCode : 'borrower_page_load'
      });

      analyticsService.track();
  }]);


