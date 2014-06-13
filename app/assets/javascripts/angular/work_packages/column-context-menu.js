//-- copyright
// OpenProject is a project management system.
// Copyright (C) 2012-2014 the OpenProject Foundation (OPF)
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See doc/COPYRIGHT.rdoc for more details.
//++

angular.module('openproject.workPackages')

.factory('ColumnContextMenu', [
  'ngContextMenu',
  function(ngContextMenu) {

  return ngContextMenu({
    controller: 'ColumnContextMenuController',
    controllerAs: 'contextMenu',
    templateUrl: '/templates/work_packages/column_context_menu.html',
    container: '.work-packages--list'
  });
}])

.controller('ColumnContextMenuController', [
  '$scope',
  'ColumnContextMenu',
  'I18n',
  'QueryService',
  'WorkPackagesTableHelper',
  'WorkPackagesTableService',
  'columnsModal',
  function($scope, ColumnContextMenu, I18n, QueryService, WorkPackagesTableHelper, WorkPackagesTableService, columnsModal) {

    $scope.I18n = I18n;

    $scope.$watch('column', function() {
      // fall back to 'id' column as the default
      $scope.column = $scope.column || { name: 'id', sortable: true };
      $scope.isGroupable = WorkPackagesTableService.isGroupable($scope.column);
    });


    // context menu actions

    $scope.groupBy = function(columnName) {
      QueryService.getQuery().groupBy = columnName;
    };

    $scope.sortAscending = function(columnName) {
      WorkPackagesTableService.sortBy(columnName || 'id', 'asc');
    };

    $scope.sortDescending = function(columnName) {
      WorkPackagesTableService.sortBy(columnName || 'id', 'desc');
    };

    $scope.moveLeft = function(columnName) {
      WorkPackagesTableHelper.moveColumnBy($scope.columns, columnName, -1);
    };

    $scope.moveRight = function(columnName) {
      WorkPackagesTableHelper.moveColumnBy($scope.columns, columnName, 1);
    };

    $scope.hideColumn = function(columnName) {
      ColumnContextMenu.close();
      QueryService.hideColumns(new Array(columnName));
    };

    $scope.insertColumns = function() {
      columnsModal.activate();
    };
}]);
