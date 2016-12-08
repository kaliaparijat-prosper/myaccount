angular.module("accountAnalyticsService",[])
    .service("accountEventTrackerService", AccountEventsService);

/**
 * Dependencies.
 */

AccountEventsService.$inject = [
    '$state',
    'analyticsService'
];

function AccountEventsService($state, analyticsService) {
    this.trackEvents = function (eventName,eVar) {
        if(eVar === undefined){
            eVar={};
        }
        analyticsService.track({
            type: 'event',
            evars: eVar,
            trackingCode: eventName
        });
    }
}