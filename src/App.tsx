import React from "react";
import { InputGroup, FormGroup, ControlGroup, Button, Intent, Classes, Position, Menu, MenuItem, Popover, IconName, Icon } from "@blueprintjs/core";
import "./App.scss";
import { ResultsPane } from "./components/ResultsPane";
import { Pitch, IChord, harmonize, MelodyNote } from "./harmonization/harmonize";
import { Chord } from "./harmonization/harmonize";

const KeyCodes = {
  ENTER: 13,
};

const DEFAULT_MELODY: Pitch[] = ["E", "D", "C", "D", "E"];
const MAX_MELODY_LENGTH = 15;
const PITCH_INPUT_REGEX = /^([A-Ga-g][#b]?)(\(([A-Ga-g][#b]?(m7|7)?)\))?$/; // E, F#, C(C), C(Am7)

interface IAppState {
  circleOfFifthsOnly: boolean;
  melodyInput: string;
  results: IChord[][] | undefined;
  showMelodyLengthWarning: boolean;
}

export class App extends React.PureComponent<{}, IAppState> {
  public state: IAppState = {
    circleOfFifthsOnly: true,
    melodyInput: "",
    results: undefined,
    showMelodyLengthWarning: false,
  };

  public render() {
    const { showMelodyLengthWarning } = this.state;
    const helperText = showMelodyLengthWarning
      ? "Melodies can't be longer than 15 notes."
      : "Valid pitches are C, C#, D, D#, E, F, F#, G, G#, A, A#, Bb, B, and C. Valid chords are C, C7, C#7, Dm7, D7, D#7, Em7, E7, F7, F#7, G7, G#7, Am7, A7, A#7, Bb7, B7.";
    return (
      <div className="hz-app">
        <h2>'Shop It: A Simple Barbershop Harmonizer</h2>
        <p>
          Enter a sequence of pitches in C Major, then click "Harmonize" to see various barbershop chord progressions for that melody.
        </p>
        <h3>Examples</h3>
        <p>
          <ul>
            {this.renderExampleListItem("Down Our Way", "E B A G A E D", false)}
            {this.renderExampleListItem("Mary Had a Little Lamb", "E D C D E E E", false)}
            {this.renderExampleListItem("Chromatic scale", "C C# D D# E F F# G", true)}
            {this.renderExampleListItem("Santa Fe", "G(G7) F E(C) G F E(Am7)", true)}
          </ul>
        </p>
        <h3>Notes</h3>
        <ul>
          <li><strong>Forced chords.</strong> You can force a particular chord for a particular melody note. Just put the chord name in parentheses after the pitch: <code>F#(D7)</code>. Make sure the forced chord actually contains the pitch&mdash;you won't see any validation messages or error messages if not.</li>
          <li><strong>Progression permissivity.</strong> You can decide whether to allow only basic Circle of Fifths motion (e.g. II7 → V7 → I) or additional progressions as well (e.g. I#7 → I7, tritone substitution). Permitting all progressions will give many more results.</li>
          <li><strong>Melody length.</strong> For performance reasons, melodies can be at most 15 pitches long. Computating anything longer would likely cook your browser.</li>
          <li><strong>Letter casing.</strong> Case matters only for chord names (e.g. because AM7 and Am7 are distinct chords). Case does not matter for pitch names.</li>
          <li><strong>Playing chords.</strong> You can play through progressions using <a href="http://cmslewis.github.io/keyano/" target="_blank">Keyano</a>, a browser-based piano, if you want.</li>
        </ul>
        <FormGroup
          helperText={helperText}
          intent={showMelodyLengthWarning ? Intent.WARNING : Intent.NONE}
        >
          <ControlGroup fill={true}>
            <InputGroup
              intent={showMelodyLengthWarning ? Intent.WARNING : Intent.NONE}
              large={true}
              onChange={this.handleMelodyInputChange}
              onKeyDown={this.handleMelodyInputKeyDown}
              placeholder="Enter a melody in C Major..."
              rightElement={this.renderSearchBarRightElement()}
              value={this.state.melodyInput}
            />
            <Button
              className={Classes.FIXED}
              disabled={showMelodyLengthWarning || this.state.melodyInput.length === 0}
              intent={showMelodyLengthWarning ? Intent.WARNING : Intent.PRIMARY}
              icon="music"
              large={true}
              onClick={this.handleButtonClick}
            >
              Harmonize!
            </Button>
          </ControlGroup>
        </FormGroup>
        {this.maybeRenderResults()}
        <div className="hz-attribution">Hastily built by <a href="https://www.github.com/cmslewis" target="_blank">Chris Lewis</a> from Dec 19 - 21, 2019.</div>
      </div>
    );
  }

  private renderExampleListItem(title: string, melodyInput: string, needsAllProgressions: boolean) {
    const onClick = () => {
      this.changeMelodyInput(melodyInput);
      this.setState({ circleOfFifthsOnly: !needsAllProgressions });
    };
    return (
      <li>
        <strong>{title}:</strong>{" "}
        <code>{melodyInput}</code>{" "}
        <a onClick={onClick}>(Try it)</a>
      </li >
    );
  }

  private renderSearchBarRightElement() {
    const { circleOfFifthsOnly } = this.state;

    const CIRCLE_TEXT = "Circle of fifths only";
    const ALL_TEXT = "All progressions";

    const CIRCLE_ICON: IconName = "refresh";
    const ALL_ICON: IconName = "layout";

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
    this.changeMelodyInput(melodyInput);
  };

  private changeMelodyInput(melodyInput: string) {
    this.setState({
      melodyInput,
      showMelodyLengthWarning: this.parseMelodyNotes(melodyInput).length > MAX_MELODY_LENGTH,
    });
  }

  private handleMelodyInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const keyCode = e.which;
    if (keyCode === KeyCodes.ENTER && !this.state.showMelodyLengthWarning && this.state.melodyInput.length > 0) {
      this.handleButtonClick();
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
        const pitch = match[1].toUpperCase() as Pitch;
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
    return melodyInput.replace("3", "#");
  };

  private maybeRenderResults() {
    const { results } = this.state;
    return results === undefined ? undefined : <ResultsPane results={results}></ResultsPane>;
  }
}
