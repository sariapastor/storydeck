#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tokio;
use mongodb::bson::oid::ObjectId;

pub mod db;
// use db::models::*;
use db::docs::*;

struct AppState {
  db: mongodb::Database,
  default_deck: ObjectId,
}

#[tauri::command]
async fn create_story_card(
  name: String, file_path: Option<String>, state: tauri::State<'_, AppState>
) -> Result<String, String> {
  let db_response = if let Some(path) = file_path {
    let recording = Recording::from_name_and_file(&name, path);
    db::create_story_card(&state.db, state.default_deck, name, Some(recording), None).await
  } else {
    let plan = PlannedRecording::from_name(&name);
    db::create_story_card(&state.db, state.default_deck, name, None, vec![plan]).await
  };
  match db_response {
    Ok(new_card) => Ok(serde_json::to_string(&new_card).expect("failed to parse card")),
    Err(e) => Err(format!("failed to create card with error: {}", e))
  }
}

#[tokio::main]
async fn main() {
    
  let state = AppState {
    db: db::establish_connection().await.expect("error connecting to database"),
    default_deck: ObjectId::parse_str("62e9a151232b6ea9aab10fa4").expect("failed to pasrse oid"),
  };

  tauri::Builder::default()
    .manage(state)
    .invoke_handler(tauri::generate_handler![create_story_card])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
