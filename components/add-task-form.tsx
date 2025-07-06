"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
}

export function AddTaskForm({ onClose }: { onClose?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState<Category[]>([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const router = useRouter();

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
      const requestData = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || null,
        deadline: deadline || null,
        reminder: reminderTime || null,
      };
      
      console.log("Sending request data:", requestData);

      const response = await fetch("/api/add-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to add task");
      }

      // Clear form on success
      setTitle("");
      setDescription("");
      setCategory("");
      setDeadline("");
      setReminderTime("");
      
      // Show success message
      alert("Task added successfully!");
      
      // Close the form if onClose is provided
      if (onClose) {
        onClose();
      }
      
    } catch (error) {
      console.error("Error adding task:", error);
      alert(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 p-4 border rounded-lg relative">
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      )}
      <h2 className="text-lg font-semibold mb-3">Add New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Task Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task title"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter task description"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="relative">
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Category
          </label>
          <div className="relative">
            <input
              type="text"
              id="category"
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
          <label htmlFor="deadline" className="block text-sm font-medium mb-1">
            Deadline
          </label>
          <input
            type="datetime-local"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label htmlFor="reminder" className="block text-sm font-medium mb-1">
            Reminder Time
          </label>
          <input
            type="datetime-local"
            id="reminder"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-Jeeny text-white py-2 px-4 rounded-md hover:bg-Jeeny/70 focus:outline-none focus:ring-2 focus:bg-Jeeny disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Adding..." : "Add Task"}
        </button>
      </form>
    </div>
  );
}
