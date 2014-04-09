angular.module('RealEstateApp.controllers', [])

    .controller('AppCtrl', ['$scope', 'PropertyService', function( $scope, PropertyService ) {
        // Set up property functionality
        $scope.properties = PropertyService.allProperties();
        $scope.property = PropertyService.newProperty();

        $scope.criteria = {
            capRate: 12,
            cashFlow: 250,
            grm: 7,
            dscr: 1.3,
            ltv: 75
        };

        $scope.analysis = {
            capRateGood: function() {
                return $scope.property.getCapRate() * 100 >= $scope.criteria.capRate;
            },
            cashFlowGood: function() {
                return $scope.property.getCashFlow() * 100 >= $scope.criteria.cashFlow;
            },
            dscrGood: function() {
                return $scope.property.getDSCR() > $scope.criteria.dscr;
            },
            grmGood: function() {
                return $scope.property.getGRM() < $scope.criteria.grm;
            },
            ltvGood: function() {
                return $scope.property.getLTV() * 100 < $scope.criteria.ltv;
            }
        };

        $scope.greenLight = function() {
            var giveGreenLight = true;
            for( var fn in $scope.analysis ) {
                giveGreenLight &= $scope.analysis[fn]();
            }
            return giveGreenLight;
        };
    }])


    .controller('CriteriaCtrl', function($scope) {

    })

    .controller('PropertiesCtrl', ['$scope', 'PropertyService', function($scope, PropertyService) {
        $scope.selectProperty = function(project, index) {
            $scope.activeProperty = project;

            if( index == null ) {
                index = $scope.activeProperty.id;
            }

            PropertyService.setLastActiveIndex(index);
            $scope.sideMenuController.close();
        };

        $scope.addProperty = function() {
            var p = PropertyService.newProperty();
            $scope.properties = PropertyService.allProperties();
            $scope.selectProperty(PropertyService.newProperty());

            console.log("Setting path to " + '/properties/' + PropertyService.getLastActiveIndex());
            $location.path('/properties/' + PropertyService.getLastActiveIndex());
        }

    }])

    .controller('PropertyCtrl', function($scope) {

    })

    .controller('AnalysisCtrl', function($scope) {

    })



;

