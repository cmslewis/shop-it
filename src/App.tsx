import React from "react";
import { InputGroup, FormGroup, ControlGroup, Button, Intent, Classes, ButtonGroup, Card } from "@blueprintjs/core";
import "./App.scss";
import { PaginationControls } from "./components/PaginationControls";
import { Pitch, IChord, harmonize } from "./util/harmonize";
import { pageGetResultStartIndex, pageGetResultEndIndex } from "./util/pagingUtils";
import { formatInteger } from "./util/numberUtils";

const DEFAULT_PAGE_SIZE = 50;
const ENTER_KEY = 13;

interface IAppState {
  melodyInput: string;
  pageIndex: number;
  pageSize: number;
  results: IChord[][] | undefined;
}

export class App extends React.PureComponent {
  public state: IAppState = {
    melodyInput: "E D C D E",
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
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
    const { pageIndex, pageSize, results } = this.state;

    if (results === undefined) {
      return undefined;
    }

    const pageStart = pageGetResultStartIndex(pageIndex, pageSize);
    const pageEndExclusive = pageGetResultEndIndex(pageIndex, pageSize, results.length);

    const pageResultItems = results.slice(pageStart, pageEndExclusive).map(this.renderResultItem);

    const isAre = pageResultItems.length === 1 ? "is" : "are";
    const ways = pageResultItems.length === 1 ? "way" : "ways";

    return (
      <Card>
        <p><strong>Here {isAre} {formatInteger(results.length)} {ways} to harmonize this melody.</strong></p>
        {this.renderPaginationControls()}
        <div className="hz-chord-results">
          {pageResultItems}
        </div>
        {this.renderPaginationControls(false)}
      </Card>
    );
  }

  private renderResultItem = (result: IChord[], index: number) => {
    const { pageIndex, pageSize } = this.state;

    const resultAbsoluteIndex = pageGetResultStartIndex(pageIndex, pageSize) + index;

    const resultStr = result.map(c => c.name).join(" ");
    const chordNames = result.map((c, i) => <span key={i} className="hz-chord-name">{c.name}</span>);

    const elements = [];
    for (let i = 0; i < chordNames.length; i++) {
      if (i > 0) {
        elements.push(<span key={i + 0.5} className="hz-chord-arrow">→</span>)
      }
      elements.push(chordNames[i]);
    }

    return (
      <div className="hz-chord-result" key={resultStr}>
        {/* 1-indexed */}
        <div className="hz-chord-result-id">#{resultAbsoluteIndex + 1}</div>
        {elements}
      </div>
    );
  }

  private renderPaginationControls(withBottomMargin = true) {
    const { pageIndex, pageSize, results } = this.state;

    if (results === undefined) {
      return undefined;
    }

    return (
      <PaginationControls
        numResults={results.length}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={this.handlePageChange}
        onPageSizeChange={this.handlePageSizeChange}
        withBottomMargin={withBottomMargin}
      />
    );
  }

  private handlePageChange = (pageIndex: number) => this.setState({ pageIndex });
  private handlePageSizeChange = (pageSize: number) => this.setState({ pageSize });
}
