import { ButtonGroup, Button, NumericInput } from "@blueprintjs/core";
import classNames from "classnames";
import * as React from "react";
import { pageGetResultStartIndex, pageGetResultEndIndex } from "../util/pagingUtils";

const PAGE_SIZE_OPTIONS: number[] = [10, 25, 50, 100];

export interface IPaginationControlsProps {
  numResults: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** @default true */
  withBottomMargin?: boolean;
}

export class PaginationControls extends React.PureComponent<IPaginationControlsProps> {
  public render() {
    const { numResults, pageIndex, pageSize, withBottomMargin } = this.props;

    const numPages = this.getNumPages();

    const isPrevDisabled = pageIndex === 0;
    const isNextDisabled = pageIndex === numPages - 1;

    const resultsStartIndex = pageGetResultStartIndex(pageIndex, pageSize);
    const resultsEndIndexExclusive = pageGetResultEndIndex(pageIndex, pageSize, numResults);

    return (
      <div className={classNames("hz-pagination-controls", { "-with-bottom-margin": withBottomMargin })}>
        <div className="hz-pagination-controls-left">
          <ButtonGroup>
            <Button disabled={isPrevDisabled} icon="chevron-backward" onClick={this.handleStartButtonClick} />
            <Button disabled={isPrevDisabled} onClick={this.handlePrevButtonClick}>Prev</Button>
          </ButtonGroup>
          <NumericInput
            buttonPosition="none"
            className="hz-pagination-controls-stepper"
            fill={true}
            min={1}
            max={numPages}
            minorStepSize={null}
            onValueChange={this.handleNumericInputChange}
            // 1-indexed for display
            value={this.props.pageIndex + 1}
          />
          <ButtonGroup>
            <Button disabled={isNextDisabled} onClick={this.handleNextButtonClick}>Next</Button>
            <Button disabled={isNextDisabled} icon="chevron-forward" onClick={this.handleEndButtonClick} />
          </ButtonGroup>
          <div className="hz-pagination-controls-text">
            {/* 1-indexed */}
            Showing {resultsStartIndex + 1} through {resultsEndIndexExclusive} <em>(sorted lexicographically)</em>
          </div>
        </div>
        <div className="hz-pagination-controls-right">
          {this.renderPageSizeSelector()}
        </div>
      </div>
    );
  }

  private handleStartButtonClick = () => this.props.onPageChange(0);
  private handlePrevButtonClick = () => this.props.onPageChange(this.props.pageIndex - 1);
  private handleNextButtonClick = () => this.props.onPageChange(this.props.pageIndex + 1);
  private handleEndButtonClick = () => this.props.onPageChange(this.getNumPages() - 1);

  private handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onPageSizeChange(+e.target.value);
  }

  private handleNumericInputChange = (value: number) => {
    // The value will be 1-indexed, but the parent expects it to be 0-indexed.
    this.props.onPageChange(value - 1);
  };

  private renderPageSizeSelector() {
    return (
      <label className="hz-pagination-controls-page-size">
        <div className="hz-pagination-controls-page-size-text">Page size:</div>
        <div className="hz-pagination-controls-page-size-selector bp3-select ">
          <select onChange={this.handlePageSizeChange} value={this.props.pageSize}>
            {PAGE_SIZE_OPTIONS.map(this.renderPageSizeOption)}
          </select>
        </div>
      </label>
    );
  }

  private renderPageSizeOption = (value: number) => {
    return <option key={value} value={value}>{value}</option>
  };

  private getNumPages() {
    return Math.ceil(this.props.numResults / this.props.pageSize);
  }
}