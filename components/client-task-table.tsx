"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TaskTable } from "./task-table";
import { EditTaskForm } from "./edit-task-form";
import { AddTaskForm } from "./add-task-form";
import { ReminderBell } from "./reminder-bell";

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

interface ClientTaskTableProps {
  initialTasks: Task[];
  showReminderBell?: boolean;
}

export function ClientTaskTable({ initialTasks, showReminderBell = false }: ClientTaskTableProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const router = useRouter();

  // Set up realtime subscription for tasks
  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        async (payload) => {
          console.log('Realtime change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new task with categories to match the existing structure
            const { data: newTask } = await supabase
              .from('tasks')
              .select(`
                *,
                categories (
                  id,
                  name
                )
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (newTask) {
              setTasks(prev => [newTask, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch the updated task with categories
            const { data: updatedTask } = await supabase
              .from('tasks')
              .select(`
                *,
                categories (
                  id,
                  name
                )
              `)
              .eq('id', payload.new.id)
              .single();
            
            if (updatedTask) {
              setTasks(prev => 
                prev.map(task => 
                  task.id === updatedTask.id ? updatedTask : task
                )
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(task => task.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTaskUpdate = useCallback(async (taskId: string, updates: Partial<Task>) => {
    setIsUpdating(taskId);
    
    try {
      const response = await fetch(`/api/update-task/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update task");
      }

      const { task: updatedTask } = await response.json();
      
      // Update the local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      );
      
      // Note: No need to refresh - realtime updates will handle this
      
    } catch (error) {
      console.error("Error updating task:", error);
      alert(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setIsUpdating(null);
    }
  }, [router]);

  const handleAddTask = useCallback(() => {
    setShowAddForm(true);
    setEditingTask(null); // Close any open edit form
  }, []);

  const handleTaskDelete = useCallback(async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch("/api/delete-task", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete task");
      }

      // Remove the task from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Note: No need to refresh - realtime updates will handle this
      
    } catch (error) {
      console.error("Error deleting task:", error);
      alert(error instanceof Error ? error.message : "Failed to delete task");
    }
  }, [router]);

  const handleTaskEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setShowAddForm(false); // Close any open add form
  }, []);

  const handleEditClose = useCallback(() => {
    setEditingTask(null);
  }, []);

  const handleAddClose = useCallback(() => {
    setShowAddForm(false);
  }, []);

  return (
    <div>
      {/* Reminder Bell - only show if requested */}
      {showReminderBell && (
        <div className="mb-4 flex justify-end">
          <ReminderBell tasks={tasks} />
        </div>
      )}
      
      {/* Add Task Form */}
      {showAddForm && (
        <div className="mb-6">
          <AddTaskForm onClose={handleAddClose} />
        </div>
      )}
      
      {/* Edit Task Form */}
      {editingTask && (
        <div className="mb-6">
          <EditTaskForm 
            task={editingTask as any} 
            onClose={handleEditClose}
          />
        </div>
      )}
      
      <TaskTable 
        tasks={tasks} 
        onTaskUpdate={handleTaskUpdate}
        onTaskEdit={handleTaskEdit}
        onTaskDelete={handleTaskDelete}
        onAddTask={handleAddTask}
        isUpdating={isUpdating}
      />
    </div>
  );
}
