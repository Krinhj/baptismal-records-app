// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{path::PathBuf, process::Command};
use tauri::{generate_context, generate_handler, Builder};

fn main() {
    Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        // register all your commands here:
        .invoke_handler(generate_handler![
            // Auth Commands
            login_user,
            // Baptismal Record Commands
            create_baptism_record,
            get_baptism_records,
            update_baptism_record,
            delete_baptism_record,
            // Parish Management Commands
            create_parish_staff,
            get_parish_staff,
            update_parish_staff,
            delete_parish_staff,
            // Audit Commands
            get_audit_logs,
            get_all_users,
            // Backup Database Commands
            backup_database,
            import_database
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn login_user(username: String, password: String) -> Result<String, String> {
    // Build absolute path to the JS file
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("validateUser.js");
    println!("🔍 [login_user] launching script at: {}", script.display());

    // Also show working dir
    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [login_user] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [login_user] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&username)
        .arg(&password)
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [login_user] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let user_data = String::from_utf8_lossy(&output.stdout);
        Ok(user_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Authentication failed: {}", error_msg))
    }
}

#[tauri::command]
fn create_baptism_record(
    child_name: String,
    father_name: Option<String>,
    mother_name: Option<String>,
    birth_date: String,
    birth_place: String,
    baptism_date: String,
    priest_name: String,
    created_by: i32,
) -> Result<String, String> {
    // Build absolute path to the JS file
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("createRecord.js");
    println!(
        "🔍 [create_baptism_record] launching script at: {}",
        script.display()
    );

    // Also show working dir
    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [create_baptism_record] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [create_baptism_record] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&child_name)
        .arg(father_name.unwrap_or_default())
        .arg(mother_name.unwrap_or_default())
        .arg(&birth_date)
        .arg(&birth_place)
        .arg(&baptism_date)
        .arg(&priest_name)
        .arg(&created_by.to_string())
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [create_baptism_record] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let record_data = String::from_utf8_lossy(&output.stdout);
        Ok(record_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to create record: {}", error_msg))
    }
}

#[tauri::command]
fn get_baptism_records() -> Result<String, String> {
    // Build absolute path to the JS file
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("getRecords.js");
    println!(
        "🔍 [get_baptism_records] launching script at: {}",
        script.display()
    );

    // Also show working dir
    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [get_baptism_records] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [get_baptism_records] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [get_baptism_records] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let records_data = String::from_utf8_lossy(&output.stdout);
        Ok(records_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to fetch records: {}", error_msg))
    }
}

#[derive(serde::Deserialize)]
struct UpdateBaptismRecord {
    child_name: String,
    father_name: Option<String>,
    mother_name: Option<String>,
    birth_date: String,
    birth_place: String,
    baptism_date: String,
    priest_name: String,
}

#[tauri::command]
fn update_baptism_record(
    recordId: i32,
    updatedData: UpdateBaptismRecord, // Changed to camelCase
    updatedBy: i32,                   // Changed to camelCase
) -> Result<String, String> {
    // Build absolute path to the JS file
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("updateRecord.js");
    println!(
        "🔍 [update_baptism_record] launching script at: {}",
        script.display()
    );

    // Also show working dir
    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [update_baptism_record] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [update_baptism_record] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&recordId.to_string())
        .arg(&updatedData.child_name)
        .arg(updatedData.father_name.unwrap_or_default())
        .arg(updatedData.mother_name.unwrap_or_default())
        .arg(&updatedData.birth_date)
        .arg(&updatedData.birth_place)
        .arg(&updatedData.baptism_date)
        .arg(&updatedData.priest_name)
        .arg(&updatedBy.to_string()) // Changed to updatedBy
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [update_baptism_record] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let update_data = String::from_utf8_lossy(&output.stdout);
        Ok(update_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to update record: {}", error_msg))
    }
}

#[tauri::command]
fn delete_baptism_record(record_id: i32, deleted_by: i32) -> Result<String, String> {
    // Build absolute path to the JS file
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("deleteRecord.js");
    println!(
        "🔍 [delete_baptism_record] launching script at: {}",
        script.display()
    );

    // Also show working dir
    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [delete_baptism_record] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [delete_baptism_record] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&record_id.to_string())
        .arg(&deleted_by.to_string())
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [delete_baptism_record] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let delete_data = String::from_utf8_lossy(&output.stdout);
        Ok(delete_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to delete record: {}", error_msg))
    }
}

// Parish Staff Commands - Add these functions to your main.rs:

