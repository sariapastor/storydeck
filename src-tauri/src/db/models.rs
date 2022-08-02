use serde::{Serialize, Deserialize};
use mongodb::bson::{Bson, oid::ObjectId};
use chrono::Utc;
use db::docs::*;

#[derive(Serialize, Deserialize, Debug)]
pub enum StoryCard {
    Template(Plan),
    Telling(Take)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Plan {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub decks: Vec<ObjectId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    pub planned_recordings: Vec<PlannedRecording>,
}

impl Plan {
    // TODO: Refactor these into one method
    fn people(&self) -> Vec<Person> {
        self.planned_recordings.iter().map(|pr| {
            if let Some(people) = pr.people {
                people.iter()
            }
        }).collect()
    }
    
    fn places(&self) -> Vec<Location> {
        self.planned_recordings.iter().map(|pr| {
            if let Some(places) = pr.places {
                places.iter()
            }
        }).collect()
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Take {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub decks: Vec<ObjectId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub people: Option<Vec<Person>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub places: Option<Vec<Location>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Vec<Tag>,
    pub recording: Recording,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct StoryDeck {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub cards: Vec<ObjectId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Vec<Tag>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Transcript {
    #[serde(rename = "_id")]
    pub id: ObjectId,    
    pub language: String,
    pub text: Vec<Line>,
}