type TableRow = Record<string, unknown> & {
  id?: string;
  created_at?: string;
  user_id?: string;
};

type QueryResult<T> = {
  data: T | null;
  error: Error | null;
};

type OrderOptions = {
  ascending?: boolean;
};

declare global {
  var __intervoSupabaseStore:
    | Map<string, TableRow[]>
    | undefined;
}

const store =
  globalThis.__intervoSupabaseStore ??=
    new Map<string, TableRow[]>();

function getTable(tableName: string) {
  const existing = store.get(tableName);

  if (existing) {
    return existing;
  }

  const table: TableRow[] = [];
  store.set(tableName, table);
  return table;
}

function cloneRow(row: TableRow) {
  return JSON.parse(
    JSON.stringify(row)
  ) as TableRow;
}

function toComparableValue(value: unknown) {
  if (typeof value === 'string') {
    const parsed = Date.parse(value);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  if (typeof value === 'number') {
    return value;
  }

  return String(value ?? '');
}

class TableQueryBuilder<
  ResultRow extends object = TableRow
> {
  private operation:
    | 'select'
    | 'insert' = 'select';

  private rowsToInsert: TableRow[] = [];
  private selectColumns = '*';
  private filters: Array<{
    column: string;
    value: unknown;
  }> = [];
  private orderBy:
    | {
        column: string;
        ascending: boolean;
      }
    | undefined;

  constructor(
    private readonly tableName: string
  ) {}

  insert(rows: TableRow[]) {
    this.operation = 'insert';
    this.rowsToInsert =
      rows.map((row) => cloneRow(row));
    return this;
  }

  select(columns = '*') {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(
    column: string,
    options: OrderOptions = {}
  ) {
    this.orderBy = {
      column,
      ascending: options.ascending ?? true,
    };

    return this;
  }

  execute(): Promise<
    QueryResult<ResultRow[]>
  > {
    const table = getTable(this.tableName);

    if (this.operation === 'insert') {
      const insertedRows = this.rowsToInsert.map(
        (row) => {
          const createdAt =
            typeof row.created_at === 'string'
              ? row.created_at
              : new Date().toISOString();

          const id =
            typeof row.id === 'string' &&
            row.id.length > 0
              ? row.id
              : globalThis.crypto?.randomUUID?.() ??
                `${Date.now()}-${Math.random()
                  .toString(16)
                  .slice(2)}`;

          const inserted = {
            ...cloneRow(row),
            id,
            created_at: createdAt,
          };

          table.push(cloneRow(inserted));
          return inserted;
        }
      );

      return Promise.resolve({
        data: insertedRows as ResultRow[],
        error: null,
      });
    }

    let result = table.map((row) => cloneRow(row));

    for (const filter of this.filters) {
      result = result.filter(
        (row) => row[filter.column] === filter.value
      );
    }

    if (this.orderBy) {
      const { column, ascending } = this.orderBy;

      result.sort((left, right) => {
        const leftValue = toComparableValue(
          left[column]
        );
        const rightValue = toComparableValue(
          right[column]
        );

        if (leftValue < rightValue) {
          return ascending ? -1 : 1;
        }

        if (leftValue > rightValue) {
          return ascending ? 1 : -1;
        }

        return 0;
      });
    }

    if (
      this.selectColumns !== '*' &&
      this.selectColumns.trim().length > 0
    ) {
      const requestedColumns =
        this.selectColumns
          .split(',')
          .map((column) => column.trim())
          .filter(Boolean);

      result = result.map((row) => {
        const selectedRow: TableRow = {};

        for (const column of requestedColumns) {
          selectedRow[column] = row[column];
        }

        return selectedRow;
      });
    }

    return Promise.resolve({
      data: result as ResultRow[],
      error: null,
    });
  }

}

export const supabase = {
  from<ResultRow extends object = TableRow>(
    tableName: string
  ) {
    return new TableQueryBuilder<ResultRow>(
      tableName
    );
  },
};
