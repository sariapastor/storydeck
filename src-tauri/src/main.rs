#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use db::docs::*;
use mongodb::bson::{doc, oid::ObjectId, Document};
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub mod db;
pub mod transcriber;

struct AppState {
    db: mongodb::Database,
    default_deck: ObjectId,
}

#[tauri::command]
async fn create_story_card(
    name: String,
    file_path: Option<String>,
    state: tauri::State<'_, AppState>,
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
        Err(e) => Err(format!("failed to create card with error: {}", e)),
    }
}

#[tauri::command]
async fn create_transcript(
    file_path: String,
    card_id: ObjectId,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let config =
        transcriber::Config::new(file_path, None).expect("failed to make transcriber config");
    match transcriber::transcribe_and_split(config) {
        Ok(transcript_result) => {
            println!("transcript completed");
            let db_response = db::create_transcript(&state.db, transcript_result, card_id).await;
            match db_response {
                Ok(new_transcript) => {
                    Ok(serde_json::to_string(&new_transcript).expect("failed to parse transcript"))
                }
                Err(e) => {
                    let _update = db::update_record(
                        &state.db,
                        "card",
                        card_id,
                        doc! { "$set": { "recording.transcriptStatus": "Error" }},
                    )
                    .await;
                    Err(format!(
                        "failed to create transcript db record with error: {}",
                        e
                    ))
                }
            }
        }
        Err(e) => Err(format!("failed to transcribe and split with error: {}", e)),
    }
}

#[tauri::command]
async fn create_story_deck(
    name: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let db_response = db::create_story_deck(&state.db, name).await;
    match db_response {
        Ok(new_deck) => Ok(serde_json::to_string(&new_deck).expect("failed to parse deck")),
        Err(e) => Err(format!("failed to create deck with error: {}", e)),
    }
}

#[tauri::command]
async fn query_cards_and_decks(
    filter: Option<Document>,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let db_response = db::query_cards_and_decks(&state.db, filter).await;
    match db_response {
        Ok(cards_n_decks_tup) => Ok(serde_json::to_string(&cards_n_decks_tup)
            .expect("failed to parse card and deck results")),
        Err(e) => Err(format!("failed to return query with error: {}", e)),
    }
}

#[tauri::command]
async fn query_transcripts(
    filter: Document,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let db_response = db::query_transcripts(&state.db, filter).await;
    match db_response {
        Ok(transcript) => {
            Ok(serde_json::to_string(&transcript).expect("failed to parse transcript"))
        }
        Err(e) => Err(format!("failed to return query with error: {}", e)),
    }
}

#[tauri::command]
async fn rename_file(
    recording_id: ObjectId,
    filename: String,
    state: tauri::State<'_, AppState>,
) -> Result<String, String> {
    let db_response =
        db::query_cards_and_decks(&state.db, Some(doc! {"recording._id": recording_id })).await;
    let cards = match db_response {
        Ok(result_tuple) => result_tuple.0,
        Err(e) => return Err(format!("failed to locate recording with error: {}", e)),
    };
    let card = cards.first().expect("this slice should not be empty");
    if let db::models::StoryCard::Telling(take) = card {
        take.recording.rename_recording(&filename)
    } else {
        Err(String::from("failed to parse card object"))
    }
}

#[tauri::command]
async fn update_record(
    record_type: &str,
    id: ObjectId,
    update: Document,
    state: tauri::State<'_, AppState>,
) -> Result<bool, String> {
    let update = doc! { "$set" : update };
    match db::update_record(&state.db, record_type, id, update).await {
        Ok(update_success) => Ok(update_success),
        Err(e) => Err(format!("update failed with error: {}", e)),
    }
}

#[tauri::command]
async fn delete_record(
    record_type: &str,
    id: ObjectId,
    state: tauri::State<'_, AppState>,
) -> Result<bool, String> {
    match db::delete_record(&state.db, record_type, id).await {
        Ok(delete_success) => Ok(delete_success),
        Err(e) => Err(format!("delete failed with error: {}", e)),
    }
}

#[tokio::main]
async fn main() {
    let add_telling = CustomMenuItem::new("Add Telling", "Add new recording..");
    let add_template = CustomMenuItem::new("Add Template", "Add planned recording(s)..");
    let add_deck = CustomMenuItem::new("Add Deck", "Add new collection..");
    let submenu = Submenu::new(
        "File",
        Menu::with_items([add_telling.into(), add_template.into(), add_deck.into()]),
    );
    let menu = Menu::new()
        .add_native_item(MenuItem::Quit)
        .add_submenu(submenu);

    let state = AppState {
        db: db::establish_connection()
            .await
            .expect("error connecting to database"),
        default_deck: ObjectId::parse_str("62e9a151232b6ea9aab10fa4").expect("failed to parse oid"),
        // TODO: implement function to initialize this default_deck value properly
    };

    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(move |event| match event.menu_item_id() {
            "Add Template" => event.window().emit("Add", "Planned Recording").unwrap(),
            "Add Telling" => event.window().emit("Add", "Recording").unwrap(),
            "Add Deck" => event.window().emit("Add", "Deck").unwrap(),
            _ => {}
        })
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            create_story_card,
            create_story_deck,
            query_cards_and_decks,
            update_record,
            delete_record,
            create_transcript,
            query_transcripts,
            rename_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
