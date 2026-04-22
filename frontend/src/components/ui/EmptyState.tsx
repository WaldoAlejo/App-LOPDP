import { PackageOpen, Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'empty' | 'search';
}

export function EmptyState({
  title = 'No hay datos',
  description = 'Aún no se han registrado elementos en esta sección.',
  icon = 'empty',
}: EmptyStateProps) {
  const Icon = icon === 'search' ? Search : PackageOpen;
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-white py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 text-gray-400">
        <Icon size={32} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
    </div>
  );
}
