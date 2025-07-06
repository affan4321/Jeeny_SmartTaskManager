import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { ClientTaskTable } from "@/components/client-task-table";
// import { ReminderBell } from "@/components/reminder-bell";
import Navbar from "@/components/navbar";
import { hasEnvVars } from "@/lib/utils";
import { ErrorBoundary } from "@/components/error-boundary";

// Cache the user data fetching to prevent multiple calls
const getUser = cache(async () => {
  const supabase = await createClient();
  return await supabase.auth.getUser();
});

// Get the User's Tasks
const getUserTasks = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await getUser();
  if (error || !data?.user) {
    return { error: "No User found!" };
  }
  
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select(`
      *,
      categories (
        id,
        name
      )
    `)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false });
  
  if (tasksError) {
    console.error("Tasks query error:", tasksError);
    return { error: tasksError.message };
  }
  
  console.log("Fetched tasks with categories:", JSON.stringify(tasks, null, 2));
  
  return tasks || [];
});

export default async function HomePage() {
  const { data, error } = await getUser();
  const tasks = await getUserTasks();
  
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Debug information
  console.log("User data:", data?.user);
  console.log("Tasks data:", tasks);
  console.log("Tasks type:", typeof tasks);
  console.log("Is tasks array:", Array.isArray(tasks));

  return (
    <>
    <Navbar hasEnvVars={hasEnvVars} />
    <div className="flex flex-col items-center flex-1 p-4 w-full">
      <div className={`flex-1 border-2 border-black dark:border-white rounded-2xl p-5 w-[95%] max-w-[90rem] my-10 backdrop-blur-xl shadow-md dark:shadow-white overflow-visible flex flex-col`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-xl">Task Manager</h1>
        </div>
        
        <div className="mb-4 flex-shrink-0">
          {!Array.isArray(tasks) && (
            <p className="text-sm text-red-500">
              Debug: {JSON.stringify(tasks)}
            </p>
          )}
        </div>
        
        <div className="flex-1 overflow-auto">
          <ErrorBoundary>
            {Array.isArray(tasks) ? (
              <ClientTaskTable initialTasks={tasks} showReminderBell={true} />
            ) : (
              <div className="text-center text-red-500 py-8">
                {tasks.error || "Error loading tasks"}
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
    </>
  );
}
