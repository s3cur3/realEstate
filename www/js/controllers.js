function hideOrShowBackBtn() {
    function hideOrShowBackBtnNonRecursive() {
        var backBtnVisible = $(".back-button").is(":visible") && $(".back-button.ng-hide").length == 0;
        var menuBtn = $('.buttons.left-buttons');
        if( backBtnVisible ) {
            console.log("back btn found");
            menuBtn.hide();
        } else {
            console.log("no back btn found");
            menuBtn.show();
        }
    }

    hideOrShowBackBtnNonRecursive();
    window.setTimeout(hideOrShowBackBtnNonRecursive, 50);
    window.setTimeout(hideOrShowBackBtnNonRecursive, 100);
    window.setTimeout(hideOrShowBackBtnNonRecursive, 300);
}

angular.module('RealEstateApp.controllers', [])

    .controller('AppCtrl', ['$scope', '$location', '$ionicModal', 'PropertyService', 'CalculatorService', 'CriteriaService', function( $scope, $location, $ionicModal, PropertyService, CalculatorService, CriteriaService ) {
        // Set up property functionality
        $scope.propertyService = PropertyService;
        $scope.properties = PropertyService.allProperties();
        $scope.property = $scope.properties[ PropertyService.getLastActiveIndex() ];

        $scope.calc = CalculatorService;

        $scope.criteria = CriteriaService.allCriteria();

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

        // Tools for deleting a property
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

        // Flags for dealing with editable text fields
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

        // Update the master property list whenever we modify this property
        $scope.$watch('property', function(updatedProperty, oldProperty) {
            if( typeof updatedProperty == "object" && updatedProperty ) {
                PropertyService.save(updatedProperty);
                $scope.properties = PropertyService.allProperties();
            } else {
                console.log("Got empty property in an update...?");
            }
        }, true);

        // Update the master criteria list whenever we modify this property
        $scope.$watch('criteria', function(updatedCriteria, oldCriteria) {
            if( typeof updatedCriteria == "object" && updatedCriteria ) {
                console.log("Saving criteria:", updatedCriteria);
                CriteriaService.save(updatedCriteria);
                $scope.criteria = CriteriaService.allCriteria();
            } else {
                console.error("Got empty criteria list in an update...?");
            }
        }, true);
    }])


    .controller('CriteriaCtrl', ['$scope', 'CriteriaService', function($scope, CriteriaService) {
        console.log("In CriteriaCtrl");
        hideOrShowBackBtn();
    }])

    .controller('PropertiesCtrl', ['$scope', '$location', 'PropertyService', function($scope, $location, PropertyService) {
        console.log("In PropertiesCtrl");
        hideOrShowBackBtn();

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
        hideOrShowBackBtn();

        // Update the currently-in-use property when we load this one
        var re = /[0-9]+$/;
        var id = $location.url().match(re);
        $scope.selectProperty( PropertyService.getPropertyByID(id) );
    }])

    .controller('AnalysisCtrl', function($scope) {
        console.log("In AnalysisCtrl");
        hideOrShowBackBtn();
    })

    .controller('FinancingCtrl', function($scope) {
        console.log("In FinancingCtrl");
        hideOrShowBackBtn();
    })

    .controller('ProFormaCtrl', function($scope) {
        console.log("In ProFormaCtrl");
        hideOrShowBackBtn();

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

