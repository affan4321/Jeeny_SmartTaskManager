import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { title, description, category, deadline, reminder } = await request.json();

    console.log("API received data:", { title, description, category, deadline, reminder });

    // Validate required fields
    if (!title || !title.trim()) {
      console.log("Validation failed: Title is required");
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("Auth check - User:", user?.id, "User object:", user, "Error:", authError);

    if (authError || !user) {
      console.log("Authentication failed");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user exists in the user table
    console.log("Checking if user exists in database tables...");
    
    const { data: userRecord, error: userError } = await supabase
      .from("user")
      .select("id")
      .eq("id", user.id)
      .single();
    
    console.log("user table check:", { userRecord, userError });

    // If user doesn't exist in user table, create one
    if (userError && userError.code === 'PGRST116') {
      console.log("User doesn't exist in user table, attempting to create user...");
      
      const { data: newUser, error: createUserError } = await supabase
        .from("user")
        .insert([
          {
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      console.log("User creation result:", { newUser, createUserError });
      
      if (createUserError) {
        console.error("Failed to create user record:", createUserError);
        return NextResponse.json(
          { error: "Failed to create user record: " + createUserError.message },
          { status: 500 }
        );
      }
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

    console.log("Category processing complete, category_id:", category_id);

    // Insert the new task
    const taskData = {
      title: title.trim(),
      description: description?.trim() || "",
      category_id: category_id,
      deadline: deadline || null, // Already in ISO format from client
      reminder: reminder || null, // Already in ISO format from client
      completed: false,
      user_id: user.id
    };
    
    console.log("Inserting task with data:", taskData);
    console.log("User ID type:", typeof user.id, "User ID value:", user.id);

    // Try inserting without the join first to see if that's the issue
    const { data: task, error: insertError } = await supabase
      .from("tasks")
      .insert([taskData])
      .select()
      .single();

    console.log("Insert result - Task:", task, "Error:", insertError);

    if (insertError) {
      console.error("Database error:", insertError);
      return NextResponse.json(
        { error: "Failed to create task: " + insertError.message },
        { status: 500 }
      );
    }

    // Return the created task
    return NextResponse.json(
      { 
        message: "Task created successfully", 
        task 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
