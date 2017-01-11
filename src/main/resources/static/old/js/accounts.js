angular.module('accounts', ['ui.directives']).
    config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        //$locationProvider.html5Mode(true);
        $routeProvider.
            when('/accounts/:accountId', {controller: 'AccountDetailsController', templateUrl: 'templates/accounts/account-details.html'}).
            when('/accounts/:accountId/entries', {controller: 'EntryController', templateUrl: 'templates/accounts/entries.html'}).
            when('/accounts/:accountId/entries/new', {controller: 'EntryDetailsController', templateUrl: 'templates/accounts/entry-details.html'}).
            when('/accounts/:accountId/entries/:entryId', {controller: 'EntryDetailsController', templateUrl: 'templates/accounts/entry-details.html'}).
            otherwise({redirectTo: '/accounts'});
    }]);

function parseDate(dateString) {
    if (dateString == undefined || dateString == null) {
        return dateString;
    } else {
        return new Date(dateString);
    }
}

function AccountController($scope, $http, $routeParams, $rootScope) {
    var load = function () {
        $scope.loadingAccounts = true;
        $http.get('/rest/accounts')
            .success(function (data) {
                $scope.accounts = data;
                $scope.loadingAccounts = false;
            }).error(function (data) {
                $scope.error = true;
                $scope.loadingAccounts = false;
            });
    }

    load();

    $rootScope.$on('account', function (event) {
        load();
    })

    $scope.$routeParams = $routeParams;
}

function AccountDetailsController($scope, $http, $routeParams, $location, $rootScope) {
    if ($routeParams.accountId) {
        $http.get('/rest/accounts/' + $routeParams.accountId).success(function (data) {
            $scope.account = data;
            $scope.account.startBalance100 = data.startBalance / 100;
            $scope.account.minBalance100 = data.minBalance / 100;
        });
    }

    $scope.save = function () {
        $scope.account.startBalance = $scope.account.startBalance100 * 100;
        $scope.account.minBalance = $scope.account.startBalance100 * 100;
        if ($scope.account.id != null) {
            $http.put('/rest/accounts/' + $routeParams.accountId, $scope.account).success(function (data) {
                $rootScope.$broadcast('account');
                $location.path('/accounts/' + $routeParams.accountId + '/entries');
            });
        } else {
            $http.post('/rest/accounts', $scope.account).success(function (data) {
                $rootScope.$broadcast('account');
                $location.path('/accounts/' + data + '/entries');
            });
        }
    }

    $scope.delete = function () {
        var answer = confirm('Konto wirklich löschen?');
        if (!answer) {
            return;
        }

        if ($routeParams.accountId) {
            $http.delete('/rest/accounts/' + $routeParams.accountId).success(function (data) {
                $rootScope.$broadcast('account');
                $location.path('/accounts');
            });
        }
    }
}

function EntryController($scope, $http, $routeParams, $filter, $location) {
    $scope.load = function () {
        $scope.accountId = $routeParams.accountId;

        $scope.page = parseInt($routeParams.page);
        if (!$scope.page) {
            $scope.page = 1;
        }

        $http.get('/rest/accounts/' + $routeParams.accountId + '/entries/count').success(function (data) {
            $scope.entryCount = parseInt(data);
            $scope.maxPage = Math.ceil($scope.entryCount / 10);
        });

        $scope.loading = true;
        $http.get('/rest/accounts/' + $routeParams.accountId + '/entries', {params: {page: $scope.page, filter: $scope.filter}})
            .success(function (data) {
                $scope.entries = data;
                $scope.loading = false;
            }).error(function (data) {
                $scope.loading = false;
            });
    }

    $scope.filter = $routeParams.filter;
    $scope.load();

    $scope.getStatusText = function (status) {
        if (status === "RECONCILING") {
            return "A";
        } else if (status === "CLEARED") {
            return "V";
        } else {
            return null;
        }
    }

    $scope.prevPage = function () {
        return Math.max($scope.page - 1, 1);
    }

    $scope.nextPage = function () {
        return Math.min($scope.page + 1, $scope.maxPage);
    }

}

