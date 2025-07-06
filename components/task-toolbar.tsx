"use client";

import Image from "next/image";
import AddTask from "@/app/add-task.png";
import RemoveTask from "@/app/remove-task.svg";
import EditTask from "@/app/edit-task.png";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddTaskForm } from "./add-task-form";
import { EditTaskForm } from "./edit-task-form";

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

interface TaskToolbarProps {
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskToolbar({ tasks, onAddTask, onEditTask, onDeleteTask }: TaskToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddTask = async () => {
    if (isProcessing) return;
    onAddTask();
  };

  const handleEditTask = () => {
    if (tasks.length === 0) {
      alert("No tasks available to edit!");
      return;
    }
    
    if (tasks.length === 1) {
      // If only one task, edit it directly
      onEditTask(tasks[0]);
    } else {
      // If multiple tasks, let user choose
      const taskTitles = tasks.map((task, index) => `${index + 1}. ${task.title}`).join('\n');
      const selection = prompt(`Select a task to edit (enter number 1-${tasks.length}):\n\n${taskTitles}`);
      
      if (selection) {
        const taskIndex = parseInt(selection) - 1;
        if (taskIndex >= 0 && taskIndex < tasks.length) {
          onEditTask(tasks[taskIndex]);
        } else {
          alert("Invalid selection!");
        }
      }
    }
  };

  const handleRemoveTask = async () => {
    if (tasks.length === 0) {
      alert("No tasks available to delete!");
      return;
    }
    
    let taskToDelete: Task | null = null;
    
    if (tasks.length === 1) {
      // If only one task, delete it directly
      taskToDelete = tasks[0];
    } else {
      // If multiple tasks, let user choose
      const taskTitles = tasks.map((task, index) => `${index + 1}. ${task.title}`).join('\n');
      const selection = prompt(`Select a task to delete (enter number 1-${tasks.length}):\n\n${taskTitles}`);
      
      if (selection) {
        const taskIndex = parseInt(selection) - 1;
        if (taskIndex >= 0 && taskIndex < tasks.length) {
          taskToDelete = tasks[taskIndex];
        } else {
          alert("Invalid selection!");
          return;
        }
      } else {
        return;
      }
    }
    
    if (taskToDelete && confirm(`Are you sure you want to delete "${taskToDelete.title}"?`)) {
      setIsProcessing(true);
      
      try {
        await onDeleteTask(taskToDelete.id);
        alert("Task deleted successfully!");
      } catch (error) {
        console.error("Error deleting task:", error);
        alert(error instanceof Error ? error.message : "An unexpected error occurred");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleAddTask} 
        type="button" 
        disabled={isProcessing}
        className="flex items-center justify-center p-2 text-white hover:bg-white transition-colors rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        title="Add new task"
      >
        <Image src={AddTask} alt="Add Task" width={30} height={30} />
      </button>
      <button 
        onClick={handleRemoveTask} 
        type="button" 
        disabled={isProcessing}
        className="flex items-center justify-center p-2 text-white hover:bg-white transition-colors rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete task"
      >
        <Image src={RemoveTask} alt="Remove Task" width={30} height={30} />
      </button>
      <button 
        onClick={handleEditTask} 
        type="button" 
        disabled={isProcessing}
        className="flex items-center justify-center p-2 text-white hover:bg-white transition-colors rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
        title="Edit task"
      >
        <Image src={EditTask} alt="Edit Task" width={30} height={30} />
      </button>
    </div>
  );
}
