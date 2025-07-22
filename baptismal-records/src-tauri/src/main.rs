// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{generate_handler, Builder, generate_context};

fn main() {
  Builder::default()
    // register all your commands here:
    .invoke_handler(generate_handler![login_user /*, other commands…*/])
    .run(generate_context!())
    .expect("error while running tauri application");
}

use std::{path::PathBuf, process::Command};

#[tauri::command]
fn login_user(email: String, password: String) -> bool {
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
    .arg(&email)
    .arg(&password)
    .output()
    .expect("Failed to execute node process");

  println!(
    "🔍 [login_user] node exit: {} (stdout: {:?}, stderr: {:?})",
    output.status,
    String::from_utf8_lossy(&output.stdout),
    String::from_utf8_lossy(&output.stderr)
  );

  output.status.success()
}