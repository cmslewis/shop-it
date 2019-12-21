import React from "react";
import { InputGroup, FormGroup, ControlGroup, Button, Intent, Classes, ButtonGroup } from "@blueprintjs/core";
import "./App.scss";
import { Pitch, IChord, harmonize } from "./util/harmonize";

const PAGE_SIZE = 50;

interface IAppState {
  melodyInput: string;
  pageIndex: number;
  results: IChord[][] | undefined;
}

export class App extends React.PureComponent {
  public state: IAppState = {
    melodyInput: "E D C D E",
    pageIndex: 0,
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
    const { pageIndex, results } = this.state;
    if (results === undefined) {
      return undefined;
    }

    const firstFewResults = results.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE);
    const resultItems = firstFewResults.map(this.renderResultItem);

    const isAre = resultItems.length === 1 ? "is" : "are";
    const ways = resultItems.length === 1 ? "way" : "ways";

    return (
      <div>
        <p><strong>There {isAre} {results.length}+ {ways} to harmonize this melody.</strong></p>
        {this.renderPaginationControls(results)}
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

  private renderPaginationControls(allResults: IChord[][]) {
    const { pageIndex } = this.state;
    const numPages = Math.ceil(allResults.length / PAGE_SIZE);

    const pageButtons: JSX.Element[] = [];
    for (let i = 0; i < numPages; i++) {
      pageButtons.push(<Button active={i === pageIndex} onClick={() => this.setState({ pageIndex: i })}>{i + 1}</Button>)
    }

    return (
      <div className="hz-pagination-controls">
        <ButtonGroup>
          <Button disabled={pageIndex === 0} intent={Intent.PRIMARY} onClick={this.handlePrevButtonClick}>Prev</Button>
          {pageButtons}
          <Button disabled={pageIndex === numPages - 1} intent={Intent.PRIMARY} onClick={this.handleNextButtonClick}>Next</Button>
        </ButtonGroup>
      </div>
    );
  }

  private handlePrevButtonClick = () => {
    this.setState({ pageIndex: this.state.pageIndex - 1 });
  };

  private handleNextButtonClick = () => {
    this.setState({ pageIndex: this.state.pageIndex + 1 });
  };
}
