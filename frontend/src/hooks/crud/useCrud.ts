import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';

export interface CrudConfig<T, CreateDto, UpdateDto> {
  queryKey: string;
  getAll: () => Promise<T[]>;
  create: (dto: CreateDto) => Promise<T>;
  update: (id: string, dto: UpdateDto) => Promise<T>;
  remove?: (id: string) => Promise<void>;
  toggleStatus?: (id: string) => Promise<T>;
  queryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>;
}

export interface UseCrudResult<T, CreateDto, UpdateDto> {
  // Data
  items: T[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;

  // Search & filter
  search: string;
  setSearch: (value: string) => void;
  filteredItems: T[];

  // Modal state
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;

  // Form state
  formError: string | null;
  setFormError: (error: string | null) => void;
  resetFormError: () => void;

  // CRUD operations
  createItem: (dto: CreateDto, onSuccess?: () => void) => void;
  updateItem: (id: string, dto: UpdateDto, onSuccess?: () => void) => void;
  deleteItem: (id: string) => void;
  toggleItemStatus: (id: string) => void;

  // Operation states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isToggling: boolean;
}

/**
 * Generic CRUD hook that handles data fetching, mutations, search, and form state.
 * Eliminates duplication across CRUD pages.
 */
export function useCrud<T extends { id: string }, CreateDto, UpdateDto>(
  config: CrudConfig<T, CreateDto, UpdateDto>,
): UseCrudResult<T, CreateDto, UpdateDto> {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const resetFormError = useCallback(() => setFormError(null), []);

  // Query
  const {
    data: items = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [config.queryKey],
    queryFn: config.getAll,
    ...config.queryOptions,
  });

  // Search filter
  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const term = search.toLowerCase();
    return items.filter((item) => {
      const searchable = Object.values(item).join(' ').toLowerCase();
      return searchable.includes(term);
    });
  }, [items, search]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: config.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Error al crear');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDto }) => config.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Error al actualizar');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => config.remove!(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Error al eliminar');
    },
  });

  // Toggle mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => config.toggleStatus!(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [config.queryKey] });
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Error al cambiar estado');
    },
  });

  const createItem = useCallback(
    (dto: CreateDto, onSuccess?: () => void) => {
      createMutation.mutate(dto, { onSuccess });
    },
    [createMutation],
  );

  const updateItem = useCallback(
    (id: string, dto: UpdateDto, onSuccess?: () => void) => {
      updateMutation.mutate({ id, dto }, { onSuccess });
    },
    [updateMutation],
  );

  const deleteItem = useCallback(
    (id: string) => {
      if (config.remove) deleteMutation.mutate(id);
    },
    [deleteMutation, config.remove],
  );

  const toggleItemStatus = useCallback(
    (id: string) => {
      if (config.toggleStatus) toggleMutation.mutate(id);
    },
    [toggleMutation, config.toggleStatus],
  );

  return {
    items,
    isLoading,
    isError,
    error,
    search,
    setSearch,
    filteredItems,
    modalOpen,
    setModalOpen,
    editingId,
    setEditingId,
    formError,
    setFormError,
    resetFormError,
    createItem,
    updateItem,
    deleteItem,
    toggleItemStatus,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleMutation.isPending,
  };
}
