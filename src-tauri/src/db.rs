use std::env;
use mongodb::bson::oid::ObjectId; //self, doc, 
use mongodb::{options::ClientOptions, Client, Database};
use mongodb::error::Result as MdbResult;
// use futures::stream::TryStreamExt;
// use chrono::Utc;

pub mod models;
pub mod docs;
use models::*;
use docs::*;

pub async fn establish_connection() -> MdbResult<Database> {
    let client_options = ClientOptions::parse(
        env::var("MONGODB_URI")
            .expect("You must set the MONGODB_URI environment var!")
    ).await?;
    // set any additional options here as needed with: client_options.key = Some(value)
    
    let client = Client::with_options(client_options)?;
    Ok(client.database("capstone_project"))
}

pub async fn create_story_card(
    db: &Database, deck_id: ObjectId, name: String, 
    recording: Option<Recording>, plans: Option<Vec<PlannedRecording>>
) -> MdbResult<StoryCard> {
    let storycards = db.collection::<StoryCard>("storycards");
    let new_card = if let Some(rec) = recording {
        StoryCard::Telling( Take {
            id: ObjectId::new(), name, decks: vec![deck_id], recording: rec,
            description: None, people: None, places: None, notes: None, tags: None
        } )
    } else {
        StoryCard::Template( Plan {
            id: ObjectId::new(), name, decks: vec![deck_id], 
            planned_recordings: plans.unwrap(), description: None
        } )
    };
    let insert_result = storycards.insert_one(&new_card, None).await?;
    Ok(new_card)
}