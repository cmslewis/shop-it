import * as React from "react";
import { Card } from "@blueprintjs/core";
import { IChord } from "../harmonization/harmonize";
import { formatInteger } from "../util/numberUtils";
import { pageGetResultStartIndex, pageGetResultEndIndex } from "../util/pagingUtils";
import { PaginationControls } from "./PaginationControls";

const DEFAULT_PAGE_SIZE = 50;

export interface IResultsPaneProps {
  results: IChord[][];
}

export interface IResultsPaneState {
  pageIndex: number;
  pageSize: number;
}

export class ResultsPane extends React.PureComponent<IResultsPaneProps, IResultsPaneState> {
  public state: IResultsPaneState = {
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  };

  public render() {
    const { results } = this.props;
    const { pageIndex, pageSize } = this.state;

    if (results.length === 0) {
      return (
        <Card>
          <p>
            <strong>No harmonizations found!</strong>
          </p>
          <p>
            This doesn't mean there's no way to harmonize this line&mdash;it just means that no progression was found that relies solely on the limited rules this system defines.
          </p>
        </Card>
      )
    }

    const pageStart = pageGetResultStartIndex(pageIndex, pageSize);
    const pageEndExclusive = pageGetResultEndIndex(pageIndex, pageSize, results.length);

    const pageResultItems = results.slice(pageStart, pageEndExclusive).map(this.renderResultItem);

    const isAre = pageResultItems.length === 1 ? "is" : "are";
    const ways = pageResultItems.length === 1 ? "way" : "ways";

    return (
      <Card>
        <p><strong>Here {isAre} {formatInteger(results.length)} {ways} to harmonize this melody. You can play them on <a href="http://cmslewis.github.io/keyano/" target="_blank">Keyano</a>.</strong></p>
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
    const { results } = this.props;
    const { pageIndex, pageSize } = this.state;

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