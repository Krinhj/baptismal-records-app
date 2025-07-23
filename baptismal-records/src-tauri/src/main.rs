// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{generate_handler, Builder, generate_context};
use std::{path::PathBuf, process::Command};

fn main() {
  Builder::default()
    // register all your commands here:
    .invoke_handler(generate_handler![login_user, create_baptism_record, get_baptism_records, delete_baptism_record])
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
    Err(e)  => println!("⚠️  [login_user] failed to get cwd: {}", e),
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
    println!("🔍 [create_baptism_record] launching script at: {}", script.display());

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
    println!("🔍 [get_baptism_records] launching script at: {}", script.display());

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

#[tauri::command]
fn delete_baptism_record(record_id: i32, deleted_by: i32) -> Result<String, String> {
    // Build absolute path to the JS file
    let mut script = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    script.push("deleteRecord.js");
    println!("🔍 [delete_baptism_record] launching script at: {}", script.display());

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