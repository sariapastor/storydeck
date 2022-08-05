#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tokio;
use mongodb::bson::{Document, doc, oid::ObjectId};
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

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
    let recording = Recording::from_name_and_path(&name, path);
    db::create_story_card(&state.db, state.default_deck, name, Some(recording), None).await
  } else {
    let plan = PlannedRecording::from_name(&name);
    db::create_story_card(&state.db, state.default_deck, name, None, Some(vec![plan])).await
  };
  match db_response {
    Ok(new_card) => Ok(serde_json::to_string(&new_card).expect("failed to parse card")),
    Err(e) => Err(format!("failed to create card with error: {}", e))
  }
}

#[tauri::command]
async fn create_story_deck(
  name: String, state: tauri::State<'_, AppState> // cards: Option<Vec<ObjectId>>
) -> Result<String, String> {
  let db_response = db::create_story_deck(&state.db, name).await;
  match db_response {
    Ok(new_deck) => Ok(serde_json::to_string(&new_deck).expect("failed to parse deck")),
    Err(e) => Err(format!("failed to create deck with error: {}", e))
  }
}

#[tauri::command]
async fn query_cards_and_decks(
  filter: Option<Document>, state: tauri::State<'_, AppState>
) -> Result<String, String> {
    let db_response = db::query_cards_and_decks(&state.db, filter).await;
    match db_response {
      Ok(cards_n_decks_tup) => Ok(serde_json::to_string(&cards_n_decks_tup).expect("failed to parse card and deck results")),
      Err(e) => Err(format!("failed to return query with error: {}", e))
    }
}

#[tauri::command]
async fn update_record(
  record_type: &str, id: ObjectId, update: Document, state: tauri::State<'_, AppState>
) -> Result<String, String> {
  match db::update_record(&state.db, record_type, id, update).await {
    Ok(update_serialized) => Ok(update_serialized),
    Err(e) => Err(format!("update failed with error: {}", e))
  }
}

#[tauri::command]
async fn delete_record(
  record_type: &str, id: ObjectId, state: tauri::State<'_, AppState>
) -> Result<String, String> {
  match db::delete_record(&state.db, record_type, id).await {
    Ok(delete_message) => Ok(delete_message),
    Err(e) => Err(format!("delete failed with error: {}", e))
  }
}

#[tokio::main]
async fn main() {

  let add = CustomMenuItem::new("Add", "Add new..");
  let submenu = Submenu::new("File", Menu::new().add_item(add));
  let menu = Menu::new().add_native_item(MenuItem::Quit).add_submenu(submenu);
    
  let state = AppState {
    db: db::establish_connection().await.expect("error connecting to database"),
    default_deck: ObjectId::parse_str("62e9a151232b6ea9aab10fa4").expect("failed to parse oid"),
  };

  tauri::Builder::default()
    .menu(menu)
    .manage(state)
    .invoke_handler(tauri::generate_handler![
      create_story_card, create_story_deck, query_cards_and_decks, update_record, delete_record
      ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
