use serde::{Serialize, Deserialize};
use mongodb::bson::oid::ObjectId;
use bson::Bson;
use chrono::{serde::ts_seconds_option, DateTime, Utc};

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
    #[serde(rename = "locData")]
    pub loc_data: Option<MdbGeoData>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MdbGeoData {
    #[serde(rename = "type")]
    pub g_type: String,
    pub coordinates: Vec<Vec<Vec<Bson>>>
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
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
    pub tags: Option<Vec<Tag>>,
}

impl PlannedRecording {
    pub fn from_name(name: &str) -> Self {
        PlannedRecording {
            id: ObjectId::new(),
            name: name.to_owned(),
            description: None,
            people: None,
            places: None,
            notes: None,
            tags: None
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub enum TranscriptStatus {
    Processing,
    Complete,
    Error,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Recording {
    #[serde(rename = "_id")]
    pub id: ObjectId,
    pub name: String,
    pub file_path: String,
    pub participants: Vec<Person>,
    #[serde(skip_serializing_if = "Option::is_none", with = "ts_seconds_option")]
    pub date_recorded: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub recording_location: Option<Location>,
    pub transcript_status: TranscriptStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub transcript: Option<ObjectId>,
}

impl Recording {
    pub fn from_name_and_path(name: &str, file_path: String) -> Self {
        Recording {
            id: ObjectId::new(),
            name: name.to_owned(),
            file_path,
            participants: Vec::new(),
            date_recorded: Some(Utc::now()),
            recording_location: None,
            transcript_status: TranscriptStatus::Processing,
            transcript: None
        }
    }
}
