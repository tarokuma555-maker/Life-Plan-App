'use client';

import React, { useState, useMemo } from 'react';
import { MajorCategory, MAJOR_CATEGORIES, LifeEvent, RecurringExpense } from '@/types';
import { ALL_PRESETS, PresetItem, getPresetsByMajorCategory } from '@/data/presets';

interface PresetPickerProps {
  selectedCategory: MajorCategory | null;
  onAddLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  onAddRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
  personId: string;
}

export default function PresetPicker({
  selectedCategory,
  onAddLifeEvent,
  onAddRecurringExpense,
  personId,
}: PresetPickerProps) {
  const [search, setSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<MajorCategory | null>(selectedCategory);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    return Object.entries(MAJOR_CATEGORIES)
      .sort(([, a], [, b]) => a.number - b.number)
      .map(([key, val]) => ({
        key: key as MajorCategory,
        ...val,
        presets: getPresetsByMajorCategory(key as MajorCategory),
      }));
  }, []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        presets: cat.presets.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            cat.label.includes(q)
        ),
      }))
      .filter((cat) => cat.presets.length > 0);
  }, [categories, search]);

  const handleAdd = (preset: PresetItem) => {
    if (!personId) return;

    if (preset.type === 'life_event') {
      onAddLifeEvent({
        personId,
        age: preset.defaultAge || 30,
        title: preset.name,
        cost: Math.abs(preset.defaultCost),
        category: preset.eventCategory || 'other',
        majorCategory: preset.majorCategory,
        isExpense: preset.isExpense,
      });
    } else {
      onAddRecurringExpense({
        personId,
        name: preset.name,
        startAge: preset.defaultStartAge || 22,
        endAge: preset.defaultEndAge || 65,
        annualCost: Math.abs(preset.defaultCost),
        category: preset.expenseCategory || 'other',
        majorCategory: preset.majorCategory,
      });
    }

    setAddedIds((prev) => new Set([...prev, preset.id]));
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <input
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="プリセットを検索..."
      />

      {/* Category list */}
      <div className="space-y-1 max-h-[calc(100vh-340px)] overflow-y-auto">
        {filteredCategories.map((cat) => {
          const isExpanded = expandedCategory === cat.key;

          return (
            <div key={cat.key} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : cat.key)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                  isExpanded ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700 flex-1">
                  {cat.number}. {cat.label}
                </span>
                <span className="text-xs text-gray-400">{cat.presets.length}件</span>
                <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
              </button>

              {isExpanded && (
                <div className="border-t bg-gray-50 p-2 space-y-1">
                  {cat.presets.length === 0 ? (
                    <div className="text-xs text-gray-400 py-2 text-center">
                      このカテゴリにはプリセットがありません
                    </div>
                  ) : (
                    cat.presets.map((preset) => {
                      const isAdded = addedIds.has(preset.id);
                      return (
                        <div
                          key={preset.id}
                          className={`flex items-center gap-2 rounded px-2 py-1.5 ${
                            isAdded ? 'bg-green-50' : 'bg-white'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-700 truncate">
                              {preset.name}
                            </div>
                            <div className="text-xs text-gray-400 truncate">
                              {preset.description}
                              {preset.defaultCost > 0 && (
                                <span className="ml-1 text-gray-500">
                                  ({preset.isExpense ? '-' : '+'}{preset.defaultCost}万
                                  {preset.type === 'recurring_expense' ? '/年' : ''})
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAdd(preset)}
                            disabled={isAdded}
                            className={`text-xs px-2 py-1 rounded transition-colors whitespace-nowrap ${
                              isAdded
                                ? 'bg-green-200 text-green-700'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {isAdded ? '追加済' : '追加'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
