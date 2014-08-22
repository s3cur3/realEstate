function assert( testResult, optionalErrorMsg ) {
    if( !testResult ) {
        var errorStr = "ERROR";
        if( optionalErrorMsg ) {
            errorStr += ": " + optionalErrorMsg;
        }

        console.error( errorStr );
    }
}


angular.module('RealEstateApp', ['ionic', 'RealEstateApp.controllers', 'RealEstateFilters'])

    .run(function( $ionicPlatform ) {
        $ionicPlatform.ready(function() {
            if( window.StatusBar ) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .service('CalculatorService', function() {
        var _this = this;

        // Loan
        this.getAllIn = function(property) {
            return property.initial.purchasePrice+property.initial.repairsAndImprovements;
        };

        // Income
        this.getGrossAnnualOperatingIncome = function(property) {
            var monthlyIncome = (property.income.grossMonthlyRentalIncome || 0) + (property.income.otherMonthlyIncome || 0); // protection against NaN
            var monthlyLoss = (property.income.grossMonthlyRentalIncome || 0) * (property.expenses.vacancyRateLoss || 0)/100;
            return monthlyIncome*12 - (monthlyLoss*12);
        };
        this.getGrossOperatingIncome = function(p) { // monthly
            return _this.getGrossAnnualOperatingIncome(p)/12;
        };
        /*
        this.getNetAnnualOperatingIncome = function(property) {
            return property.totalAnnualOperatingIncome - property.totalAnnualOperatingExpenses;
        };*/

        // Expenses
        this.getAnnualExpenses = function(property) {
            var tax = property.expenses.annualPropertyTax || 0;
            var insurance = property.expenses.annualInsurance || 0;
            var expenses = (property.expenses.miscMonthlyExpenses || 0)*12;
            var management = (property.income.grossMonthlyRentalIncome || 0) * (property.expenses.propertyManagementPercent || 0)/100 * 12;
            var maintenance = (property.income.grossMonthlyRentalIncome || 0) * (property.expenses.maintenancePercent || 0)/100 * 12;
            return tax + insurance + expenses + management + maintenance;
        };
        this.getTotalOperatingExpenses = function(p) { // monthly
            return _this.getAnnualExpenses(p)/12;
        };
        this.getTotalCashOutlay = function(property) { return 2405.00 };

        // Financing
        this.getDownPayment = function(property) {
            return _this.getAllIn(property) * property.loan.downPaymentPercent/100
        };
        this.getLoanAmount = function(property) {
            return _this.getAllIn(property) - _this.getDownPayment(property);
        };
        this.getLoanPayment = function(property) { // monthly
            return ExcelFormulas.PMT(property.loan.interestRate/100/12, property.loan.termYears*12, -_this.getLoanAmount(property));
        };
        this.getPITI = function(p) {
            return _this.getLoanPayment(p) + (p.expenses.annualInsurance/12) + (p.expenses.annualPropertyTax/12);
        };

        // Pro forma
        this.getDebtService = function(property) { // monthly
            return -_this.getLoanPayment(property);
        };
        this.getNetOperatingIncome = function(p) { // monthly
            return _this.getGrossOperatingIncome(p) - _this.getTotalOperatingExpenses(p);
        };

        // Investment stats
        this.getCapRate = function(property) {
            return _this.getGrossAnnualOperatingIncome(property) / _this.getAllIn(property);
        };
        this.getCashFlow = function(property) {
            return _this.getNetOperatingIncome(property) + _this.getDebtService(property);
        };
        this.getDSCR = function(property) {
            console.error("Implement getDSCR()");
            return 1.34;
        };
        this.getGRM = function(p) {
            return _this.getAllIn(p)/ (p.income.grossMonthlyRentalIncome*12);
        };
        this.getLTV = function(property) {
            return _this.getLoanAmount(property) / property.value.appraisedValue;
        };
    })

    .service('PropertyService', function() {
        var _Property = function() {
            return {
                id: _this._getNextID(),
                basics: {
                    name: "New property"
                },

                initial: {
                    purchasePrice: 0,
                    repairsAndImprovements: 0
                },
                value: {
                    appraisedValue: 0
                },

                // Income
                income : {
                    grossMonthlyRentalIncome: 0,
                    otherMonthlyIncome: 0
                },
                totalAnnualOperatingIncome: 0,

                // Expenses
                expenses: {
                    vacancyRateLoss: 10,
                    annualPropertyTax: 0,
                    annualInsurance: 0,
                    propertyManagementPercent: 0,
                    maintenancePercent: 10,
                    miscMonthlyExpenses: 0
                },
                totalAnnualOperatingExpenses: 2672.00,

                // Investment stats
                loan: {
                    interestRate: 6.0,
                    termYears: 15,
                    downPaymentPercent: 20
                }
            }
        };

        this._getNextID = function() {
            var all = _this.allProperties();

            var id;
            if( all.length > 0 ) {
                id = all[ all.length - 1 ].id + 1;
            console.log("Found ID to be " + id);
            } else {
                id = 0;
                console.log("No known properties!");
                console.log(all);
            }

            return id;
        };

        this.newProperty = function() {
            var prop = _Property();
            console.log("Created new property with ID " + prop.id);
            _this.save(prop);

            _this.setLastActiveIndex(prop.id);
            return  prop;
        };

        this.getPropertyByID = function(id) {
            var properties = _this.allProperties();


            if( properties.length > 0 ) {
                for( var i = 0; i < properties.length; i++ ) {
                    if( properties[i].id == id ) {
                        return properties[i];
                    }
                }

                console.error("ERROR: Couldn't find property " + id);
                return properties[0];
            }
            return _this.newProperty();
        };

        this.allProperties = function() {
            // TODO: This is RIDICULOUSLY inefficient --- it's called all the damn time!
            if( DEMO ) {
                var list = [];
                for( var i = 0; i < 10; i++ ) {
                    list.push(_Property(i));
                }
                return list;
            }

            var propertiesString = window.localStorage['properties'];
            if( propertiesString ) {
                var properties = angular.fromJson(propertiesString);

                if( !Array.isArray(properties) ) {
                    return [];
                }

                // TODO: Remove this?
                // Nuke any properties without an id
                _.remove( properties, function(prop) {
                    if( typeof prop == "object" && prop ) {
                        return prop.id == null;
                    }
                    return true; // Not an object; what's it doing here??
                });

                return properties;
            }
            return [];
        };

        /**
         * If property already exists in the list of properties, it will
         * be updated. If it does not exist, we will append it.
         * @param property {*}
         * @param properties Array
         * @returns Array The updated properties array
         * @private
         */
        this._addPropertyToProperties = function( property, properties ) {
            var foundProperty = false;
            for( var i = 0; i < properties.length; i++ ) {
                if( properties[i].id === property.id ) {
                    foundProperty = true;
                    properties[i] = property;
                    break;
                }
            }

            if( !foundProperty ) {
                properties.push(property);
            }

            return properties;
        };

        this._orderProperties = function( properties ) {
            function sortByID(a, b){
                return ((a.id < b.id) ? -1 : ((a.id > b.id) ? 1 : 0));
            }

            properties.sort(sortByID);
            return properties;
        };

        this.save = function( propertyOrProperties ) {
            var properties = [];
            if( !Array.isArray(propertyOrProperties) ) {
                properties = _this.allProperties();

                var property = propertyOrProperties;
                assert( typeof property == "object", "Property is not an object" );
                properties =  _this._addPropertyToProperties( property, properties );
            } else {
                properties = propertyOrProperties;
            }

            properties = _this._orderProperties(properties);

            // TODO: make this more efficient?
            window.localStorage['properties'] = angular.toJson(properties);
        };

        this.delete = function( property ) {
            var properties = _this.allProperties();
            _.remove( properties, function(prop) {
                return prop.id == property.id;
            });
            _this.save(properties);
        };

        this.getLastActiveIndex = function() {
            return parseInt(window.localStorage['lastActiveProperty']) || 0;
        };

        this.setLastActiveIndex = function( indexOrProperty ) {
            if( typeof indexOrProperty == "number" ) {
                window.localStorage['lastActiveProperty'] = indexOrProperty;
            } else {
                window.localStorage['lastActiveProperty'] = _this._getIndexOfProperty(indexOrProperty);
            }

        };

        this._getIndexOfProperty = function( prop ) {
            assert(typeof prop == "object", "Sought property is not a valid property object.");

            var all = _this.allProperties();
            for( var i = 0; i < all.length; i++ ) {
                if( all[i].id == prop.id ) {
                    return i;
                }
            }
            return -1;
        };

        var DEMO = false;
        var _this = this;
    })

    .service('CriteriaService', function() {
        var _Criteria = function() {
            return {
                capRate: 12,
                cashFlow: 250,
                grm: 7,
                dscr: 1.3,
                ltv: 75
            }
        };

        this.allCriteria = function() {
            // TODO: This is RIDICULOUSLY inefficient --- it's called all the damn time!
            var criteriaString = window.localStorage['criteria'];
            if( criteriaString ) {
                var criteria = angular.fromJson(criteriaString);

                if( typeof criteria !== "object" ) {
                    return new _Criteria();
                }

                return criteria;
            } else {
                return new _Criteria();
            }
        };

        this.save = function( criteria ) {
            assert(typeof criteria === "object", "Got non-object Criteria");

            // TODO: make this more efficient?
            window.localStorage['criteria'] = angular.toJson(criteria);
        };
    })

    // Define our routes
    .config(function( $stateProvider, $urlRouterProvider ) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.criteria', {
                url: "/criteria",
                views: {
                    'menuContent': {
                        templateUrl: "templates/criteria.html",
                        controller: 'CriteriaCtrl'
                    }
                }
            })

            .state('app.properties', {
                url: "/properties",
                views: {
                    'menuContent': {
                        templateUrl: "templates/properties.html",
                        controller: 'PropertiesCtrl'
                    }
                }
            })

            .state('app.property', {
                url: "/properties/:propertyId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/property.html",
                        controller: 'PropertyCtrl'
                    }
                }
            })

            .state('app.analysis', {
                url: "/properties/:propertyId/analysis",
                views: {
                    'menuContent': {
                        templateUrl: "templates/analysis.html",
                        controller: 'AnalysisCtrl'
                    }
                }
            })

            .state('app.financing', {
                url: "/properties/:propertyId/financing",
                views: {
                    'menuContent': {
                        templateUrl: "templates/financing.html",
                        controller: 'FinancingCtrl'
                    }
                }
            })

            .state('app.proForma', {
                url: "/properties/:propertyId/pro-forma",
                views: {
                    'menuContent': {
                        templateUrl: "templates/pro-forma.html",
                        controller: 'ProFormaCtrl'
                    }
                }
            })

        ;
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/properties');
    })

    .directive('group', function() {
        return {
            restrict: 'E', // must be an HTML element
            transclude: true,
            replace: true,
            scope: { label: '@' },
            template: '<section><div class="item item-divider">{{label}}</div><div ng-transclude></group>'
        };
    })
    .directive('numberField', function($compile) {
        return {
            restrict: 'E', // must be an HTML element
            replace: true,
            scope: {
                label: '@',
                prefix: '@',
                suffix: '@',
                model: '=ngModel',
                isEditable: '&'
            },
            template:
                '<label class="item" ng-click="$parent.makeEditable(label)">' +
                    '{{label}}' +
                    '<span class="item-field" ng-show="!$parent.isEditable(label)">{{prefix}}{{model}} {{suffix}}</span>' +
                    '<input class="item-field" ng-show="$parent.isEditable(label)" ng-blur="$parent.clearEditable(label)" type="number" class="right" ng-model="model">' +
                '</number-field>'
        };
    })
    .directive('textField', function() {
        return {
            restrict: 'E', // must be an HTML element
            replace: true,
            transclude: true,
            scope: {
                label: '@',
                model: '=ngModel'
            },
            template:
                '<label class="input-text item">' +
                    '{{label}}' +
                    '<input type="text" ng-model="model" class="item-field">' +
                '</input-text>'
        };
    })
    .directive('calculatedField', function() {
        return {
            restrict: 'E', // must be an HTML element
            replace: true,
            transclude: true,
            scope: {
                label: '@',
                prefix: '@',
                suffix: '@',
                model: '=ngModel'
            },
            template:
                '<label class="input-number item simulate-input-container">' +
                    '{{label}}' +
                    '<span class="simulate-input item-field" id="allInPrice"><div ng-transclude></span>' +
                '</calculated-field>'
        };
    })
;


angular.module('RealEstateFilters', [])
    .filter('percent', function() {
        return function( input ) {
            var rounded = Math.round(input * 10000) / 100;
            if( isNaN(rounded) ) {
                return '';
            }
            return '' + rounded + '%';
        };
    });
