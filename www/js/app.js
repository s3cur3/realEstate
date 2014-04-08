// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'RealEstateApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'RealEstateApp.controllers' is found in controllers.js
angular.module('RealEstateApp', ['ionic', 'RealEstateApp.controllers', 'percent'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

// Define our routes
    .config(function ($stateProvider, $urlRouterProvider) {
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

            .state('app.property', {
                url: "/property",
                views: {
                    'menuContent': {
                        templateUrl: "templates/property.html",
                        controller: 'PropertyCtrl'
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

            .state('app.playlists', {
                url: "/playlists",
                views: {
                    'menuContent': {
                        templateUrl: "templates/playlists.html",
                        controller: 'PlaylistsCtrl'
                    }
                }
            })

            .state('app.single', {
                url: "/playlists/:playlistId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/playlist.html",
                        controller: 'PlaylistCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/criteria');
    });


angular.module('percent', [])
    .filter('percent', function () {
        return function( input ) {
            var rounded = Math.round(input*10000)/100;
            if( isNaN(rounded) ) {
                return '';
            }
            return '' + rounded + '%';
        };
    });
