import { ObjectIdExtended } from 'bson';

interface Person {
    _id: ObjectIdExtended;
    name: string;
    notes?: string;
}

interface Tag {
    _id: ObjectIdExtended;
    name: string;
}

export enum TranscriptStatus {
    Processing,
    Complete,
    Error
}

export interface NewRecordingInfo {
    name: string;
    recordingFilePath: string;
}

export interface Recording {
    _id: ObjectIdExtended;
    name: string;
    filename: string;
    participants: Person[];
    dateRecorded?: Date;
    recordingLocation: StoryLocation;
    transcriptStatus: TranscriptStatus;
    transcript?: ObjectIdExtended;
}

interface StoryLocation {
    name: string;
    locData?: { gType: string; coordinates: number[][][]; };
}

export interface Telling {
    _id: ObjectIdExtended;
    name: string;
    decks: ObjectIdExtended[];
    description?: string;
    people?: Person[];
    places?: StoryLocation[];
    notes?: string;
    tags?: Tag[];
    recording: Recording;
}

interface Line {
    startTime: number;
    endTime: number;
    line: string;
}

export interface Transcript {
    _id: ObjectIdExtended;    
    language: string;
    text: string;
    lines: Line[];
}

export interface StoryDeck {
    _id: ObjectIdExtended;
    name: string;
    description?: string;
    notes?: string;
    tags?: Tag[];
    cards: Telling[];
}

export interface ViewState {
    view: "loading" | "single-card" | "single-deck" | "decks-overview" | "full-transcript";
    activeDeck?: ObjectIdExtended;
    activeCard?: ObjectIdExtended;
    activeTranscript?: ObjectIdExtended;
}

export type DBRecord = Telling | StoryDeck | Transcript | Person | Tag;