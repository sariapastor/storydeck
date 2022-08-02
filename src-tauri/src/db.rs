use std::env;
use mongodb::bson::{self, doc, oid::ObjectId}; 
use mongodb::{options::ClientOptions, Client, Database};
use mongodb::error::Result as MdbResult;
use futures::stream::TryStreamExt;
use chrono::Utc;

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
    client.database("capstone_project")
}