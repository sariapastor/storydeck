use serde::{Serialize, Deserialize};
use mongodb::bson::oid::ObjectId;
use super::docs::*;

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
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
    pub fn people(&self) -> Vec<&Person> {
        self.planned_recordings.iter()
            .filter(|pr| !pr.people.is_none())
            .flat_map(|pr| pr.people.as_ref().unwrap().into_iter())
            .collect()
    }
    
    pub fn places(&self) -> Vec<&Location> {
        self.planned_recordings.iter()
            .filter(|pr| !pr.places.is_none())
            .flat_map(|pr| pr.places.as_ref().unwrap().into_iter())
            .collect()
    }
}

// #[skip_serializing_none]
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
    pub tags: Option<Vec<Tag>>,
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
    pub tags: Option<Vec<Tag>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Transcript {
    #[serde(rename = "_id")]
    pub id: ObjectId,    
    pub language: String,
    pub text: Vec<Line>,
}