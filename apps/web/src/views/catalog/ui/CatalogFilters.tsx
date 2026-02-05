'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Category } from '@/entities/category';
import { FilterModal } from '@/shared/ui/FilterModal';

interface CatalogFiltersProps {
  categories: Category[];
  selectedCategorySlugs: string[];
  selectedStorage: string[];
}

export function CatalogFilters({
  categories,
  selectedCategorySlugs,
  selectedStorage = [],
}: CatalogFiltersProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localSelectedSlugs, setLocalSelectedSlugs] = useState(selectedCategorySlugs);
  const [localSelectedStorage, setLocalSelectedStorage] = useState(selectedStorage);

  const handleCategoryToggle = (slug: string) => {
    const next = new Set(localSelectedSlugs);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setLocalSelectedSlugs(Array.from(next));
  };

  const handleStorageToggle = (value: string) => {
    const next = localSelectedStorage.includes(value)
      ? localSelectedStorage.filter((s) => s !== value)
      : [...localSelectedStorage, value];
    setLocalSelectedStorage(next);
  };

  const handleReset = () => {
    setLocalSelectedSlugs([]);
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    localSelectedSlugs.forEach((value) => params.append('category', value));
    localSelectedStorage.forEach((value) => params.append('storage', value));
    const query = params.toString();
    router.push(query ? `/catalog?${query}` : '/catalog');
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setLocalSelectedSlugs(selectedCategorySlugs);
    setLocalSelectedStorage(selectedStorage);
    setIsModalOpen(false);
  };

  const handleOpenModal = () => {
    setLocalSelectedSlugs(selectedCategorySlugs);
    setLocalSelectedStorage(selectedStorage);
    setIsModalOpen(true);
  };

  const removeCategory = (slug: string) => {
    const params = new URLSearchParams();
    selectedCategorySlugs.filter((s) => s !== slug).forEach((s) => params.append('category', s));
    selectedStorage.forEach((s) => params.append('storage', s));
    router.push(params.toString() ? `/catalog?${params.toString()}` : '/catalog');
  };

  const removeStorage = (value: string) => {
    const next = selectedStorage.filter((s) => s !== value);
    const params = new URLSearchParams();
    selectedCategorySlugs.forEach((s) => params.append('category', s));
    next.forEach((s) => params.append('storage', s));
    router.push(params.toString() ? `/catalog?${params.toString()}` : '/catalog');
  };

  const selectedCategories = selectedCategorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean) as Category[];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50"
        >
          Фильтры
          <svg className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {selectedCategories.map((cat) => (
          <span
            key={cat.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-800"
          >
            {cat.name}
            <button
              type="button"
              onClick={() => removeCategory(cat.slug)}
              className="rounded-full p-0.5 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-800"
              aria-label={`Убрать ${cat.name}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        {selectedStorage.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-800"
          >
            {value}
            <button
              type="button"
              onClick={() => removeStorage(value)}
              className="rounded-full p-0.5 text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-800"
              aria-label={`Убрать ${value}`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>

      <FilterModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onApply={handleApply}
        categories={categories}
        selectedCategorySlugs={localSelectedSlugs}
        onCategoryToggle={handleCategoryToggle}
        onReset={handleReset}
        selectedStorage={localSelectedStorage}
        onStorageToggle={handleStorageToggle}
      />
    </>
  );
}
