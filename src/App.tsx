import React from "react";
import { InputGroup, FormGroup, ControlGroup, Button, Intent, Classes } from "@blueprintjs/core";
import "./App.scss";
import { ResultsPane } from "./components/ResultsPane";
import { Pitch, IChord, harmonize } from "./harmonization/harmonize";

const ENTER_KEY = 13;

interface IAppState {
  melodyInput: string;
  results: IChord[][] | undefined;
}

export class App extends React.PureComponent {
  public state: IAppState = {
    melodyInput: "E D C D E",
    results: undefined,
  };

  public render() {
    return (
      <div className="hz-app">
        <h1>BBS Chord Suggestions</h1>
        <FormGroup label="Enter a melody in C major:" helperText="Put a space between each pitch name. Accidentals like F# and Bb are supported.">
          <ControlGroup fill={true}>
            <InputGroup
              large={true}
              onChange={this.handleMelodyInputChange}
              onKeyDown={this.handleMelodyInputKeyDown}
              placeholder="Example: E D C D E E E D D D E C C"
              value={this.state.melodyInput}
            />
            <Button
              className={Classes.FIXED}
              intent={Intent.PRIMARY}
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
    this.setState({
      melodyInput: this.getSanitizedMelodyInput((e.target as HTMLInputElement).value)
    });
  };

  private handleMelodyInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.which === ENTER_KEY) {
      this.handleButtonClick();
    }
  };

  private handleButtonClick = () => {
    const { melodyInput } = this.state;
    const melody = melodyInput.trim().split(/\s+/) as Pitch[];
    // TODO: Validate pitches.
    this.setState({ results: harmonize(melody) });
  };

  private getSanitizedMelodyInput(melodyInput: string) {
    return melodyInput.toUpperCase().replace("3", "#");
  };

  private maybeRenderResults() {
    const { results } = this.state;
    return results === undefined ? undefined : <ResultsPane results={results}></ResultsPane>;
  }
}
