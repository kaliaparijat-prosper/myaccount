angular.module("accountDashboardModels")
    .factory("userModel",
        ['ld', '$q', '$timeout', 'jq',
            function(ld, $q, $timeout, jq) {
                var regDataObject = {
                    loadingData: false,
                    failedIdv: false,
                    bankNameFlg: false,
                    sessionData: {
                        email: ''
                    },
                    user: {},
                    data:{
                        user: {},
                        user_id : "",
                        type: "BORROWER",
                        password: "",
                        alt_key : "",
                        status: "",
                        credit_quality_id : "",
                        state_of_residence: "",
                        is_registration_complete: false,
                        ssn: "",
                        masked_ssn: "",
                        roles: "",
                        contact_info: {
                            email: "",
                            phone_numbers: {
                                mobile_phone: "",
                                home_phone: "",
                                work_phone: "",
                                employer_phone: ""
                            }
                        },
                        lending_accreditation: {
                            consent_to_electronic_disclosures: true,
                            terms_of_use: true,
                            privacy_policies_agreement: true,
                            lender_registration_agreement_approved: false,
                            prospectus_reviewed: false,
                            credit_profile_auth: false,
                            is_tax_withholding_approved: false
                        },
                        personal_info: {
                            first_name: "",
                            last_name: "",
                            middle_initial : "",
                            user_name_type_id: 3,
                            source_type_id: 1,
                            date_of_birth: ""
                        },
                        employment_info: {
                            employer_name : "",
                            employment_status_id : "",
                            yearly_income: "",
                            occupation_id: "",
                            employment_start_year: "",
                            employment_start_month: ""
                        },
                        address_info: {
                            address: "",
                            city: "",
                            state: "",
                            zip_code: "",
                            address_type_id : ""
                        },
                        bank_account_info: {
                            account_number: "",
                            bank_name: "",
                            routing_number: "",
                            bank_account_type: "",
                            first_account_holder_name: "",
                            account_id: '',
                            withdrawal_type: ''
                        },
                        suggested_address: {
                            address_info: {
                                address_1: "",
                                city: "",
                                state: "",
                                zip_code: ""
                            },
                            isSuggestedAddress: false,
                            isAddressFound: true,
                            addressValidationFailureReason: "Not Found",
                            isReview: false
                        },
                        payload: {
                            bank_account: {
                                account_id: "",
                                bank_name: "",
                                first_account_holder_name: "",
                                second_account_holder_name: "",
                                routing_number: "",
                                account_number: "",
                                bank_account_ownership_type: "",
                                bank_account_type: ""
                            },
                            account: {
                                nick_name: "",
                                account_type_code: "",
                                account_status_type: "",
                                is_default: ""
                            },
                            funding_option: "bank_acc"
                        },
                        dependencies: {
                            tila: {
                                type:"",
                                listing_id: "",
                                term: "",
                                offer_date: "",
                                first_due: "",
                                final_due: ""
                            },
                            offer: {
                                loan_amount : "",
                                listing_category_id : "",
                                credit_quality_id : "",
                                referral_code : "",
                                loan_purpose_id : "",
                                workFlow: ""
                            }
                        },
                        support_states: [],
                        merchants_info: []
                    },

                    setDependencies: function(dependent, params){
                        this.data.dependencies[dependent] = params;
                    },

                    getDependencies: function(dependent){
                        return this.data.dependencies[dependent];
                    },
                    setSsn: function(data) {
                        this.data.ssn = data;
                    },

                    setMaskedSsn: function(data) {
                        this.data.masked_ssn = data;
                    },

                    getSsn: function() {
                        return this.data.ssn;
                    },

                    setStateOfResi: function(data) {
                        this.data.state_of_residence = data;
                    },

                    getStateOfResi: function() {
                        return this.data.state_of_residence;
                    },

                    setIsRegistrationComplete: function(data) {
                        this.is_registration_complete = data;
                    },

                    setPassword: function(pwd) {
                        this.data.password = pwd;
                    },

                    setUserId: function(user_id){
                        this.data.user_id = user_id;
                    },
                    getUserId: function(){
                        return this.data.user_id
                    },
                    setUser: function(user_object){
                        this.data.user = user_object;
                    },
                    getUser: function(){
                        return this.data.user;
                    },
                    setAltKey: function(alt_key){
                        this.data.alt_key = alt_key;
                    },
                    getAltKey: function(){
                        return this.data.alt_key;
                    },
                    setLendingAccreditation: function(rec) {
                        ld.merge(this.data.lending_accreditation, rec);
                    },

                    getLendingAccreditation: function() {
                        return this.data.lending_accreditation;
                    },

                    setPersonalInfo: function(rec) {
                        ld.merge(this.data.personal_info, rec);
                    },

                    getPersonalInfo: function() {
                        return this.data.personal_info;
                    },

                    setEmployementInfo: function(rec) {
                        ld.merge(this.data.employment_info, rec);
                    },

                    getEmployementInfo: function() {
                        return this.data.employment_info;
                    },

                    setAddressInfo: function(rec) {
                        ld.merge(this.data.address_info,rec);
                    },

                    getAddressInfo: function() {
                        return this.data.address_info;
                    },

                    setContactInfo: function(rec) {
                        ld.merge(this.data.contact_info, rec);
                    },

                    getContactInfo: function() {
                        return this.data.contact_info;
                    },
                    setBankAcc: function(rec) {
                        ld.merge(this.data.bank_account_info, rec);
                    },
                    setAcc: function(rec) {
                        ld.merge(this.data.payload.account, rec);
                    },
                    getBankAcc: function() {
                        return this.data.bank_account_info;
                    },
                    getAcc: function() {
                        return this.data.payload.account;
                    },
                    setFundingOption: function(rec) {
                        this.data.payload.funding_option = rec;
                    },
                    getFundingOption: function() {
                        return this.data.payload.funding_option;
                    },
                    isUnSupportedState: function(state) {
                        var isUnSupport = true;
                        if(ld.include(this.data.support_states, state)) {
                            isUnSupport = false;
                        }
                        return isUnSupport;
                    },
                    setSupportedAddress: function(rec) {
                        ld.merge(this.data.suggested_address.address_info, rec);
                    },
                    setLendingAccreditation: function(rec) {
                        ld.merge(this.data.lending_accreditation, rec);
                    },
                    getLendingAccreditation: function() {
                        return this.data.lending_accreditation;
                    },
                    setRoles: function(roles) {
                        return this.data.roles = roles;
                    },
                    setStatus: function(status) {
                        return this.data.status = status;
                    },
                    setMerchantsInfo: function(dataArray) {
                        this.data.merchants_info = dataArray;
                    },
                    getMerchantsInfo: function() {
                        return this.data.merchants_info;
                    },
                    assignData: function() {
                        this.setRoles(this.user.roles);
                        this.setStatus(this.user.status);
                        this.setSsn(this.user.ssn);
                        this.setMaskedSsn(!(ld.isEmpty(this.user.masked_ssn)) ? this.user.masked_ssn :'');
                        this.setUserId(!(ld.isEmpty(this.user.user_id)) ? this.user.user_id : '');
                        this.setAltKey(!(ld.isEmpty(this.user.alt_key)) ? this.user.alt_key : '');
                        this.setPersonalInfo(!(ld.isEmpty(this.user.personal_info)) ? this.user.personal_info:{});
                        this.setEmployementInfo(!(ld.isEmpty(this.user.employment_info)) ? this.user.employment_info:{})
                        this.setAddressInfo(!(ld.isEmpty(this.user.address_info)) ? this.user.address_info : {});
                        this.setContactInfo(!(ld.isEmpty(this.user.contact_info)) ? this.user.contact_info : {});
                        this.setBankAcc(!(ld.isArray(this.user.bank_account_info)) ? this.user.bank_account_info : {});
                        this.setMerchantsInfo(!ld.isEmpty(this.user.merchants_info) ? this.user.merchants_info : []);
                    },
                    setAltKeyToCookie: function (altKey) {
                        jq.cookie('alt_key', altKey);
                    },
                    getAltKeyFromCookie: function () {
                        return jq.cookie('alt_key') || '';
                    }
                };
                return regDataObject;
            }
        ]);
