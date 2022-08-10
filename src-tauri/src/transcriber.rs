use std::env;
use leopard::{Leopard, LeopardBuilder, LeopardError, LeopardTranscript, LeopardWord};
use crate::db::docs::Line;

pub struct Config {
    pub language: String,
    pub filename: String,
}

impl Config {
    pub fn new(language: String, filename: String) -> Result<Config, &'static str> {
        // TODO: perform some validation on the filename and return Err if invalid
        Ok(Config { language, filename })
    }

    pub fn from_cli(mut args: impl Iterator<Item = String>) -> Result<Config, &'static str> {
        args.next();

        let language = match args.next() {
            Some(arg) => arg.to_lowercase(),
            None => return Err("Invalid parameters: none provided"),
        };

        let filename = match args.next() {
            Some(arg) => arg,
            None => return Err("Invalid parameters: missing a filename or language"),
        };
        // TODO: perform some validation on the filename and return Err if invalid

        Ok(Config { language, filename })
    }

    pub fn from_filename(filename: String) -> Result<Config, &'static str> {
        // TODO: perform some validation on the filename and return Err if invalid
        Ok(Config { language: String::from("english"), filename })
    }
}

pub fn transcribe_and_split(config: Config) -> Result<(String, Vec<Line>), String> {
    let transcript_result = match config.language.as_ref() {
        "english" => {
            match picovoice_transcribe(&config.filename) {
                Ok(transcript) => transcript,
                Err(e) => return Err(format!("transcription failed with error: {:?}", e))
            }},
        _ => return Err(String::from("Non-english transcription not yet implemented."))
    };
    let full_transcript = transcript_result.transcript;
    let lines_vec = convert_to_lines(transcript_result.words);

    Ok((full_transcript, lines_vec))
}

fn picovoice_transcribe(filename: &str) -> Result<LeopardTranscript, LeopardError> {
    #[cfg(not(debug_assertions))]
    let access_key = env!("PV_KEY", "PV_KEY must be set");
    
    #[cfg(debug_assertions)]
    let access_key = env::var("PV_KEY").expect("PV_KEY must be set");

    let leopard: Leopard = LeopardBuilder::new()
        .access_key(access_key)
        .enable_automatic_punctuation(true)
        .init()?;
    
    leopard.process_file(filename)
}

fn convert_to_lines(transcript_words: Vec<LeopardWord>) -> Vec<Line> {
    let words = transcript_words.iter().enumerate();
    let mut lines = Vec::new();
    let mut line_in_progress = Line {start_time: 0.0, end_time: 0.0, line: String::new()};
    for (i, word) in words {
        line_in_progress.end_time = word.end_sec;
        line_in_progress.line.push_str(&word.word);
        line_in_progress.line.push(' ');
        if (i+1) % 60 == 0 {
            lines.push(line_in_progress.clone());
            line_in_progress.start_time = line_in_progress.end_time;
            line_in_progress.line = String::new();
        }
    }
    lines.push(line_in_progress);
    lines
}