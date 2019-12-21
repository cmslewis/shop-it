import React from "react";
import { InputGroup, FormGroup, ControlGroup, Button, Intent, Classes, Position, Menu, MenuItem, Popover } from "@blueprintjs/core";
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
  LETTER_V: 86,
};

const DEFAULT_MELODY: Pitch[] = ["E", "D", "C", "D", "E"];
const MAX_MELODY_LENGTH = 15;

interface IAppState {
  circleOfFifthsOnly: boolean;
  melodyInput: string;
  melodyNotes: Pitch[];
  results: IChord[][] | undefined;
  showMelodyLengthWarning: boolean;
}

export class App extends React.PureComponent<{}, IAppState> {
  public state: IAppState = {
    circleOfFifthsOnly: true,
    melodyInput: DEFAULT_MELODY.join(" "),
    melodyNotes: DEFAULT_MELODY,
    results: undefined,
    showMelodyLengthWarning: false,
  };

  public render() {
    const { showMelodyLengthWarning } = this.state;
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
              intent={showMelodyLengthWarning ? Intent.WARNING : Intent.NONE}
              onChange={this.handleMelodyInputChange}
              onKeyDown={this.handleMelodyInputKeyDown}
              placeholder="Example: E D C D E E E D D D E C C"
              rightElement={this.renderSearchBarRightElement()}
              value={this.state.melodyInput}
            />
            <Button
              className={Classes.FIXED}
              disabled={showMelodyLengthWarning}
              intent={showMelodyLengthWarning ? Intent.WARNING : Intent.PRIMARY}
              icon="music"
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

  private renderSearchBarRightElement() {
    const { circleOfFifthsOnly } = this.state;

    const CIRCLE_TEXT = "Circle of fifths only";
    const ALL_TEXT = "All progressions";

    const buttonText = circleOfFifthsOnly ? CIRCLE_TEXT : ALL_TEXT;

    return (
      <Popover
        content={
          <Menu className="hz-flag-menu">
            <MenuItem
              active={circleOfFifthsOnly}
              className="hz-flag-menu-item"
              icon="refresh"
              onClick={this.circleOfFifthsFlagEnable}
              text={this.renderHarmonizationOptionsMenuText(CIRCLE_TEXT, "Only strict V7 → I progressions will be used. v7 will also be permitted.")}
            />
            <MenuItem
              active={!circleOfFifthsOnly}
              className="hz-flag-menu-item"
              icon="layout"
              onClick={this.circleOfFifthsFlagDisable}
              text={this.renderHarmonizationOptionsMenuText(ALL_TEXT, "Other progressions may also be used (e.g. half-step motion, tritone substitutions).")}
            />
          </Menu>
        }
        position={Position.BOTTOM_RIGHT}
      >
        <Button minimal={true} rightIcon="caret-down">
          {buttonText}
        </Button>
      </Popover>
    )
  }

  private circleOfFifthsFlagEnable = () => {
    this.setState({ circleOfFifthsOnly: true });
  };

  private circleOfFifthsFlagDisable = () => {
    this.setState({ circleOfFifthsOnly: false });
  };

  private renderHarmonizationOptionsMenuText(title: string, helperText: string) {
    return (
      <div className="hz-flag-menu-item-text">
        <div className="hz-flag-menu-item-text-title">{title}</div>
        <div className="hz-flag-menu-item-text-muted">{helperText}</div>
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
    } else if (keyCode === KeyCodes.LETTER_V && (e.ctrlKey || e.metaKey)) {
      // No-op. Allow pasting via the Cmd/Ctrl + V keyboard shortcut.
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
    const { circleOfFifthsOnly, melodyInput } = this.state;
    const melody = this.parseMelodyNotes(melodyInput);
    // TODO: Validate pitches.
    this.setState({ results: harmonize(melody, circleOfFifthsOnly) });
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
      // Allow one space at the end.
      if (char != " " || i === melodyInput.length - 1) {
        result.push(char);
      }
    }
    return result.join("");
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
