angular.module('RealEstateApp.controllers', [])

    .controller('AppCtrl', ['$scope', '$location', '$ionicModal', 'PropertyService', 'CalculatorService', function( $scope, $location, $ionicModal, PropertyService, CalculatorService ) {
        // Set up property functionality
        $scope.properties = PropertyService.allProperties();
        $scope.property = $scope.properties[ PropertyService.getLastActiveIndex() ];

        $scope.calc = CalculatorService;

        $scope.criteria = {
            capRate: 12,
            cashFlow: 250,
            grm: 7,
            dscr: 1.3,
            ltv: 75
        };

        $scope.selectProperty = function(prop, index) {
            $scope.property = prop;
            PropertyService.setLastActiveIndex(index || prop);
        };

        $scope.analysis = {
            capRateGood: function() {
                return $scope.calc.getCapRate( $scope.property ) * 100 >= $scope.criteria.capRate;
            },
            cashFlowGood: function() {
                return $scope.calc.getCashFlow( $scope.property ) >= $scope.criteria.cashFlow;
            },
            dscrGood: function() {
                return $scope.calc.getDSCR( $scope.property ) > $scope.criteria.dscr;
            },
            grmGood: function() {
                return $scope.calc.getGRM( $scope.property ) < $scope.criteria.grm;
            },
            ltvGood: function() {
                return $scope.calc.getLTV( $scope.property ) * 100 < $scope.criteria.ltv;
            }
        };

        $scope.greenLight = function() {
            var giveGreenLight = true;
            for( var fn in $scope.analysis ) {
                giveGreenLight &= $scope.analysis[fn]();
            }
            return giveGreenLight;
        };


        // Functionality for the Delete Modal
        $ionicModal.fromTemplateUrl('delete.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.deleteModal = modal;
        });

        $scope.delete = function(p) {
            $scope.propertyToDelete = p;
            $scope.deleteModal.show();
        };
        $scope._delete = function() {
            $scope.deleteModal.hide();
            PropertyService.delete($scope.propertyToDelete);
            $location.path('/properties');
        };
        $scope.closeDelete = function() {
            $scope.deleteModal.hide();
        };

        $scope.makeEditable = function(labelForField) {
            $scope.editable = labelForField;
        };
        $scope.isEditable = function(labelForField) {
            return $scope.editable === labelForField;
        };
        $scope.clearEditable = function(label) {
            if($scope.editable == label) // Don't touch it if this field isn't being edited currently!
                $scope.editable = null;
        };

    }])


    .controller('CriteriaCtrl', function($scope) {
        console.log("In CriteriaCtrl");
    })

    .controller('PropertiesCtrl', ['$scope', '$location', 'PropertyService', function($scope, $location, PropertyService) {
        console.log("In PropertiesCtrl");
        $scope.properties = PropertyService.allProperties();
        if( $scope.properties.length == 0 ) {
            $scope.property = PropertyService.newProperty();
            $scope.properties = PropertyService.allProperties();
        }

        $scope.addProperty = function() {
            console.log("Adding property");
            var p = PropertyService.newProperty();
            $scope.properties = PropertyService.allProperties();
            $scope.selectProperty(p);

            console.log("Setting path to " + '/properties/' + PropertyService.getLastActiveIndex());
            $location.path('/#/properties/' + PropertyService.getLastActiveIndex());
        }

    }])

    .controller('PropertyCtrl', ['$scope', '$location', 'PropertyService', function($scope, $location, PropertyService) {
        console.log("In PropertyCtrl");

        // Update the currently-in-use property when we load this one
        var re = /[0-9]+$/;
        var id = $location.url().match(re);
        $scope.selectProperty( PropertyService.getPropertyByID(id) );

        // Update the master property list whenever we modify this property
        $scope.$watch('property', function(updatedProperty, oldProperty) {
            if( typeof updatedProperty == "object" && updatedProperty ) {
                PropertyService.save(updatedProperty);
                $scope.properties = PropertyService.allProperties();
            } else {
                console.log("Got empty property in an update...?");
            }
        }, true);

    }])

    .controller('AnalysisCtrl', function($scope) {
        console.log("In AnalysisCtrl");

    })

    .controller('FinancingCtrl', function($scope) {
        console.log("In FinancingCtrl");

    })

    .controller('ProFormaCtrl', function($scope) {
        console.log("In ProFormaCtrl");


        $scope.renderPDF = function() {
            var doc = new jsPDF();

            // We'll make our own renderer to skip this editor
            var specialElementHandlers = {
                '.button': function(element, renderer){
                    return true;
                }
            };

            // All units are in the set measurement for the document
            // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
            doc.fromHTML(
                document.getElementById('pro-forma')[0], // ID to turn into a PDF
                15, // x coord
                15, // y coord
                {
                    'width': 170,
                    'elementHandlers': specialElementHandlers
                }
            );

            doc.save('Pro Forma.pdf');
        }
    })



;

