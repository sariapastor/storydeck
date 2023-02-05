use super::docs::*;
use leopard::LeopardWord;
use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptWord {
    pub word: String,
    pub start_time: f32,
    pub end_time: f32,
    pub confidence: f32,
}

impl From<&LeopardWord> for TranscriptWord {
    fn from(value: &LeopardWord) -> Self {
        TranscriptWord {
            word: value.word.clone(),
            start_time: value.start_sec,
            end_time: value.end_sec,
            confidence: value.confidence,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type")]
pub enum StoryCard {
    Template(Plan),
    Telling(Take),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Plan {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub decks: Vec<ObjectId>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(rename = "plannedRecordings")]
    pub planned_recordings: Vec<PlannedRecording>,
}

impl Plan {
    pub fn people(&self) -> Vec<&Person> {
        self.planned_recordings
            .iter()
            .filter(|pr| pr.people.is_some())
            .flat_map(|pr| pr.people.as_ref().unwrap().iter())
            .collect()
    }

    pub fn places(&self) -> Vec<&Location> {
        self.planned_recordings
            .iter()
            .filter(|pr| pr.places.is_some())
            .flat_map(|pr| pr.places.as_ref().unwrap().iter())
            .collect()
    }
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
pub struct Take {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub decks: Vec<ObjectId>,
    pub description: Option<String>,
    pub people: Option<Vec<Person>>,
    pub places: Option<Vec<Location>>,
    pub notes: Option<String>,
    pub tags: Option<Vec<Tag>>,
    pub recording: Recording,
}

#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
pub struct StoryDeck {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub description: Option<String>,
    pub notes: Option<String>,
    pub tags: Option<Vec<Tag>>,
}

impl StoryDeck {
    pub fn from_name(name: &str) -> Self {
        StoryDeck {
            id: ObjectId::new(),
            name: name.to_owned(),
            // cards: Vec::new(),
            description: None,
            notes: None,
            tags: None,
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Transcript {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub language: String,
    pub text: String,
    pub lines: Vec<Line>,
    pub words: Vec<TranscriptWord>,
}
