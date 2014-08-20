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
        this.getLoanAmount = function(property) {
            return property.purchasePrice;
        };

        // Income
        this.getNetAnnualOperatingIncome = function(property) {
            return property.totalAnnualOperatingIncome - property.totalAnnualOperatingExpenses;
        };

        // Expenses
        this.getTotalCashOutlay = function(property) { return 2405.00 };

        // Investment stats
        this.getCapRate = function(property) {
            return _this.getNetAnnualOperatingIncome(property) / property.purchasePrice;
        };
        this.getCashFlow = function(property) {
            return 257.03;
        };
        this.getDSCR = function(property) {
            return 1.34;
        };
        this.getGRM = function(property) {
            return 4.95;
        };
        this.getLTV = function(property) {
            return _this.getLoanAmount(property) / property.appraisedValue;
        };
    })

    .service('PropertyService', function() {
        var _Property = function() {
            return {
                id: _this._getNextID(),
                name: "New property",

                purchasePrice: 63000,
                repairsAndImprovements: 500,
                appraisedValue: 85000,

                // Income
                totalAnnualOperatingIncome: 12186.60,

                // Expenses
                totalAnnualOperatingExpenses: 2672.00

                // Investment stats
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

        ;
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
