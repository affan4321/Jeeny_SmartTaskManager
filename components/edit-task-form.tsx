"use client";

import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation"; // Commented out as not currently used
import { createClient } from "@/lib/supabase/client";

interface Task {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  categories?: {
    id: string;
    name: string;
  } | null;
  completed: boolean;
  deadline: string | null;
  reminder: string | null; // Changed from reminder_minutes_before
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface EditTaskFormProps {
  task: Task;
  onClose: () => void;
}

export function EditTaskForm({ task, onClose }: EditTaskFormProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [category, setCategory] = useState(task.categories?.name || "");
  const [completed, setCompleted] = useState(task.completed);
  const [deadline, setDeadline] = useState(() => {
    if (task.deadline) {
      const date = new Date(task.deadline);
      // Convert to local time for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return "";
  });
  const [reminderTime, setReminderTime] = useState(() => {
    if (task.reminder) {
      const date = new Date(task.reminder);
      // Convert to local time for datetime-local input
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return "";
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  // const router = useRouter(); // Commented out as not currently used

  // Fetch existing categories when component mounts
  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name")
          .eq("user_id", user.id)
          .order("name");
        
        if (categories) {
          setExistingCategories(categories);
        }
      }
    }
    
    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryName: string) => {
    setCategory(categoryName);
    setShowCategoryDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/edit-task", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId: task.id,
          title: title.trim(),
          description: description.trim(),
          category: category.trim() || null,
          completed: completed,
          deadline: deadline || null,
          reminder: reminderTime || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update task");
      }

      // Show success message
      alert("Task updated successfully!");
      
      // Close the form
      onClose();
      
    } catch (error) {
      console.error("Error updating task:", error);
      alert(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg relative">
      <button
        onClick={onClose}
        type="button"
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ×
      </button>
      <h2 className="text-lg font-semibold mb-3">Edit Task</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
            Task Title *
          </label>
          <input
            type="text"
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task description"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="relative">
          <label htmlFor="edit-category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <div className="relative">
            <input
              type="text"
              id="edit-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onFocus={() => setShowCategoryDropdown(true)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category or select from existing"
              disabled={isSubmitting}
            />
            {showCategoryDropdown && existingCategories.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {existingCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.name)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
            {showCategoryDropdown && (
              <div 
                className="fixed inset-0 z-5" 
                onClick={() => setShowCategoryDropdown(false)}
              />
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="edit-deadline" className="block text-sm font-medium mb-1">
            Deadline
          </label>
          <input
            type="datetime-local"
            id="edit-deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="edit-reminder" className="block text-sm font-medium mb-1">
            Reminder Time
          </label>
          <input
            type="datetime-local"
            id="edit-reminder"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4"
              disabled={isSubmitting}
            />
            <span className="text-sm font-medium">Mark as completed</span>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-Jeeny text-white py-2 px-4 rounded-md hover:bg-Jeeny/70 focus:outline-none focus:ring-2 focus:bg-Jeeny disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Updating..." : "Update Task"}
        </button>
      </form>
    </div>
  );
}
