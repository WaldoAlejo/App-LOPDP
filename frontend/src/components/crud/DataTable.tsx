import { Pencil, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render?: (item: T) => React.ReactNode;
  cellClassName?: string;
}

interface DataTableProps<T extends { id: string }> {
  data?: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onToggle?: (item: T) => void;
  getItemStatus?: (item: T) => boolean;
  isToggling?: boolean;
  actions?: ('edit' | 'delete' | 'toggle')[];
}

/**
 * Generic data table component with CRUD actions.
 * Replaces duplicated table implementations across pages.
 */
export function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No hay registros',
  onEdit,
  onDelete,
  onToggle,
  getItemStatus,
  isToggling,
  actions = ['edit', 'delete', 'toggle'],
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#C41E3A]" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx('text-left py-3 px-4 font-semibold text-gray-700', col.width)}
              >
                {col.header}
              </th>
            ))}
            {(onEdit || onDelete || onToggle) && (
              <th className="text-right py-3 px-4 font-semibold text-gray-700 w-32">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {(data || []).map((item) => (
            <tr
              key={item.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={clsx('py-3 px-4 text-gray-800', col.cellClassName)}
                >
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
              {(onEdit || onDelete || onToggle) && (
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {actions.includes('toggle') && onToggle && getItemStatus && (
                      <button
                        onClick={() => onToggle(item)}
                        disabled={isToggling}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title={getItemStatus(item) ? 'Desactivar' : 'Activar'}
                      >
                        {getItemStatus(item) ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    )}
                    {actions.includes('edit') && onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </button>
                    )}
                    {actions.includes('delete') && onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
