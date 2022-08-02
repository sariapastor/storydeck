use serde::{Serialize, Deserialize};
use mongodb::bson::{Bson, oid::ObjectId};
use chrono::Utc;

#[derive(Serialize, Deserialize, Debug)]
pub struct Tag {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Person {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub notes: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Location {
    pub name: String,
    pub loc_data: Option<String>, //Placeholder for eventual location data type
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Line {
    pub start_time: f32, // start and end time
    pub end_time: f32,   // in seconds as floats
    pub line: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PlannedRecording {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
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
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Recording {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub file_path: String,
    pub participants: Vec<Person>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub date_recorded: Option<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recording_location: Option<Location>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transcript: Option<ObjectId>,
}