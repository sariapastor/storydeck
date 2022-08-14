#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use mongodb::bson::{Document, doc, oid::ObjectId};
use tauri::{CustomMenuItem, Manager, Menu, MenuItem, Submenu};
use db::docs::*;

pub mod db;
pub mod transcriber;

// code to get native macos window controls without default titlebar 
// (from here: https://github.com/tauri-apps/tauri/issues/2663)
use cocoa::appkit::{NSWindow, NSWindowStyleMask};
use tauri::{Runtime, Window};

pub trait WindowExt {
  #[cfg(target_os = "macos")]
  fn set_transparent_titlebar(&self, transparent: bool);
}

impl<R: Runtime> WindowExt for Window<R> {
  #[cfg(target_os = "macos")]
  fn set_transparent_titlebar(&self, transparent: bool) {
    use cocoa::appkit::NSWindowTitleVisibility;

    unsafe {
      let id = self.ns_window().unwrap() as cocoa::base::id;

      let mut style_mask = id.styleMask();
      style_mask.set(
        NSWindowStyleMask::NSFullSizeContentViewWindowMask,
        transparent,
      );
      id.setStyleMask_(style_mask);

      id.setTitleVisibility_(if transparent {
        NSWindowTitleVisibility::NSWindowTitleHidden
      } else {
        NSWindowTitleVisibility::NSWindowTitleVisible
      });
      id.setTitlebarAppearsTransparent_(if transparent {
        cocoa::base::YES
      } else {
        cocoa::base::NO
      });
    }
  }
}
// end of native macos window controls code

struct AppState {
  db: mongodb::Database,
  default_deck: ObjectId,
}

#[tauri::command]
async fn create_story_card(
  name: String, file_path: Option<String>, state: tauri::State<'_, AppState>
) -> Result<String, String> {
  let db_response = if let Some(path) = file_path {
    let recording = Recording::from_name_and_path(&name, path)?;
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
async fn create_transcript(
  file_path: String, card_id: ObjectId, state: tauri::State<'_, AppState>
) -> Result<String, String> {
  let config = transcriber::Config::from_path(file_path).expect("failed to make transcriber config"); 
  match transcriber::transcribe_and_split(config) {
    Ok(transcript_result) => {
      println!("transcript completed");
      let db_response = db::create_transcript(&state.db, transcript_result, card_id).await;
      match db_response {
        Ok(new_transcript) => Ok(serde_json::to_string(&new_transcript).expect("failed to parse transcript")),
        Err(e) => {
          let _update = db::update_record(&state.db, "card", card_id, doc! { "$set": { "recording.transcriptStatus": "Error" }}).await;
          Err(format!("failed to create transcript db record with error: {}", e))
        }
      }
    },
    Err(e) => Err(format!("failed to transcribe and split with error: {}", e))
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
async fn query_transcripts(
  filter: Document, state: tauri::State<'_, AppState>
) -> Result<String, String> {
  // if let Ok(filter_doc) = bson::ser::to_document(&filter) {
    let db_response = db::query_transcripts(&state.db, filter).await;
    match db_response {
      Ok(transcript) => Ok(serde_json::to_string(&transcript).expect("failed to parse transcript")),
      Err(e) => Err(format!("failed to return query with error: {}", e))
    }
  // } else {
  //   Err(String::from("failed to parse query filter"))
  // }
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

  let add_telling = CustomMenuItem::new("Add Telling", "Add new recording..");
  let add_template = CustomMenuItem::new("Add Template", "Add planned recording(s)..");
  let add_deck = CustomMenuItem::new("Add Deck", "Add new deck grouping..");
  let submenu = Submenu::new("File", Menu::with_items([ 
    add_telling.into(), add_template.into(), add_deck.into() 
  ]));
  let menu = Menu::new().add_native_item(MenuItem::Quit).add_submenu(submenu);
    
  let state = AppState {
    db: db::establish_connection().await.expect("error connecting to database"),
    default_deck: ObjectId::parse_str("62e9a151232b6ea9aab10fa4").expect("failed to parse oid"),
    // TODO: implement function to initialize this default_deck value properly
  };

  tauri::Builder::default()
    // .plugin(tauri_plugin_persisted_scope::init())
    .setup(|app| {
      let win = app.get_window("main").unwrap();
      win.set_transparent_titlebar(true);
      Ok(())
    })
    .menu(menu)
    .on_menu_event(move |event| {
      match event.menu_item_id() {
        "Add Template" => event.window().emit("Add", "Planned Recording").unwrap(),
        "Add Telling" => event.window().emit("Add", "Recording").unwrap(),
        "Add Deck" => event.window().emit("Add", "Deck").unwrap(),
        _ => {}
      }
    })
    .manage(state)
    .invoke_handler(tauri::generate_handler![
      create_story_card, create_story_deck, query_cards_and_decks, update_record,
      delete_record, create_transcript, query_transcripts
      ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
