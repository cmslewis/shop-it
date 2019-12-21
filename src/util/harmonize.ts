
export type Pitch = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "Ab" | "A" | "A#" | "Bb" | "B" | "C";
export type ChordName = "C" | "C7" | "Dm7" | "D7" | "Em7" | "E" | "F7" | "G7" | "A7" | "Am7" | "Bb7" | "B7";

type IChordProgressionBigram = [IChord, IChord];

export interface IChord {
    pitches: Pitch[]; // stored in sorted order
    name: string; // e.g. Gm7
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
    Dm7: {
        pitches: ["D", "F", "A", "C"],
        name: "Dm7",
    },
    D7: {
        pitches: ["D", "F#", "A", "C"],
        name: "D7",
    },
    Em7: {
        pitches: ["E", "G", "B", "D"],
        name: "Em7",
    },
    E: {
        pitches: ["E", "G#", "B"],
        name: "E",
    },
    F7: {
        pitches: ["F", "A", "C", "Bb"],
        name: "F7",
    },
    G7: {
        pitches: ["G", "B", "D", "F"],
        name: "G7",
    },
    A7: {
        pitches: ["A", "C#", "E", "G"],
        name: "A7",
    },
    Am7: {
        pitches: ["A", "C", "E", "G"],
        name: "Am7",
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

const rules: IChordProgressionBigram[] = [
    [Chord.C, Chord.Dm7],
    [Chord.C, Chord.D7],
    [Chord.C, Chord.Em7],
    [Chord.C, Chord.E],
    [Chord.C, Chord.F7],
    [Chord.C, Chord.G7],
    [Chord.C, Chord.Am7],
    [Chord.C, Chord.A7],
    [Chord.C, Chord.Bb7],
    [Chord.C, Chord.B7],
    [Chord.C, Chord.C7],

    [Chord.C7, Chord.F7],

    [Chord.Dm7, Chord.G7],
    [Chord.D7, Chord.G7],

    [Chord.Em7, Chord.Am7],
    [Chord.Em7, Chord.A7],

    [Chord.F7, Chord.Bb7],
    [Chord.F7, Chord.C7],

    [Chord.G7, Chord.Am7],
    [Chord.G7, Chord.C],
    [Chord.G7, Chord.B7],

    [Chord.Am7, Chord.D7],
    [Chord.Am7, Chord.C],
    [Chord.A7, Chord.D7],

    [Chord.Bb7, Chord.C7],
    [Chord.Bb7, Chord.C],
    [Chord.Bb7, Chord.B7],

    [Chord.B7, Chord.C7],
    [Chord.B7, Chord.C],
];

const ValidFirstChords = new Set<IChord>([Chord.C, Chord.Am7]);
const ValidLastChords = new Set<IChord>([Chord.C, Chord.G7]);

let p2c: Map<string, Set<IChord>>;
let c2c: Map<string, Set<IChord>>;

function buildMaps(rules: IChordProgressionBigram[]) {
    p2c = new Map();
    c2c = new Map();

    for (const chord of Object.values(Chord)) {
        for (const pitch of chord.pitches) {
            if (!p2c.has(pitch)) {
                p2c.set(pitch, new Set<IChord>());
            }
            p2c.get(pitch)!.add(chord);
        }
        // Let every chord progress to itself without an explicit rule.
        c2c.set(chord.name, new Set([chord]));
    }

    for (const [from, to] of rules) {
        c2c.get(from.name)!.add(to);
    }
}

buildMaps(rules);

export function harmonize(pitches: Pitch[]): IChord[][] {
    const result: IChord[][] = [];
    harmonizeRec(pitches, [], result);
    return result.sort(chordListComparator);
}

function harmonizeRec(pitches: Pitch[], chordsSoFar: IChord[], out: IChord[][]): void {
    if (pitches.length === 0) {
        return;
    }

    const chordsWithPitch = getChordsContainingPitch(pitches[0]);
    const chordsFromPrev = getChordsFollowingFinalChord(chordsSoFar);
    const chordsToConsider = chordsSoFar.length === 0 ? chordsWithPitch : setIntersect(chordsWithPitch, chordsFromPrev);

    if (pitches.length === 1) {
        for (const c of chordsToConsider) {
            if (ValidLastChords.has(c)) {
                out.push([...chordsSoFar, c]);
            }
        }
    } else {
        const remainingPitches = pitches.slice(1);
        for (const c of chordsToConsider) {
            if (chordsSoFar.length !== 0 || ValidFirstChords.has(c)) {
                harmonizeRec(remainingPitches, [...chordsSoFar, c], out);
            }
        }
    }
}

function getChordsContainingPitch(pitch: Pitch): Set<IChord> {
    return p2c.get(pitch) || new Set();
}

function getChordsFollowingFinalChord(chords: IChord[]): Set<IChord> {
    if (chords.length === 0) {
        return new Set();
    }
    return c2c.get(chords[chords.length - 1].name) || new Set();
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
