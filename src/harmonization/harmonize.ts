
export type Pitch = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "Ab" | "A" | "A#" | "Bb" | "B" | "C";
export type ChordName = "C" | "C7" | "Csharp7" | "Dm7" | "D7" | "Dsharp7" | "Em7" | "E7" | "F7" | "Fsharp7" | "G7" | "Gsharp7" | "A7" | "Am7" | "Asharp7" | "Bb7" | "B7";

type IChordProgressionBigram = [IChord, IChord];

export interface IChord {
    pitches: Pitch[]; // stored in sorted order
    name: string; // e.g. Gm7
}

export type MelodyNote = Pitch | {
    pitch: Pitch;
    chord?: IChord;
}

export const Chord: Record<ChordName, IChord> = {
    C: {
        pitches: ["C", "E", "G"],
        name: "C",
    },
    C7: {
        pitches: ["C", "E", "G", "Bb"],
        name: "C7",
    },
    Csharp7: {
        pitches: ["C#", "F" /* E#. TODO: Enharmonic spelling. */, "G#", "B"],
        name: "C#7",
    },
    Dm7: {
        pitches: ["D", "F", "A", "C"],
        name: "Dm7",
    },
    D7: {
        pitches: ["D", "F#", "A", "C"],
        name: "D7",
    },
    Dsharp7: {
        pitches: ["D#", "G" /* F## */, "A#", "C#"],
        name: "D#7",
    },
    Em7: {
        pitches: ["E", "G", "B", "D"],
        name: "Em7",
    },
    E7: {
        pitches: ["E", "G#", "B", "D"],
        name: "E7",
    },
    F7: {
        pitches: ["F", "A", "C", "Bb"],
        name: "F7",
    },
    Fsharp7: {
        pitches: ["F#", "A#", "C#", "E"],
        name: "F#7",
    },
    G7: {
        pitches: ["G", "B", "D", "F"],
        name: "G7",
    },
    Gsharp7: {
        pitches: ["G#", "C" /* B# */, "D#", "F#"],
        name: "G#7",
    },
    Am7: {
        pitches: ["A", "C", "E", "G"],
        name: "Am7",
    },
    A7: {
        pitches: ["A", "C#", "E", "G"],
        name: "A7",
    },
    Asharp7: {
        pitches: ["A#", "D" /* C## */, "F" /** E# */, "G#"],
        name: "A#7",
    },
    Bb7: {
        pitches: ["Bb", "D", "F", "Ab"],
        name: "Bb7",
    },
    B7: {
        pitches: ["B", "D#", "F#", "A"],
        name: "B7",
    },
};

type RulesList = IChordProgressionBigram[];

/**
 * Assuming C Major, you can go pretty much anywhere from a C major chord.
 */
const RootDeparturesRules: RulesList = [
    [Chord.C, Chord.C7],
    [Chord.C, Chord.Dm7],
    [Chord.C, Chord.D7],
    [Chord.C, Chord.Em7],
    [Chord.C, Chord.E7],
    [Chord.C, Chord.F7],
    [Chord.C, Chord.Fsharp7],
    [Chord.C, Chord.G7],
    [Chord.C, Chord.Am7],
    [Chord.C, Chord.A7],
    [Chord.C, Chord.Bb7],
    [Chord.C, Chord.B7],
];

/**
 * Follow the circle of fifths. Secondary dominants always resolve to their
 * corresponding root. Allow for both Mm7 (dominant 7) and m7 variants.
*/
const CircleOfFifthsRules: RulesList = [
    //   (V7 -> V7)
    [Chord.C7, Chord.F7],
    [Chord.F7, Chord.Bb7],
    [Chord.Bb7, Chord.Asharp7], // HACKHACK: Handle enharmonically identical chords.
    [Chord.Asharp7, Chord.Bb7],
    [Chord.Asharp7, Chord.Dsharp7],
    [Chord.Dsharp7, Chord.Gsharp7],
    [Chord.Gsharp7, Chord.Csharp7],
    [Chord.Csharp7, Chord.Fsharp7],
    [Chord.Fsharp7, Chord.B7],
    [Chord.B7, Chord.E7],
    [Chord.E7, Chord.A7],
    [Chord.A7, Chord.D7],
    [Chord.D7, Chord.G7],
    [Chord.G7, Chord.C],
    [Chord.G7, Chord.C7],

    //   (v7 -> V7)
    [Chord.Am7, Chord.D7],
    [Chord.Dm7, Chord.G7],
    [Chord.Em7, Chord.A7],

    //   (v7 -> v7)
    [Chord.Em7, Chord.Am7],

    //   (V7 -> v7)
    [Chord.A7, Chord.Dm7],
];

