use crate::db::{docs::Line, models::TranscriptWord};
use leopard::{Leopard, LeopardBuilder, LeopardError, LeopardTranscript, LeopardWord};
use std::env;
use std::path::Path;

pub struct Config {
    pub file_path: String,
    pub language: String,
}

impl Config {
    pub fn new(file_path: String, lang: Option<String>) -> Result<Config, &'static str> {
        if !Path::new(&file_path).is_file() {
            return Err("Path received is not a file or could not be reached due to permissions.");
        }
        let language = match lang {
            Some(value) => value,
            None => String::from("english"),
        };
        Ok(Config {
            file_path,
            language,
        })
    }

    pub fn from_cli(mut args: impl Iterator<Item = String>) -> Result<Config, &'static str> {
        args.next();

        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Invalid parameters: none provided"),
        };
        if !Path::new(&file_path).is_file() {
            return Err("Path parameter is not a file or could not accessible due to permissions.");
        }
        let language = match args.next() {
            Some(arg) => arg.to_lowercase(),
            None => String::from("english"),
        };

        Ok(Config {
            file_path,
            language,
        })
    }
}

pub fn transcribe_and_split(
    config: Config,
) -> Result<(String, Vec<Line>, Vec<TranscriptWord>), String> {
    let transcript_result = match config.language.as_ref() {
        "english" => match picovoice_transcribe(&config.file_path) {
            Ok(transcript) => transcript,
            Err(e) => return Err(format!("transcription failed with error: {:?}", e)),
        },
        _ => {
            return Err(String::from(
                "Non-english transcription not yet implemented.",
            ))
        }
    };
    let transcript_words = transcript_result
        .words
        .iter()
        .map(|leopard_word| TranscriptWord::from(leopard_word))
        .collect::<Vec<TranscriptWord>>();
    let lines_vec = convert_to_lines(transcript_result.words);

    Ok((transcript_result.transcript, lines_vec, transcript_words))
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
    let mut line_in_progress = Line {
        start_time: 0.0,
        end_time: 0.0,
        line: String::new(),
    };
    for (i, word) in words {
        line_in_progress.line.push_str(&word.word);
        line_in_progress.line.push(' ');
        if (i + 1) % 40 == 0 || i == transcript_words.len() - 1 {
            line_in_progress.end_time = word.end_sec;
            lines.push(line_in_progress.clone());
            if i < transcript_words.len() - 1 {
                line_in_progress.start_time = line_in_progress.end_time;
                line_in_progress.line = String::new();
            }
        }
    }
    lines
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn transcript_text_word_count_same_as_words_vec() {
        let path = Path::new("test_media/test.wav");
        let test_config = Config::new(String::from(path.to_string_lossy()), None).unwrap();
        let transcription_result = transcribe_and_split(test_config).unwrap();
        let mut count = 0;
        transcription_result
            .0
            .split_whitespace()
            .for_each(|_| count += 1);
        assert_eq!(count, transcription_result.2.len())
    }
}
