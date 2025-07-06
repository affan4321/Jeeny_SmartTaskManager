import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const { taskId, title, description, category, completed, deadline, reminder } = await request.json();

    // Validate required fields
    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Handle category - first try to find existing category or create new one
    let category_id = null;
    
    if (category && category.trim()) {
      // Check if category exists
      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("name", category.trim())
        .eq("user_id", user.id)
        .single();

      if (existingCategory) {
        category_id = existingCategory.id;
      } else {
        // Create new category
        const { data: newCategory, error: categoryError } = await supabase
          .from("categories")
          .insert([
            {
              name: category.trim(),
              user_id: user.id
            }
          ])
          .select("id")
          .single();

        if (categoryError) {
          console.error("Category creation error:", categoryError);
          // Continue without category if creation fails
        } else {
          category_id = newCategory.id;
        }
      }
    }

    // Update the task (only if it belongs to the current user)
    const { data: task, error: updateError } = await supabase
      .from("tasks")
      .update({
        title: title.trim(),
        description: description?.trim() || "",
        category_id: category_id,
        completed: completed || false,
        deadline: deadline || null, // Already in ISO format from client
        reminder: reminder || null, // Already in ISO format from client
        updated_at: new Date().toISOString()
      })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .single();

    if (updateError) {
      console.error("Database error:", updateError);
      return NextResponse.json(
        { error: "Failed to update task" },
        { status: 500 }
      );
    }

    // Return the updated task
    return NextResponse.json(
      { 
        message: "Task updated successfully", 
        task 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
