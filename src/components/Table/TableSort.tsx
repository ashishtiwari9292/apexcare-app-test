import { useEffect, useState } from 'react';

interface TableSortProps {
  sort: (sortVal: string, type: string, ascending: boolean) => void;
  column: string;
  sortVal: string;
  isAscending: boolean;
}

export function TableSort({ sort, column, sortVal, isAscending }: TableSortProps): JSX.Element {
  const [ascending, setAscending] = useState(false);
  const [descending, setDescending] = useState(false);

  useEffect(() => {
    setAscending(sortVal === column && isAscending === true);
    setDescending(sortVal === column && isAscending === false);
  }, [sortVal, isAscending]);

  return (
    <div className="table-sort-container">
      <div
        style={{ color: ascending ? 'black' : 'grey' }}
        className="hover"
        onClick={() => {
          setAscending(!ascending);
          setDescending(false);

          sort(
            column,
            column === 'Date' ||
              column === 'Created' ||
              column === 'Date Due' ||
              column === 'Follow-Up-Date' ||
              column === 'Last Activity' ||
              column === 'Active Date' || 
              column === 'Date Created'||
              column ==='Due Date'||
              column === 'Follow-Up Date'||
              column === 'Date Created'||
              column === 'Date Completed'||
              column === 'Inquiry Date'||
              column === 'Inactive Date'||
              column === 'Active Date'
              ? 'date'
              : 'alphabetical',
            true,
          );
        }}
      >
        ▲
      </div>
      <div
        style={{ color: descending ? 'black' : 'grey' }}
        className="hover"
        onClick={(e) => {
          setDescending(!descending);
          setAscending(false);
          sort(
            column,
            column === 'Date' ||
              column === 'Created' ||
              column === 'Date Due' ||
              column === 'Follow-Up-Date' ||
              column === 'Last Activity' ||
              column === 'Active Date'||
              column === 'Date Created'||
              column ==='Due Date'||
              column === 'Follow-Up Date'||
              column === 'Date Created'||
              column === 'Date Completed'||
              column === 'Inquiry Date'||
              column === 'Inactive Date'||
              column === 'Active Date'
              ? 'date'
              : 'alphabetical',
            false,
          );
        }}
      >
        ▼
      </div>
    </div>
  );
}
