angular.module("account.payments")
    .service("paymentsService", ['$location', function($location) {
      var paymentsServicesEndPoints = {
        getLoans: 'api/v1/payments/getLoans',
        payLoan: 'api/v1/payments/payLoan'
      };
      var paymentsServiceObject = {
        httpOptions: {},

        getLoansMockData: function () {
          var loansResponse = {
            loans: [
              {
                loanId: '123456',
                loanAmount: '5000',
                loanDate: '12/15/15'
              },
              {
                loanId: '56789',
                loanAmount: '4000',
                loanDate: '12/31/15'
              },
              {
                loanId: '22222',
                loanAmount: '1000',
                loanDate: '11/30/15'
              }
            ]
          };
          return loansResponse;
        },
        getPayDateOptions: function(payDateOptions){
            var minDate = [parseInt(moment(new Date).format("YYYY")), parseInt(moment(new Date).format("M")) - 1, parseInt(moment(new Date).format("D"))];
            var maxDate = [parseInt(moment(payDateOptions.dueDate, 'MMM. DD, YYYY').format("YYYY")), parseInt(moment(payDateOptions.dueDate, 'MMM. DD, YYYY').format("M")), parseInt(moment(payDateOptions.dueDate, 'MMM. DD, YYYY').format("D"))];
          return {
            format: 'mm/dd/yy',
            formatSubmit: 'mm/dd/yy',
            editable: false,
            selectYears: false,
            selectMonths: false,
            due: new Date(maxDate),
            onOpen: function() {
              scrollPageTo( this.$node )
            },
            closeOnSelect: true,
            closeOnClear: true,
            onOpen: function() {
                scrollIntoView( this.$node );
            },
            onSet: function(context) {
            },
            today: 'Today',
            clear: 'Selected date',
            close: 'Due date',
            klass: {
              holder: 'picker__holder',
              active: 'picker__input--active',
              day: 'picker__day',
              disabled: 'picker__day--disabled',
              selected: 'picker__day--selected',
              highlighted: 'picker__day--highlighted',
              now: 'picker__day--today',
              infocus: 'picker__day--infocus',
              outfocus: 'picker__day--outfocus',
              buttonClear: 'picker__button--selectedDate',
              buttonClose: 'picker__button--dueDate',
              buttonToday: 'picker__button--today'
            }
          };
        }
      };
      return paymentsServiceObject;
    }]);

function scrollIntoView( $node ) {
    $('html,body').animate({
        scrollTop: ~~$node.offset().top - 60
    })
}

