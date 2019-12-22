import React from "react";
import { InputGroup, FormGroup, ControlGroup, Button, Intent, Classes, Position, Menu, MenuItem, Popover, IconName, Icon } from "@blueprintjs/core";
import "./App.scss";
import { ResultsPane } from "./components/ResultsPane";
import { Pitch, IChord, harmonize, MelodyNote } from "./harmonization/harmonize";
import { Chord } from "./harmonization/harmonize";

const KeyCodes = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SPACE: 32,
  ARROW_LEFT: 37,
  ARROW_DOWN: 40,
  DELETE: 46,
  DIGIT_0: 48,
  DIGIT_3: 51,
  DIGIT_7: 55,
  DIGIT_9: 57,
  LETTER_A: 65,
  LETTER_B: 66,
  LETTER_G: 71,
  LETTER_V: 86,
};

const DEFAULT_MELODY: Pitch[] = ["E", "D", "C", "D", "E"];
const MAX_MELODY_LENGTH = 15;
const PITCH_INPUT_REGEX = /^([A-G][#b]?)(\(([A-G][#b]?(m7|7)?)\))?$/; // E, F#, C(C), C(Am7)

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
      : "To force a particular chord for a particular note, put the chord name in parentheses after the pitch: F#(D7)."
    return (
      <div className="hz-app">
        <h1>BBS Harmonizer</h1>
        <FormGroup
          label="Enter a melody in C major, then click 'Harmonize' to see suggested barbershop chord progressions."
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

    const CIRCLE_ICON: IconName = "refresh";
    const ALL_ICON: IconName = "layout";

    const buttonIcon = circleOfFifthsOnly ? "refresh" : ALL_ICON;
    const buttonText = circleOfFifthsOnly ? CIRCLE_TEXT : ALL_TEXT;

    return (
      <Popover
        content={
          <Menu className="hz-flag-menu">
            <MenuItem
              active={circleOfFifthsOnly}
              className="hz-flag-menu-item"
              icon={CIRCLE_ICON}
              onClick={this.circleOfFifthsFlagEnable}
              text={this.renderHarmonizationOptionsMenuText(CIRCLE_TEXT, "Only strict V7 → I progressions will be used. v7 will also be permitted.")}
            />
            <MenuItem
              active={!circleOfFifthsOnly}
              className="hz-flag-menu-item"
              icon={ALL_ICON}
              onClick={this.circleOfFifthsFlagDisable}
              text={this.renderHarmonizationOptionsMenuText(ALL_TEXT, "Other progressions may also be used (e.g. half-step motion, tritone substitutions).")}
            />
          </Menu>
        }
        position={Position.BOTTOM_RIGHT}
      >
        <Button icon={<Icon icon={buttonIcon} iconSize={12} />} minimal={true} rightIcon="caret-down">
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
    } else {
      const isPasteHotkey = keyCode === KeyCodes.LETTER_V && (e.ctrlKey || e.metaKey);
      const isTab = keyCode === KeyCodes.TAB;
      const isPitchBaseName = keyCode >= KeyCodes.LETTER_A && keyCode <= KeyCodes.LETTER_G;
      const isSharpSymbolKey = keyCode === KeyCodes.DIGIT_3;
      const isFlatSymbolKey = keyCode === KeyCodes.LETTER_B;
      const isSpaceBar = keyCode === KeyCodes.SPACE;
      const isArrowKey = keyCode >= KeyCodes.ARROW_LEFT && keyCode <= KeyCodes.ARROW_DOWN;
      const isBackspace = keyCode === KeyCodes.BACKSPACE;
      const isDelete = keyCode === KeyCodes.DELETE;
      const isParen = (keyCode === KeyCodes.DIGIT_9 || keyCode === KeyCodes.DIGIT_0) && e.shiftKey;
      const isSeven = keyCode === KeyCodes.DIGIT_7; // For expressing names of forced seventh chords in parens.

      if (
        !isPasteHotkey &&
        !isTab &&
        !isPitchBaseName &&
        !isSharpSymbolKey &&
        !isFlatSymbolKey &&
        !isSpaceBar &&
        !isArrowKey &&
        !isBackspace &&
        !isDelete &&
        !isParen &&
        !isSeven
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

  private parseMelodyNotes(melodyString: string): MelodyNote[] {
    // TODO: Better intepreter.
    const tokens = melodyString.split(" ");
    const melodyNotes: MelodyNote[] = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const match = token.match(PITCH_INPUT_REGEX);
      if (match != null) {
        const pitch = match[1] as Pitch;
        const chordName = match[3];
        if (chordName != null) {
          // TODO: Accept chordName instead of chord.
          const chord = (Chord as any)[chordName] as IChord | undefined;
          melodyNotes.push({ pitch, chord });
        } else {
          melodyNotes.push({ pitch });
        }
      } else {
        // Invalid pitch.
      }
    }
    return melodyNotes;
  }

  private getSanitizedMelodyInput(melodyInput: string): string {
    return melodyInput.replace("3", "#").toUpperCase();
  };

  private maybeRenderResults() {
    const { results } = this.state;
    return results === undefined ? undefined : <ResultsPane results={results}></ResultsPane>;
  }
}
