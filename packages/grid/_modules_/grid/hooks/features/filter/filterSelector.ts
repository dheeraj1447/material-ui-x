import { createSelector } from 'reselect';
import { FilterItem } from '../../../models/filterItem';
import { RowModel } from '../../../models/rows';
import { GridState } from '../core/gridState';
import { rowCountSelector } from '../rows/rowsSelector';
import { sortedRowsSelector } from '../sorting/sortingSelector';
import { FilterModelState } from './FilterModelState';
import { VisibleRowsState } from './visibleRowsState';

export const visibleRowsStateSelector = (state: GridState) => state.visibleRows;

export const visibleSortedRowsSelector = createSelector<
  GridState,
  VisibleRowsState,
  RowModel[],
  RowModel[]
>(visibleRowsStateSelector, sortedRowsSelector, (visibleRowsState, sortedRows: RowModel[]) => {
  return [...sortedRows].filter((row) => visibleRowsState.visibleRowsLookup[row.id] !== false);
});

export const visibleRowCountSelector = createSelector<GridState, VisibleRowsState, number, number>(
  visibleRowsStateSelector,
  rowCountSelector,
  (visibleRowsState, totalRowsCount) => {
    if (visibleRowsState.visibleRows == null) {
      return totalRowsCount;
    }
    return visibleRowsState.visibleRows.length;
  },
);

export const filterStateSelector: (state: GridState) => FilterModelState = (state) => state.filter;

export const activeFilterItemsSelector = createSelector<GridState, FilterModelState, FilterItem[]>(
  filterStateSelector,
  (filterModel) =>
    filterModel.items?.filter((item) => item.value != null && item.value?.toString() !== ''), // allows to count false or 0
);

export const filterItemsCounterSelector = createSelector<GridState, FilterItem[], number>(
  activeFilterItemsSelector,
  (activeFilters) => activeFilters.length,
);

export type FilterColumnLookup = Record<string, FilterItem[]>;
export const filterColumnLookupSelector = createSelector<
  GridState,
  FilterItem[],
  FilterColumnLookup
>(activeFilterItemsSelector, (activeFilters) => {
  const result: FilterColumnLookup = activeFilters.reduce((res, filterItem) => {
    if (!res[filterItem.columnField!]) {
      res[filterItem.columnField!] = [filterItem];
    } else {
      res[filterItem.columnField!].push(filterItem);
    }
    return res;
  }, {} as FilterColumnLookup);

  return result;
});