/**
 * Rise and fall by a half step to handle tricky half-step motion in the melody.
*/
const HalfStepStrictRules: RulesList = [
    [Chord.Dsharp7, Chord.D7],
    [Chord.Dsharp7, Chord.Dm7],
    [Chord.F7, Chord.Fsharp7],
    [Chord.Fsharp7, Chord.F7],
    [Chord.Fsharp7, Chord.G7],
    [Chord.Bb7, Chord.B7],
    [Chord.B7, Chord.C],
    [Chord.B7, Chord.C7],
];

/**
 * Half-step motions that should only be used in a pinch. Enabling all of these
 * may pollute the results too much, so they're disabled by default.
*/
const HalfStepLooseRules: RulesList = [
    [Chord.C7, Chord.Csharp7],
    [Chord.Csharp7, Chord.D7],
    [Chord.D7, Chord.Dsharp7],
    [Chord.Dsharp7, Chord.E7],
    [Chord.E7, Chord.F7],
    [Chord.F7, Chord.Fsharp7],
    [Chord.Fsharp7, Chord.G7],
    [Chord.G7, Chord.Gsharp7],
    [Chord.Gsharp7, Chord.A7],
    [Chord.A7, Chord.Asharp7],
    [Chord.A7, Chord.Bb7], // HACKHACK: Enharmonic equivalent
];

/**
 * Whole step motions. These are particularly useful to and from the tonic.
*/
const WholeStepRules: RulesList = [
    [Chord.C, Chord.D7],
    [Chord.Bb7, Chord.C],
    [Chord.Bb7, Chord.C7],
    [Chord.D7, Chord.C],
    [Chord.D7, Chord.C7],
    // This is also seen on occasion, but is omitted for now to reduce noise:
    // [Chord.F7, Chord.G7],
];

const DeceptiveCadenceRules: RulesList = [
    [Chord.G7, Chord.Am7],
];

const MinorThirdRules: RulesList = [
    [Chord.Am7, Chord.C],
    [Chord.Am7, Chord.C7],
];

const MajorThirdRules: RulesList = [
    [Chord.G7, Chord.B7],
];

const TritoneSubstitutionRules: RulesList = [
    [Chord.C7, Chord.Fsharp7],
    [Chord.Csharp7, Chord.G7],
    [Chord.D7, Chord.Gsharp7],
    [Chord.Dsharp7, Chord.A7],
    [Chord.E7, Chord.Asharp7],
    [Chord.E7, Chord.Bb7], // HACKHACK: Enharmonic equivalent
    [Chord.F7, Chord.B7],
    [Chord.Fsharp7, Chord.C],
    [Chord.Fsharp7, Chord.C7],
    [Chord.G7, Chord.Csharp7],
    [Chord.Gsharp7, Chord.D7],
    [Chord.A7, Chord.Dsharp7],
    [Chord.Asharp7, Chord.E7],
    [Chord.Bb7, Chord.E7], // HACKHACK: Enharmonic equivalent
    [Chord.B7, Chord.F7],
];

const PerfectFourthRules: RulesList = [
    [Chord.F7, Chord.C7],
];

const basicRules: IChordProgressionBigram[] = [
    ...RootDeparturesRules,
    ...CircleOfFifthsRules,
];

const allRules: IChordProgressionBigram[] = [
    ...RootDeparturesRules,
    ...CircleOfFifthsRules,
    ...DeceptiveCadenceRules,
    ...HalfStepStrictRules,
    ...HalfStepLooseRules, // Disabled by default;
    ...WholeStepRules,
    ...MinorThirdRules,
    ...MajorThirdRules,
    ...PerfectFourthRules,
    ...TritoneSubstitutionRules,
];

