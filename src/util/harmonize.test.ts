import { harmonize, Chord, Pitch, IChord } from "./harmonize";

describe("harmonize", () => {
    it("returns [] if no pitches", () => {
        runTest([], []);
    });

    it("returns [] if unrecognized first pitch", () => {
        runTest(["F#"], []);
    });

    it("returns 3 results for C", () => {
        const pitches: Pitch[] = ["C"];
        runTest(pitches, [[Chord.Am7], [Chord.C]]);
    });

    it("returns 2 results for DC", () => {
        runTest(["D", "C"], [[Chord.G7, Chord.Am7], [Chord.G7, Chord.C]]);
    });

    it("returns 3 results for EDC", () => {
        runTest(["E", "D", "C"], [
            [Chord.C, Chord.Bb7, Chord.C],
            [Chord.C, Chord.G7, Chord.Am7],
            [Chord.C, Chord.G7, Chord.C],
        ]);
    });

    it("returns [CM, G7, CM] and [CM, G7, Am] for EDC", () => {
        const pitches: Pitch[] = ["E", "D", "C", "D", "E", "E", "E", "D", "D", "D", "E", "G", "G"];
        const results = harmonize(pitches);
        console.log(`${results.length} results:\n${results.map(chords => `[${chords.map(c => c.name).join(",")}]`).join("\n")}`);
    });

    it("returns results for major scale (asc)", () => {
        const pitches: Pitch[] = ["C", "D", "E", "F", "G", "A", "B", "C"];
        const results = harmonize(pitches);
        printResult(pitches, results);
    });

    it.only("It Only Takes a Moment", () => {
        const pitches: Pitch[] = ["A", "G", "C", "D", "A", "G", "C", "D", "A", "G", "A", "B", "C"];
        const results = harmonize(pitches);
        printResult(pitches, results);
    });

});

function runTest(pitches: Pitch[], expected: IChord[][]) {
    const actual = harmonize(pitches);
    printResult(pitches, actual);

    const actualNames = actual.map(toNames);
    const expectedNames = expected.map(toNames);

    expect(actualNames).toEqual(expectedNames);
}

function toNames(chords: IChord[]) {
    return chords.map(c => c.name);
}

function printResult(pitches: Pitch[], result: IChord[][]) {
    const resultsString = result.map(chords => `  [${chords.map(c => c.name).join(",")}]`).join("\n");
    console.log(`Melody:\n  ${pitches.join(" ")}\n\n${result.length} Harmonizations (sorted lexicographically):\n${resultsString}`);
}
