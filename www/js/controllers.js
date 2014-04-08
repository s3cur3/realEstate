angular.module('RealEstateApp.controllers', [])

    .controller('AppCtrl', function ($scope) {
        // Set up default data
        $scope.property = {
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
        };

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
/*
        $scope.positiveOrNegativeIconClass = function( analysisFnToRun ) {
            if( analysisFnToRun() ) {
                return 'ion-close-circled assertive';
            }
            return 'ion-checkmark-circled positive';
        };*/
        $scope.greenLight = function() {
            var giveGreenLight = true;
            for( var fn in $scope.analysis ) {
                giveGreenLight &= $scope.analysis[fn]();
            }
            return giveGreenLight;
        };
    })

    .controller('PlaylistsCtrl', function ($scope) {
        $scope.playlists = [
            { title: 'Reggae', id: 1 },
            { title: 'Chill', id: 2 },
            { title: 'Dubstep', id: 3 },
            { title: 'Indie', id: 4 },
            { title: 'Rap', id: 5 },
            { title: 'Cowbell', id: 6 }
        ];
    })

    .controller('PlaylistCtrl', function ($scope, $stateParams) {
    })


    .controller('CriteriaCtrl', function($scope) {

    })

    .controller('PropertyCtrl', function($scope) {

    })

    .controller('AnalysisCtrl', function($scope) {

    })



;