const ValidFirstChords = new Set<IChord>([Chord.C, Chord.Am7, Chord.G7]);

let p2c: Map<string, Set<IChord>> = new Map();
let c2c_all: Map<string, Set<IChord>> = new Map();
let c2c_basic: Map<string, Set<IChord>> = new Map();

function buildP2CMap() {
    for (const chord of Object.values(Chord)) {
        for (const pitch of chord.pitches) {
            if (!p2c.has(pitch)) {
                p2c.set(pitch, new Set<IChord>());
            }
            p2c.get(pitch)!.add(chord);
        }
    }
}

function buildC2CMap(rules: IChordProgressionBigram[], c2c: Map<string, Set<IChord>>) {
    for (const chord of Object.values(Chord)) {
        // Let every chord progress to itself without an explicit rule.
        c2c.set(chord.name, new Set([chord]));
    }

    for (const [from, to] of rules) {
        c2c.get(from.name)!.add(to);
    }
}

buildP2CMap();
buildC2CMap(allRules, c2c_all);
buildC2CMap(basicRules, c2c_basic);

export function harmonize(melodyNotes: MelodyNote[], circleOfFifthsOnly = false): IChord[][] {
    const result: IChord[][] = [];
    harmonizeRec(melodyNotes, [], circleOfFifthsOnly, result);
    return result.sort(chordListComparator);
}

function harmonizeRec(melodyNotes: MelodyNote[], chordsSoFar: IChord[], circleOfFifthsOnly: boolean, out: IChord[][]): void {
    if (melodyNotes.length === 0) {
        return;
    }

    const firstMelodyNote = melodyNotes[0];
    const firstPitch = isMelodyNoteString(firstMelodyNote) ? firstMelodyNote : firstMelodyNote.pitch;

    const chordsWithPitch = getChordsContainingPitch(firstPitch);
    const chordsFromPrev = getChordsFollowingFinalChord(chordsSoFar, circleOfFifthsOnly);

    let chordsToConsider = chordsSoFar.length === 0 ? chordsWithPitch : setIntersect(chordsWithPitch, chordsFromPrev);
    if (!isMelodyNoteString(firstMelodyNote) && firstMelodyNote.chord != null) {
        chordsToConsider = setIntersect(chordsToConsider, new Set([firstMelodyNote.chord]));
    }

    if (melodyNotes.length === 1) {
        for (const c of chordsToConsider) {
            out.push([...chordsSoFar, c]);
        }
    } else {
        const remainingMelodyNotes = melodyNotes.slice(1);
        for (const c of chordsToConsider) {
            if (chordsSoFar.length !== 0 || ValidFirstChords.has(c) || (typeof firstMelodyNote !== "string" && c === firstMelodyNote.chord)) {
                harmonizeRec(remainingMelodyNotes, [...chordsSoFar, c], circleOfFifthsOnly, out);
            }
        }
    }
}

function getChordsContainingPitch(pitch: Pitch): Set<IChord> {
    return p2c.get(pitch) || new Set();
}

function getChordsFollowingFinalChord(chords: IChord[], circleOfFifthsOnly: boolean): Set<IChord> {
    if (chords.length === 0) {
        return new Set();
    }
    const c2cMap = circleOfFifthsOnly ? c2c_basic : c2c_all;
    return c2cMap.get(chords[chords.length - 1].name) || new Set();
}

function setIntersect<T>(a: Set<T>, b: Set<T>) {
    const result = new Set<T>();
    a.forEach(value => {
        if (b.has(value)) {
            result.add(value);
        }
    });
    return result;
}

function chordListComparator(a: IChord[], b: IChord[]) {
    const minLength = Math.min(a.length, b.length);
    // March in lockstep through each list until we find two chords whose names
    // don't match lexicographically, then use normal tie-breaking logic for
    // sorting in ascending order.
    for (let i = 0; i < minLength; i++) {
        const chordA: string = a[i].name;
        const chordB: string = b[i].name;
        if (chordA < chordB) {
            return -1;
        } else if (chordA > chordB) {
            return 1;
        }
    }
    return 0;
}

function isMelodyNoteString(melodyNote: MelodyNote): melodyNote is Pitch {
    return typeof melodyNote === "string";
}