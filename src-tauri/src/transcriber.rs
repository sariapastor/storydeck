use std::env;
use leopard::{Leopard, LeopardBuilder, LeopardError, LeopardTranscript, LeopardWord};
use crate::db::docs::Line;

pub struct Config {
    pub language: String,
    pub file_path: String,
}

impl Config {
    pub fn new(language: String, file_path: String) -> Result<Config, &'static str> {
        // TODO: perform some validation on the file path and return Err if invalid
        Ok(Config { language, file_path })
    }

    pub fn from_cli(mut args: impl Iterator<Item = String>) -> Result<Config, &'static str> {
        args.next();

        let language = match args.next() {
            Some(arg) => arg.to_lowercase(),
            None => return Err("Invalid parameters: none provided"),
        };

        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Invalid parameters: missing a file path or language"),
        };
        // TODO: perform some validation on the file path and return Err if invalid

        Ok(Config { language, file_path })
    }

    pub fn from_path(file_path: String) -> Result<Config, &'static str> {
        // TODO: perform some validation on the file_path and return Err if invalid
        Ok(Config { language: String::from("english"), file_path })
    }
}

pub fn transcribe_and_split(config: Config) -> Result<(String, Vec<Line>), String> {
    let transcript_result = match config.language.as_ref() {
        "english" => {
            match picovoice_transcribe(&config.file_path) {
                Ok(transcript) => transcript,
                Err(e) => return Err(format!("transcription failed with error: {:?}", e))
            }},
        _ => return Err(String::from("Non-english transcription not yet implemented."))
    };
    let full_transcript = transcript_result.transcript;
    let lines_vec = convert_to_lines(transcript_result.words);

    Ok((full_transcript, lines_vec))
}

fn picovoice_transcribe(file_path: &str) -> Result<LeopardTranscript, LeopardError> {
    let access_key = env::var("PV_KEY").expect("PV_KEY must be set");

    let leopard: Leopard = LeopardBuilder::new()
        .access_key(access_key)
        .enable_automatic_punctuation(true)
        .init()?;
    
    leopard.process_file(file_path)
}

fn convert_to_lines(transcript_words: Vec<LeopardWord>) -> Vec<Line> {
    let words = transcript_words.iter().enumerate();
    let mut lines = Vec::new();
    let mut line_in_progress = Line {start_time: 0.0, end_time: 0.0, line: String::new()};
    for (i, word) in words {
        line_in_progress.end_time = word.end_sec;
        line_in_progress.line.push_str(&word.word);
        line_in_progress.line.push(' ');
        if (i+1) % 40 == 0 {
            lines.push(line_in_progress.clone());
            line_in_progress.start_time = line_in_progress.end_time;
            line_in_progress.line = String::new();
        }
    }
    lines.push(line_in_progress);
    lines
}