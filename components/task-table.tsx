"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline: string | null;
  reminder: string | null;
  created_at: string;
  category_id?: string | null;
  updated_at?: string;
  categories?: {
    id: string;
    name: string;
  } | null;
}

interface TaskTableProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onAddTask?: () => void;
  isUpdating?: string | null;
}

interface FilterState {
  category: string[];
  deadline: string;
  completed: string;
}

interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

interface ColumnWidths {
  [key: string]: number;
}

export function TaskTable({ tasks, onTaskUpdate, onTaskEdit, onTaskDelete, onAddTask, isUpdating }: TaskTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    deadline: 'all',
    completed: 'all'
  });
  
  const [sortState, setSortState] = useState<SortState>({
    column: 'created_at',
    direction: 'desc'
  });
  
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    title: 200,
    description: 300,
    category: 150,
    deadline: 150,
    completed: 100,
    actions: 100
  });
  
  const [showFilterDropdown, setShowFilterDropdown] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const tableRef = useRef<HTMLTableElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  
  // Get unique categories for filtering
  const uniqueCategories = useMemo(() => {
    const categories = tasks
      .map(task => task.categories?.name)
      .filter((category): category is string => category !== null && category !== undefined);
    return Array.from(new Set(categories)).sort();
  }, [tasks]);
  
  // Apply filters and sorting
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Category filter
      if (filters.category.length > 0) {
        const taskCategory = task.categories?.name || 'Uncategorized';
        if (!filters.category.includes(taskCategory)) {
          return false;
        }
      }
      
      // Deadline filter
      if (filters.deadline !== 'all') {
        const today = currentTime; // Use currentTime state
        const taskDeadline = task.deadline ? new Date(task.deadline) : null;
        
        switch (filters.deadline) {
          case 'overdue':
            if (!taskDeadline || taskDeadline >= today) return false;
            break;
          case 'today':
            if (!taskDeadline || taskDeadline.toDateString() !== today.toDateString()) return false;
            break;
          case 'upcoming':
            if (!taskDeadline || taskDeadline <= today) return false;
            break;
          case 'no-deadline':
            if (taskDeadline) return false;
            break;
        }
      }
      
      // Completed filter
      if (filters.completed !== 'all') {
        const isCompleted = task.completed;
        if (filters.completed === 'completed' && !isCompleted) return false;
        if (filters.completed === 'pending' && isCompleted) return false;
      }
      
      return true;
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortState.column as keyof Task];
      let bValue: any = b[sortState.column as keyof Task];
      
      // Handle special cases
      if (sortState.column === 'category') {
        aValue = a.categories?.name || 'Uncategorized';
        bValue = b.categories?.name || 'Uncategorized';
      }
      
      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [tasks, filters, sortState, currentTime]); // Add currentTime to dependencies to force re-computation
  
  // Update current time every minute to refresh deadline colors
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle column sorting
  const handleSort = (column: string) => {
    setSortState(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  // Handle filter changes
  const handleFilterChange = (filterType: keyof FilterState, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };
  
  // Handle category filter toggle
  const toggleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }));
  };
  
  // Handle column resizing
  const handleMouseDown = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    setIsResizing(column);
    setStartX(e.clientX);
    setStartWidth(columnWidths[column]);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff);
      setColumnWidths(prev => ({
        ...prev,
        [isResizing]: newWidth
      }));
    }
  };
  
  const handleMouseUp = () => {
    setIsResizing(null);
  };
  
  // Add event listeners for column resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, startX, startWidth]);
  
  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle task completion toggle
  const handleToggleComplete = async (taskId: string, currentStatus: boolean) => {
    if (onTaskUpdate) {
      onTaskUpdate(taskId, { completed: !currentStatus });
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    
    // Format date part
    const dateFormatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Format time part
    const timeFormatted = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${dateFormatted} at ${timeFormatted}`;
  };
  
  // Get deadline status for styling
  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return 'none';
    const today = currentTime; // Use currentTime state instead of new Date()
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays <= 3) return 'soon';
    return 'future';
  };
  
  const getDeadlineColor = (status: string) => {
    switch (status) {
      case 'overdue': return 'deadline-overdue';
      case 'today': return 'deadline-today';
      case 'soon': return 'deadline-soon';
      case 'future': return 'deadline-future';
      default: return 'text-gray-500';
    }
  };
  
  const clearAllFilters = () => {
    setFilters({
      category: [],
      deadline: 'all',
      completed: 'all'
    });
  };
  
  const hasActiveFilters = filters.category.length > 0 || filters.deadline !== 'all' || filters.completed !== 'all';
  
  return (
    <div className="w-full">
      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">Active Filters:</span>
              <div className="flex gap-2">
                {filters.category.map(cat => (
                  <span key={cat} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {cat}
                  </span>
                ))}
                {filters.deadline !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {filters.deadline}
                  </span>
                )}
                {filters.completed !== 'all' && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                    {filters.completed}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
      
      {/* Table Container */}
      <div className="task-table-container overflow-x-auto overflow-y-visible rounded-lg" style={{ minHeight: '250px' }}>
        <table
          ref={tableRef}
          className="task-table w-full border-collapse bg-transparent relative "
          style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) }}
        >
          <thead className="transition-colors duration-500">
            <tr>
              {/* Title Column */}
              <th
                style={{ width: columnWidths.title }}
                className="relative transition-colors duration-500 text-left"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Title
                    {sortState.column === 'title' && (
                      sortState.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div
                  className="column-resize-handle absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-200 dark:hover:bg-blue-600"
                  onMouseDown={(e) => handleMouseDown(e, 'title')}
                />
              </th>
              
              {/* Description Column */}
              <th
                style={{ width: columnWidths.description }}
                className="relative transition-colors duration-500 text-left"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => handleSort('description')}
                    className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Description
                    {sortState.column === 'description' && (
                      sortState.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div
                  className="column-resize-handle absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-200 dark:hover:bg-blue-600"
                  onMouseDown={(e) => handleMouseDown(e, 'description')}
                />
              </th>
              
              {/* Category Column */}
              <th
                style={{ width: columnWidths.category }}
                className="relative transition-colors duration-500 text-left"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => handleSort('category')}
                    className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Category
                    {sortState.column === 'category' && (
                      sortState.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowFilterDropdown(showFilterDropdown === 'category' ? null : 'category')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                {showFilterDropdown === 'category' && (
                  <div
                    ref={filterDropdownRef}
                    className="absolute top-full left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-48"
                    style={{ position: 'absolute', top: 'calc(100% + 2px)', left: '0', zIndex: 1000 }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="uncategorized"
                          checked={filters.category.includes('Uncategorized')}
                          onChange={() => toggleCategoryFilter('Uncategorized')}
                          className="mr-2"
                        />
                        <label htmlFor="uncategorized" className="text-sm">Uncategorized</label>
                      </div>
                      {uniqueCategories.map(category => (
                        <div key={category} className="flex items-center">
                          <input
                            type="checkbox"
                            id={category}
                            checked={filters.category.includes(category)}
                            onChange={() => toggleCategoryFilter(category)}
                            className="mr-2"
                          />
                          <label htmlFor={category} className="text-sm">{category}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  className="column-resize-handle absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-200 dark:hover:bg-blue-600 hover:mb-1 hover:shadow-md transition-all"
                  onMouseDown={(e) => handleMouseDown(e, 'category')}
                />
              </th>
              
              {/* Deadline Column */}
              <th
                style={{ width: columnWidths.deadline }}
                className="relative transition-colors duration-500 text-left"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => handleSort('deadline')}
                    className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Deadline
                    {sortState.column === 'deadline' && (
                      sortState.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowFilterDropdown(showFilterDropdown === 'deadline' ? null : 'deadline')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                {showFilterDropdown === 'deadline' && (
                  <div
                    ref={filterDropdownRef}
                    className="absolute top-full left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-48"
                    style={{ position: 'absolute', top: 'calc(100% + 2px)', left: '0', zIndex: 1000 }}
                  >
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All' },
                        { value: 'overdue', label: 'Overdue' },
                        { value: 'today', label: 'Due Today' },
                        { value: 'upcoming', label: 'Upcoming' },
                        { value: 'no-deadline', label: 'No Deadline' }
                      ].map(option => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={option.value}
                            name="deadline-filter"
                            checked={filters.deadline === option.value}
                            onChange={() => handleFilterChange('deadline', option.value)}
                            className="mr-2"
                          />
                          <label htmlFor={option.value} className="text-sm">{option.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  className="column-resize-handle absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-200 dark:hover:bg-blue-600"
                  onMouseDown={(e) => handleMouseDown(e, 'deadline')}
                />
              </th>
              
              {/* Completed Column */}
              <th
                style={{ width: columnWidths.completed }}
                className="relative transition-colors duration-500 text-left"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <button
                    onClick={() => handleSort('completed')}
                    className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Status
                    {sortState.column === 'completed' && (
                      sortState.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowFilterDropdown(showFilterDropdown === 'completed' ? null : 'completed')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    aria-expanded={showFilterDropdown === 'completed'}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
                {showFilterDropdown === 'completed' && (
                  <div
                    ref={filterDropdownRef}
                    className="absolute top-full left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 min-w-48"
                    style={{ position: 'absolute', top: 'calc(100% + 2px)', left: '0', zIndex: 1000 }}
                  >
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'pending', label: 'Pending' }
                      ].map(option => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={option.value}
                            name="completed-filter"
                            checked={filters.completed === option.value}
                            onChange={() => handleFilterChange('completed', option.value)}
                            className="mr-2"
                          />
                          <label htmlFor={option.value} className="text-sm">{option.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div
                  className="column-resize-handle absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-200 dark:hover:bg-blue-600"
                  onMouseDown={(e) => handleMouseDown(e, 'completed')}
                />
              </th>
              
              {/* Actions Column */}
              <th
                style={{ width: columnWidths.actions }}
                className="relative transition-colors duration-500 text-left"
              >
                <div className="px-4 py-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          
          <tbody>
            {filteredAndSortedTasks.length > 0 ? (
              filteredAndSortedTasks.map((task, index) => {
                const deadlineStatus = getDeadlineStatus(task.deadline);
                return (
                  <tr
                    key={task.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-500`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={task.title}>
                        {task.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-600 dark:text-gray-400 truncate" title={task.description}>
                        {task.description || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                        {task.categories?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`status-badge ${getDeadlineColor(deadlineStatus)}`}>
                        {formatDate(task.deadline)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleComplete(task.id, task.completed)}
                        disabled={isUpdating === task.id}
                        className={`status-badge disabled:opacity-50 hover:opacity-80 transition-opacity ${
                          task.completed
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800'
                        }`}
                        title={`Click to mark as ${task.completed ? 'pending' : 'completed'}`}
                      >
                        {isUpdating === task.id ? 'Updating...' : (task.completed ? 'Completed' : 'Pending')}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onTaskEdit && onTaskEdit(task)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onTaskDelete && onTaskDelete(task.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? 'No tasks match your filters' : 'No tasks found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Results Summary */}
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
      </div>
      
      {/* Floating Add Button */}
      <button
        onClick={() => onAddTask && onAddTask()}
        className="fixed bottom-8 right-8 bg-Jeeny hover:bg-Jeeny/70 text-white rounded-full p-4 shadow-lg transition-colors duration-200 z-50"
        title="Add new task"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
