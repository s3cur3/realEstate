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

    .service('PropertyService', function() {
        var DEMO = false;
        var _this = this;
        var _count = 0;
        var _Property = function( id ) {
            if( DEMO ) {
                return {
                    id: id,
                    name: "Sample name " + id,

                    purchasePrice: 63000,
                    repairsAndImprovements: 500,
                    appraisedValue: 85000,

                    // Loan
                    getLoanAmount: function() {
                        return this.purchasePrice;
                    },

                    // Income
                    totalAnnualOperatingIncome: 12186.60,
                    getNetAnnualOperatingIncome: function() {
                        return this.totalAnnualOperatingIncome - this.totalAnnualOperatingExpenses;
                    },

                    // Expenses
                    getTotalCashOutlay: function() { return 2405.00 },
                    totalAnnualOperatingExpenses: 2672.00,

                    // Investment stats
                    getCapRate: function() {
                        return this.getNetAnnualOperatingIncome() / this.purchasePrice;
                    },
                    getCashFlow: function() {
                        return 257.03;
                    },
                    getDSCR: function() {
                        return 1.34;
                    },
                    getGRM: function() {
                        return 4.95;
                    },
                    getLTV: function() {
                        return this.getLoanAmount() / this.appraisedValue;
                    }
                }
            }

            return {
                id: id,
                name: "New property",

                // Loan
                getLoanAmount: function() {
                    return this.purchasePrice;
                },

                // Income
                totalAnnualOperatingIncome: 12186.60,
                getNetAnnualOperatingIncome: function() {
                    return this.totalAnnualOperatingIncome - this.totalAnnualOperatingExpenses;
                },

                // Expenses
                getTotalCashOutlay: function() { return 2405.00 },
                totalAnnualOperatingExpenses: 2672.00,

                // Investment stats
                getCapRate: function() {
                    return this.getNetAnnualOperatingIncome() / this.purchasePrice;
                },
                getCashFlow: function() {
                    return 257.03;
                },
                getDSCR: function() {
                    return 1.34;
                },
                getGRM: function() {
                    return 4.95;
                },
                getLTV: function() {
                    return this.getLoanAmount() / this.appraisedValue;
                }
            }
        };

        this.newProperty = function() {
            var prop = _Property(_count++);
            _this.save(prop);

            _this.setLastActiveIndex(prop.id);
            return  prop;
        };

        this.allProperties = function() {
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
            properties = _.remove( properties, function(prop) {
                return prop.id == property.id;
            });
            _this.save(properties);
        };

        this.getLastActiveIndex = function() {
            return parseInt(window.localStorage['lastActiveProperty']) || 0;
        };

        this.setLastActiveIndex = function( index ) {
            window.localStorage['lastActiveProperty'] = index;
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

            .state('app.analysis', {
                url: "/property/analysis",
                views: {
                    'menuContent': {
                        templateUrl: "templates/analysis.html",
                        controller: 'AnalysisCtrl'
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

            /*.state('app.property', {
             url: "/property",
             views: {
             'menuContent': {
             templateUrl: "templates/property.html",
             controller: 'PropertyCtrl'
             }
             }
             })*/

            .state('app.property', {
                url: "/properties/:propertyId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/property.html",
                        controller: 'PropertyCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/properties');
    });


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
