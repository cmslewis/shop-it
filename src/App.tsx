import React from "react";
import { InputGroup, FormGroup, ControlGroup, Button, Intent, Classes } from "@blueprintjs/core";
import "./App.scss";
import { Pitch, IChord, harmonize } from "./util/harmonize";

interface IAppState {
  melodyInput: string;
  results: IChord[][] | undefined;
}

export class App extends React.PureComponent {
  public state: IAppState = {
    melodyInput: "",
    results: undefined,
  };

  public render() {
    return (
      <div className="hz-app">
        <h1>BBS Chord Suggestions</h1>
        <FormGroup label="Enter a melody in C major:" helperText="Put a space between each pitch name. Accidentals like F# and Bb are supported.">
          <ControlGroup fill={true}>
            <InputGroup
              onChange={this.handleMelodyInputChange}
              placeholder="Example: E D C D E E E D D D E C C"
              value={this.state.melodyInput}
            />
            <Button
              className={Classes.FIXED}
              intent={Intent.PRIMARY}
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

  private handleMelodyInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      melodyInput: this.getSanitizedMelodyInput((e.target as HTMLInputElement).value)
    });
  };

  private handleButtonClick = (e: React.MouseEvent<HTMLElement>) => {
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
    if (results === undefined) {
      return undefined;
    }

    const firstFewResults = results.slice(0, 50);
    const resultItems = firstFewResults.map(this.renderResultItem);

    const resultsUnit = resultItems.length === 1 ? "way" : "ways";

    return (
      <div>
        <p><strong>Here are {resultItems.length} {resultsUnit} to harmonize this melody:</strong></p>
        {resultItems}
      </div>
    );
  }

  private renderResultItem = (result: IChord[], _index: number) => {
    const resultStr = result.map(c => c.name).join(" ");
    const chordNames = result.map((c, i) => <span key={i} className="hz-chord-name">{c.name}</span>);

    const elements = [];
    for (let i = 0; i < chordNames.length; i++) {
      if (i > 0) {
        elements.push(<span key={i + 0.5} className="hz-chord-arrow">→</span>)
      }
      elements.push(chordNames[i]);
    }

    return <div className="hz-chord-result" key={resultStr}>{elements}</div>;
  }
}
