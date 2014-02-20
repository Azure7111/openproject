angular.module('openproject.workPackages.directives')

.directive('queryColumns', ['WorkPackagesTableHelper', 'WorkPackageService', function(WorkPackagesTableHelper, WorkPackageService) {

  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/templates/work_packages/query_columns.html',
    compile: function(tElement) {
      return {
        pre: function(scope) {
          scope.moveColumns = function (columnNames, fromColumns, toColumns) {
            angular.forEach(columnNames, function(columnName){
              removeColumn(columnName, fromColumns, function(removedColumn){
                toColumns.push(removedColumn);
              });
            });

            extendRowsWithColumnData(columnNames);
          };

          scope.moveSelectedColumnBy = function(by) {
            var nameOfColumnToBeMoved = scope.markedSelectedColumns.first();
            WorkPackagesTableHelper.moveColumnBy(scope.columns, nameOfColumnToBeMoved, by);
          };

          function extendRowsWithColumnData(columnNames) {
            var workPackages = scope.rows.map(function(row) {
              return row.object;
            });
            var newColumns = WorkPackagesTableHelper.selectColumnsByName(scope.columns, columnNames);

            // work package rows
            scope.withLoading(WorkPackageService.augmentWorkPackagesWithColumnsData, [workPackages, newColumns]);
          }

          function removeColumn(columnName, columns, callback) {
            var removed = columns.splice(WorkPackagesTableHelper.getColumnIndexByName(columns, columnName), 1).first();
            return !(typeof(callback) === 'undefined') ? callback.call(this, removed) : null;
          }

          function getColumnIndexes(columnNames, columns) {
            return columnNames
              .map(function(name) {
                return WorkPackagesTableHelper.getColumnIndexByName(columns, name);
              })
              .filter(function(columnIndex){
                return columnIndex !== -1;
              });
          }

        }
      };
    }
  };
}]);
