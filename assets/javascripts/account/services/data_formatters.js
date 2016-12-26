angular.module('accountDashboardDataFormatters', [])
    .filter('formatDate1', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }
            var _date;
            var inputDateFormat = 'YYYY-MM-DD';
            if(input.length === 8){
                inputDateFormat = 'MM/DD/YY';
                _date = moment(input, inputDateFormat).format('MMM. DD, YYYY');
            }
            else{
                _date = moment(input, inputDateFormat).format('MMM. DD, YYYY');
            }
            return _date;
        };
    }])
    .filter('formatDateWithSuffix', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }
            var dateFormat = 'MM/DD/YYYY';
            if(typeof input._i !== 'undefined'){
                dateFormat = input._f;
            }
            else if(input.indexOf(",") !== -1){
                dateFormat = 'MMM. DD, YYYY';
            }

            var _tempDate = new Date(moment(input, dateFormat).format('MM/DD/YYYY')).getDate();
            var _sfx = ["th","st","nd","rd"];
            var _val = _tempDate%100;
            var _tempDateSuffix = (_sfx[(_val-20)%10] || _sfx[_val] || _sfx[0]);
            return moment(input, dateFormat).format('MMM. D') + _tempDateSuffix;
        };
    }])
    .filter('formatDateWithOnlySuffix', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }
            var dateFormat = 'MM/DD/YYYY';
            if(typeof input._i !== 'undefined'){
                dateFormat = input._f;
            }
            else if(input.indexOf(",") !== -1){
                dateFormat = 'MMM. DD, YYYY';
            }

            var _tempDate = new Date(moment(input, dateFormat).format('MM/DD/YYYY')).getDate();
            var _sfx = ["th","st","nd","rd"];
            var _val = _tempDate%100;
            var _tempDateSuffix = (_sfx[(_val-20)%10] || _sfx[_val] || _sfx[0]);
            return moment(input, dateFormat).format('D') + _tempDateSuffix;
        };
    }])
    .filter('formatCurrency', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }

            if(parseFloat(input) === 0 || isNaN(parseFloat(input))){
                return $filter('currency')(0, "$", 0);
            }
            var _currency = $filter('currency')(input, "$", 2);
            return _currency;
        };
    }])
    .filter('formatCurrencyWithNoDecimalsForWholeNumbers', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }

            if(parseFloat(input) === 0 || isNaN(parseFloat(input))){
                return $filter('currency')(0, "$", 0);
            }
            var _currency = $filter('currency')(input, "$", 2);
            if(_currency.slice(-3) === '.00'){
                _currency = _currency.slice(0, -3);
            }
            return _currency;
        };
    }])
    .filter('formatCurrencyWithZeroDecimal', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }

            var _currency = $filter('currency')(input, "$", 0);
            return _currency;
        };
    }])
    .filter('formatBankAccountName', ['$filter', 'loansModel', function($filter, loansModel) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }
            var bank_accounts_list = loansModel.spectrumBankAccounts;

            for(var index = 0; index < bank_accounts_list.length; index++){
                if(bank_accounts_list[index].account_id === input){
                    return bank_accounts_list[index]['bank_name'] + " ***" + bank_accounts_list[index]['account_number'].replace(/\*/g, '');
                }
            }

        };
    }])
    .filter('formatZeroAsNA', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }

            if(input == '$0'){
                return "N/A";
            }
            else{
                return input;
            }

        };
    }])
    .filter('formatBankAccountNumber', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            input = input.slice(-4);
            var _output = "***" + input;
            return _output;
        };
    }])
    .filter('formatPaymentMode', ['$filter', function($filter) {
        return function(input){
            if(input == null){ return ""; }
            if(input == 'N/A'){ return "N/A"; }

            if(input === 'MANUAL'){ return "online"; }
            if(input === 'AUTOMATIC'){ return "AutoPay"; }
            if(input === 'FAILED'){ return "failed"; }
            if(input === 'NA'){ return "online"; }
            else return input.toLowerCase();
        };
    }]);