function EntryDetailsController($scope, $http, $routeParams, $filter, $location) {
    $scope.entryStates = [
        {id: "RECONCILING", label: "Abgestimmt"},
        {id: "CLEARED", label: "Verrechnet"}
    ];

    $scope.updateSubEntryTotal = function () {
        $scope.subEntryTotal = 0;
        for (var i = 0; i < $scope.entry.subEntries.length; i++) {
            var subEntry = $scope.entry.subEntries[i];
            $scope.subEntryTotal += subEntry.amount;
        }
    }

    $scope.initAmount = function (entry) {
        if (entry.amount >= 0) {
            entry.income = entry.amount / 100;
        } else {
            entry.expense = -entry.amount / 100;
        }
    }

    $scope.initSubEntries = function () {
        if (!$scope.entry.subEntries) {
            $scope.entry.subEntries = [];
        }

        for (var i = 0; i < $scope.entry.subEntries.length; i++) {
            var subEntry = $scope.entry.subEntries[i];
            $scope.initAmount(subEntry);
            subEntry.categoryId += '';
        }

        $scope.updateSubEntryTotal();
    }

    $scope.load = function () {
        $scope.accountId = $routeParams.accountId;

        $http.get('/rest/accounts/' + $routeParams.accountId + '/entries', {params: {page: $scope.page, filter: $scope.filter}})
            .success(function (data) {
                $scope.entries = data;

            }).error(function (data) {

            });

        $scope.entry = {};
        $scope.entry.subEntries = [];

        $scope.loading = true;
        if ($routeParams.entryId) {
            $http.get('/rest/accounts/' + $routeParams.accountId + '/entries/' + $routeParams.entryId)
                .success(function (data) {
                    $scope.entry = data;
                    $scope.initAmount($scope.entry);
                    $scope.entry.categoryId += ''; // numbers don't work for select options, probably a bug
                    $scope.entry.date = parseDate($scope.entry.date);
                    $scope.entry.valuta = parseDate($scope.entry.valuta);
                    $scope.initSubEntries();

                    $scope.loading = false;
                }).error(function (data) {
                    $scope.loading = false;
                });
        }

    }

    $scope.load();

    $http.get('/rest/categories').success(function (data) {
        $scope.categories = data;
    });

    $http.get('/rest/split-category').success(function (data) {
        $scope.splitCategory = data;
    });


    $scope.save = function () {
        if ($scope.entry.id) {
            $http.put('/rest/accounts/' + $routeParams.accountId + '/entries/' + $scope.entry.id, $scope.entry)
                .success(function (data) {
                    $location.path('/accounts/' + $routeParams.accountId + '/entries')
                });
        } else {
            $http.post('/rest/accounts/' + $routeParams.accountId + '/entries', $scope.entry)
                .success(function (data) {
                    $location.path('/accounts/' + $routeParams.accountId + '/entries');
                });
        }
    }

    $scope.delete = function () {
        if ($routeParams.accountId) {
            $http.delete('/rest/accounts/' + $routeParams.accountId + '/entries/' + $scope.entry.id)
                .success(function (data) {
                    $location.path('/accounts/' + $routeParams.accountId + '/entries');
                });
        }
    }

    $scope.updateIncome = function (entry) {
        $scope.updateAmount(entry);
        if (entry.income != null) {
            entry.amount = entry.income * 100;
            entry.expense = null;
        }
    }

    $scope.updateExpense = function (entry) {
        $scope.updateAmount(entry);
        if (entry.expense != null) {
            entry.amount = -entry.expense * 100;
            entry.income = null;
        }
    }

    $scope.updateAmount = function (entry) {
        if (entry.income == null && entry.expense == null) {
            entry.amount = null;
        }
    }

    $scope.addSubEntry = function () {
        $scope.entry.subEntries.push({description: '', categoryId: null, amount: 0});
    }

    $scope.removeSubEntry = function (subEntry) {
        var index = $scope.entry.subEntries.indexOf(subEntry);
        $scope.entry.subEntries.splice(index, 1);
    }

    $scope.updateSubEntryIncome = function (entry) {
        $scope.updateIncome(entry);
        $scope.updateSubEntryTotal();
    }

    $scope.updateSubEntryExpense = function (entry) {
        $scope.updateExpense(entry);
        $scope.updateSubEntryTotal();
    }

}
