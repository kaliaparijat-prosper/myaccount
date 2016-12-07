angular.module('network-helper',
    ["utils.vendor", "accountErrorCodes"]
    )
    .factory('networkHelper',
        ['$q', '$http', 'jq','$rootScope',"accountErrorCodes",'$location','ld',
            function($q, $http, jq, $rootScope,accountErrorCodes,$location,ld) {
                var networkHelper = {

                    requestHandlers: {
                        defaultHeaders : {
                            headerFormat: {
                                'Content-Type': 'application/json'
                            },
                            serializeRequest: false,
                            httpMethod: 'POST',
                            timeout: 129000
                        },
                        processHeaders: function(customHeaders){
                            var requestHeaders = angular.extend(this.defaultHeaders, customHeaders);
                            if (requestHeaders.serializeRequest) {
                                requestHeaders.headerFormat = {
                                    'Content-Type': 'application/x-www-form-urlencoded'
                                };
                            }
                            return requestHeaders;
                        },
                        processParameters: function(customParameters){
                            var requestParameters = angular.extend({}, customParameters);
                           // requestParameters.user_source_system = 'PUBLIC_SITE';
                            return requestParameters;

                        },
                        processURL: function(customURL, apiRoutesScope){
                            var requestURL = '';
                            requestURL = window.appConfig.PROSPER_API_BASE_URL + apiRoutesScope + customURL;
                            return requestURL;

                        }
                    },

                    responseHandlers: {
                        processResponseErrors: function(networkResponse, status, headers, config){
                        }
                    },

                    postNetworkRequest: function(customURL, customParameters, customHeaders, apiRoutesScope){
                        if(typeof apiRoutesScope === 'undefined'){
                            apiRoutesScope = '/myaccount/';
                        }

                        var deferredNetworkRequest = $q.defer();
                        var requestParameters = this.requestHandlers.processParameters(customParameters);

                        if (!angular.isString(customURL) || customURL === '') {
                            deferredNetworkRequest.reject('Invalid URL');
                        }

                        var requestURL = this.requestHandlers.processURL(customURL, apiRoutesScope);
                        var requestHeaders = this.requestHandlers.processHeaders(customHeaders);
                        if (requestHeaders.serializeRequest) {
                            try {
                                requestParameters = jq.param(requestParameters);
                            } catch (err) {
                                deferredNetworkRequest.reject('Invalid request parameters');
                            }
                        }

                        var requestParametersObject = {
                            url: requestURL,
                            method: requestHeaders.httpMethod,
                            headers: requestHeaders.headerFormat,
                            timeout: requestHeaders.timeout
                        }

                        if(requestHeaders.httpMethod === 'GET' || requestHeaders.ignoreLoadingBar){
                            requestParametersObject.params = requestParameters;
                            if(requestParametersObject.params.ignoreLoadingBar || requestHeaders.ignoreLoadingBar) {
                                angular.extend(requestParametersObject, {ignoreLoadingBar: true});
                            }
                        }
                        else{
                            requestParametersObject.data = requestParameters;
                        }

                        $http(requestParametersObject)
                        .success(function(networkResponse) {

                            deferredNetworkRequest.resolve(networkResponse);
                        }).error(function(networkResponse, status, headers, config){
                            if(status in accountErrorCodes.account){
                                $rootScope.$emit("event:exception", accountErrorCodes.account[status].page);
                            }

                            deferredNetworkRequest.reject(networkResponse);

                        });
                        return deferredNetworkRequest.promise;
                    }
                };
                return networkHelper;
            }
        ]);