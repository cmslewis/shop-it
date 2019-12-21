import React from "react";
import { InputGroup, FormGroup, ControlGroup, Button, Intent, Classes } from "@blueprintjs/core";
import "./App.scss";
import { ResultsPane } from "./components/ResultsPane";
import { Pitch, IChord, harmonize } from "./harmonization/harmonize";

const KeyCodes = {
  BACKSPACE: 8,
  ENTER: 13,
  SPACE: 32,
  ARROW_LEFT: 37,
  ARROW_DOWN: 40,
  DELETE: 46,
  DIGIT_3: 51,
  LETTER_A: 65,
  LETTER_B: 66,
  LETTER_G: 71,
};

const DEFAULT_MELODY: Pitch[] = ["E", "D", "C", "D", "E"];
const MAX_MELODY_LENGTH = 15;

interface IAppState {
  melodyInput: string;
  melodyNotes: Pitch[];
  results: IChord[][] | undefined;
  showMelodyLengthWarning: boolean;
}

export class App extends React.PureComponent<{}, IAppState> {
  public state: IAppState = {
    melodyInput: DEFAULT_MELODY.join(" "),
    melodyNotes: DEFAULT_MELODY,
    results: undefined,
    showMelodyLengthWarning: false,
  };

  public render() {
    const { showMelodyLengthWarning } = this.state;
    const intent = showMelodyLengthWarning ? Intent.WARNING : Intent.PRIMARY;
    const helperText = showMelodyLengthWarning
      ? "Melodies can't be longer than 15 notes—otherwise your browser may freeze."
      : "Accidentals like F# and Bb are supported. Melodies can be no longer than 15 notes."
    return (
      <div className="hz-app">
        <h1>BBS Chord Suggestions</h1>
        <FormGroup
          label="Enter a melody in C major:"
          helperText={helperText}
          intent={showMelodyLengthWarning ? Intent.WARNING : Intent.NONE}
        >
          <ControlGroup fill={true}>
            <InputGroup
              intent={intent}
              large={true}
              onChange={this.handleMelodyInputChange}
              onKeyDown={this.handleMelodyInputKeyDown}
              placeholder="Example: E D C D E E E D D D E C C"
              value={this.state.melodyInput}
            />
            <Button
              className={Classes.FIXED}
              disabled={showMelodyLengthWarning}
              intent={intent}
              icon="music"
              large={true}
              onClick={this.handleButtonClick}
            >
              Harmonize!
            </Button>
          </ControlGroup>
        </FormGroup>
        {this.maybeRenderResults()}
      </div>
    );
  }

  private handleMelodyInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    const melodyInput = this.getSanitizedMelodyInput((e.target as HTMLInputElement).value);
    this.setState({
      melodyInput,
      showMelodyLengthWarning: this.parseMelodyNotes(melodyInput).length > MAX_MELODY_LENGTH,
    });
  };

  private handleMelodyInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const keyCode = e.which;
    if (keyCode === KeyCodes.ENTER && !this.state.showMelodyLengthWarning) {
      this.handleButtonClick();
    } else {
      const isPitchBaseName = keyCode >= KeyCodes.LETTER_A && keyCode <= KeyCodes.LETTER_G;
      const isSharpSymbolKey = keyCode === KeyCodes.DIGIT_3;
      const isFlatSymbolKey = keyCode === KeyCodes.LETTER_B;
      const isSpaceBar = keyCode === KeyCodes.SPACE;
      const isArrowKey = keyCode >= KeyCodes.ARROW_LEFT && keyCode <= KeyCodes.ARROW_DOWN;
      const isBackspace = keyCode === KeyCodes.BACKSPACE;
      const isDelete = keyCode === KeyCodes.DELETE;

      if (
        !isPitchBaseName &&
        !isSharpSymbolKey &&
        !isFlatSymbolKey &&
        !isSpaceBar &&
        !isArrowKey &&
        !isBackspace &&
        !isDelete
      ) {
        e.preventDefault();
      }
    }
  };

  private handleButtonClick = () => {
    const { melodyInput } = this.state;
    const melody = this.parseMelodyNotes(melodyInput);
    // TODO: Validate pitches.
    this.setState({ results: harmonize(melody) });
  };

  private parseMelodyNotes(melodyString: string): Pitch[] {
    return melodyString.trim().split(/\s+/) as Pitch[];;
  }

  private getSanitizedMelodyInput(melodyInput: string): string {
    const result: string[] = [];
    for (let i = 0; i < melodyInput.length; i++) {
      let char = melodyInput[i].toUpperCase();
      if (char === "3") {
        char = "#";
      }
      if (i > 0 && isPitchName(char)) {
        result.push(" ");
      }
      if (char != " ") {
        result.push(char);
      }
    }
    return result.join("").trim();
  };

  private maybeRenderResults() {
    const { results } = this.state;
    return results === undefined ? undefined : <ResultsPane results={results}></ResultsPane>;
  }
}

function isPitchName(char: string) {
  return (
    char === "A" ||
    char === "B" ||
    char === "C" ||
    char === "D" ||
    char === "E" ||
    char === "F" ||
    char === "G"
  );
}
