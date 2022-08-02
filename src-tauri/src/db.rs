use std::env;
use mongodb::bson::{Document, doc, oid::ObjectId}; //self, 
use mongodb::{options::ClientOptions, Client, Database};
use mongodb::error::Result as MdbResult;
use futures::stream::TryStreamExt;
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
    let _insert = storycards.insert_one(&new_card, None).await?;
    Ok(new_card)
}

pub async fn create_story_deck(
    db: &Database, name: String, //cards: Option<Vec<ObjectId>>,
) -> MdbResult<StoryDeck> {
    let storydecks = db.collection::<StoryDeck>("storydecks");
    // let new_deck = if let Some(card_vec) = cards {
    //     StoryDeck::from_name_and_cards(&name, card_vec)
    // } else {
    //     StoryDeck::from_name(&name)
    // };
    let new_deck = StoryDeck::from_name(&name);
    let _insert = storydecks.insert_one(&new_deck, None).await?;
    Ok(new_deck)
}

pub async fn query_cards_and_decks(
    db: &Database, filter: Option<Document>
) -> MdbResult<(Vec<StoryCard>, Vec<StoryDeck>)> {
    let card_results = db.collection::<StoryCard>("storycards").find(filter.clone(), None).await?.try_collect().await?;
    let deck_results = db.collection::<StoryDeck>("storydecks").find(filter, None).await?.try_collect().await?;
    Ok((card_results, deck_results))
}

pub async fn update_record(
    db: &Database, record_type: &str, id: ObjectId, update: Document
) -> MdbResult<String> {
    let update_result = match record_type {
        "card" => db.collection::<StoryCard>("storycards").update_one(
            doc! { "_id": id }, update, None
        ).await?,
        "deck" => db.collection::<StoryDeck>("storydecks").update_one(
            doc! { "_id": id }, update, None
        ).await?,
        "transcript" => db.collection::<Transcript>("transcripts").update_one(
            doc! { "_id": id }, update, None
        ).await?,
        &_ => todo!()
    };
    Ok(format!("successfully updated {} record with id {}", update_result.modified_count, id.to_hex()))
}

pub async fn delete_record(
    db: &Database, record_type: &str, id: ObjectId
) -> MdbResult<String> {
    let delete_result = match record_type {
        "card" => db.collection::<StoryCard>("storycards").delete_one(
            doc! { "_id": id }, None
        ).await?,
        "deck" => db.collection::<StoryDeck>("storydecks").delete_one(
            doc! { "_id": id }, None
        ).await?,
        "transcript" => db.collection::<Transcript>("transcripts").delete_one(
            doc! { "_id": id }, None
        ).await?,
        &_ => todo!()
    };
    Ok(format!("successfully deleted {} record with id {}", delete_result.deleted_count, id.to_hex()))
}