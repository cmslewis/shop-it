import { harmonize, Chord, Pitch, IChord, MelodyNote } from "./harmonize";

describe.skip("harmonize", () => {
    it("returns [] if no pitches", () => {
        runTest([], []);
    });

    it("returns [] if unrecognized first pitch", () => {
        runTest(["F#"], []);
    });

    it("returns 3 results for C", () => {
        const pitches: MelodyNote[] = ["C"];
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
        const pitches: MelodyNote[] = ["E", "D", "C", "D", "E", "E", "E", "D", "D", "D", "E", "G", "G"];
        const results = harmonize(pitches);
        console.log(`${results.length} results:\n${results.map(chords => `[${chords.map(c => c.name).join(",")}]`).join("\n")}`);
    });

    it("returns results for major scale (asc)", () => {
        const pitches: MelodyNote[] = [{ pitch: "C", chord: Chord.C }, "D", "E", "F", "G", "A", "B", { pitch: "C", chord: Chord.C }];
        const results = harmonize(pitches);
        printResult(pitches, results);
    });

    it("It Only Takes a Moment", () => {
        const pitches: MelodyNote[] = ["A", "G", { pitch: "C", chord: Chord.C }, "C", "D", "A", "G", { pitch: "C", chord: Chord.C }, "C", "D", "A", "G", "G", "A", "B", "C", "C#", "C#", "C#", "C#", { pitch: "D", chord: Chord.Dm7 }];
        const results = harmonize(pitches);
        printResult(pitches, results);
    });

    it("chromatic scale", () => {
        const pitches: MelodyNote[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G"];
        const results = harmonize(pitches);
        printResult(pitches, results);
    });
});

function runTest(pitches: MelodyNote[], expected: IChord[][]) {
    const actual = harmonize(pitches);
    printResult(pitches, actual);

    const actualNames = actual.map(toNames);
    const expectedNames = expected.map(toNames);

    expect(actualNames).toEqual(expectedNames);
}

function toNames(chords: IChord[]) {
    return chords.map(c => c.name);
}

function printResult(pitches: MelodyNote[], result: IChord[][]) {
    const pitchesStr = pitches.map(p => typeof p === "string" ? p : p.chord != null ? `${p.pitch}(${p.chord.name})` : p.pitch).join(" ");
    const resultsString = result.map(chords => `  [${chords.map(c => c.name).join(",")}]`).join("\n");
    console.log(`Melody:\n  ${pitchesStr}\n\n${result.length} Harmonizations (sorted lexicographically):\n${resultsString}`);
}