#[tauri::command]
fn create_parish_staff(
    name: String,
    title: Option<String>,
    role: Option<String>,
    created_by: i32, // ADD THIS NEW PARAMETER
) -> Result<String, String> {
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("createParishStaff.js");
    println!(
        "🔍 [create_parish_staff] launching script at: {}",
        script.display()
    );

    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [create_parish_staff] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [create_parish_staff] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&name)
        .arg(title.unwrap_or_default())
        .arg(role.unwrap_or_default())
        .arg(&created_by.to_string()) // ADD THIS NEW ARGUMENT
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [create_parish_staff] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let staff_data = String::from_utf8_lossy(&output.stdout);
        Ok(staff_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to create parish staff: {}", error_msg))
    }
}

#[tauri::command]
fn get_parish_staff() -> Result<String, String> {
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("getParishStaff.js");
    println!(
        "🔍 [get_parish_staff] launching script at: {}",
        script.display()
    );

    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [get_parish_staff] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [get_parish_staff] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [get_parish_staff] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let staff_data = String::from_utf8_lossy(&output.stdout);
        Ok(staff_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to fetch parish staff: {}", error_msg))
    }
}

#[tauri::command]
fn update_parish_staff(
    staff_id: i32,
    name: String,
    title: Option<String>,
    role: Option<String>,
    updated_by: i32, // ADD THIS NEW PARAMETER
) -> Result<String, String> {
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("updateParishStaff.js");
    println!(
        "🔍 [update_parish_staff] launching script at: {}",
        script.display()
    );

    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [update_parish_staff] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [update_parish_staff] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&staff_id.to_string())
        .arg(&name)
        .arg(title.unwrap_or_default())
        .arg(role.unwrap_or_default())
        .arg(&updated_by.to_string()) // ADD THIS NEW ARGUMENT
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [update_parish_staff] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let staff_data = String::from_utf8_lossy(&output.stdout);
        Ok(staff_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to update parish staff: {}", error_msg))
    }
}

#[tauri::command]
fn delete_parish_staff(
    staff_id: i32,
    deleted_by: i32, // ADD THIS MISSING PARAMETER
) -> Result<String, String> {
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("deleteParishStaff.js");
    println!(
        "🔍 [delete_parish_staff] launching script at: {}",
        script.display()
    );

    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [delete_parish_staff] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [delete_parish_staff] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&staff_id.to_string())
        .arg(&deleted_by.to_string()) // This line was correct, just needed the parameter above
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [delete_parish_staff] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let staff_data = String::from_utf8_lossy(&output.stdout);
        Ok(staff_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to delete parish staff: {}", error_msg))
    }
}

#[tauri::command]
fn get_audit_logs() -> Result<String, String> {
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("getAuditLogs.js");
    println!(
        "🔍 [get_audit_logs] launching script at: {}",
        script.display()
    );

    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [get_audit_logs] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [get_audit_logs] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [get_audit_logs] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let logs_data = String::from_utf8_lossy(&output.stdout);
        Ok(logs_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to fetch audit logs: {}", error_msg))
    }
}

#[tauri::command]
fn get_all_users() -> Result<String, String> {
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("getAllUsers.js");
    println!(
        "🔍 [get_all_users] launching script at: {}",
        script.display()
    );

    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [get_all_users] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [get_all_users] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute node process: {}", e))?;

    println!(
        "🔍 [get_all_users] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let users_data = String::from_utf8_lossy(&output.stdout);
        Ok(users_data.trim().to_string())
    } else {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to fetch users: {}", error_msg))
    }
}

#[tauri::command]
async fn backup_database(backup_path: String, user_id: i32) -> Result<String, String> {
    // Build absolute path to the JS file like your other commands
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("backupDatabase.js");
    println!("🔍 [backup_database] launching script at: {}", script.display());

    // Also show working dir
    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [backup_database] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [backup_database] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&backup_path)
        .arg(&user_id.to_string())
        .output()
        .map_err(|e| format!("Failed to execute backup command: {}", e))?;

    println!(
        "🔍 [backup_database] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(stdout.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Backup failed: {}", stderr))
    }
}

#[tauri::command]
async fn import_database(backup_path: String, user_id: i32) -> Result<String, String> {
    // Build absolute path to the JS file like your other commands
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("importDatabase.js");
    println!("🔍 [import_database] launching script at: {}", script.display());

    // Also show working dir
    match std::env::current_dir() {
        Ok(cwd) => println!("🔍 [import_database] cwd: {}", cwd.display()),
        Err(e) => println!("⚠️  [import_database] failed to get cwd: {}", e),
    }

    let output = Command::new("node")
        .arg(&script)
        .arg(&backup_path)
        .arg(&user_id.to_string())
        .output()
        .map_err(|e| format!("Failed to execute import command: {}", e))?;

    println!(
        "🔍 [import_database] node exit: {} (stdout: {:?}, stderr: {:?})",
        output.status,
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(stdout.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Import failed: {}", stderr))
    }
}
