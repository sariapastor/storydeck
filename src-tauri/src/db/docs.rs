use std::path::{Path, PathBuf};
use std::fs;
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
    pub filename: String,
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
    pub fn from_name_and_path(name: &str, path: String) -> Result<Self, String> {
        let file_path = Path::new(&path);
        let mut data_path = tauri::api::path::document_dir().expect("failed to return Documents path");
        data_path.push("StoryDecks");
        let filename = Self::store_recording(file_path, data_path)?;

        Ok(Recording {
            id: ObjectId::new(),
            name: name.to_owned(),
            filename,
            participants: Vec::new(),
            date_recorded: Some(Utc::now()),
            recording_location: None,
            transcript_status: TranscriptStatus::Processing,
            transcript: None
        })
    }

    fn store_recording(src_path: &Path, mut dest_path: PathBuf) -> Result<String, String> {
        if let Some(file_as_osstr) = src_path.file_name() {
            let filename = file_as_osstr.to_string_lossy();
            dest_path.push(filename.as_ref());
            match fs::copy(src_path, dest_path) {
                Ok(_) => Ok(filename.to_string()),
                Err(e) => Err(format!("failed to copy recording file with error: {}", e))
            }
        } else {
            Err(String::from("unable to parse file name from provided path"))
        }
    }

    pub fn rename_recording(&self, new_name: &str) -> Result<String, String> {
        let mut data_path = tauri::api::path::document_dir().expect("failed to return Documents path");
        data_path.push("StoryDecks");
        let src_path: PathBuf = [&data_path, &PathBuf::from(&self.filename)].iter().collect();
        let dest_path: PathBuf = [&data_path, &PathBuf::from(new_name)].iter().collect();
        match fs::rename(src_path, dest_path) {
            Ok(_) => Ok(format!("file successfully renamed: {}", new_name)),
            Err(e) => Err(format!("failed to rename file with error: {}", e))
        }
    }
}
