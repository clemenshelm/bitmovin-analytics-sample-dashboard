import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as impressions from '../api/metrics/impressions';
import Card from './Card';
import ReactPaginate from 'react-paginate';

class TopPaths extends Component {
  constructor (props) {
    super(props);
    this.state = {
      topPaths: [],
      limit: 6,
      offset: 0,
      page: 0,
      orderByOrder: 'DESC'
    }
  }

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  async loadData ({ apiKey, licenseKey, primaryRange }, limit = this.state.limit, offset = this.state.offset, orderByOrder = this.state.orderByOrder) {
    const query = impressions.groupedQuery(apiKey)
      .licenseKey(licenseKey)
      .between(primaryRange.start, primaryRange.end)
      .groupBy('PATH')
      .orderBy('FUNCTION', orderByOrder)
      .orderBy('PATH', 'DESC')
      .limit(limit)
      .offset(offset);

    const { rows } = await query.query();

    this.setState({
      topPaths: rows,
      limit,
      offset,
      orderByOrder,
      page: offset / limit
    });
  }

  toggleSorting() {
    const orderByOrder = this.state.orderByOrder === 'DESC' ? 'ASC' : 'DESC';
    this.loadData(this.props, undefined, 0, orderByOrder);
  }

  handlePageClick(pagination) {
    const offset = this.state.limit * pagination.selected;
    this.loadData(this.props, this.state.limit, offset);
  }

  renderTable () {
    const rows = this.state.topPaths.map((os, index) => {
      return <tr key={index}><td>{os[0]}</td><td>{os[1]}</td></tr>;
    });
    return <div>
      <table className="table table-hover" style={{width:"100%"}}>
        <thead>
          <tr>
            <th>Path</th>
            <th>Impressions <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={::this.toggleSorting}></i></th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
      <ReactPaginate
        ref="table_pagination"
        previousLabel={"previous"}
        nextLabel={"next"}
        pageCount={300}
        forcePage={this.state.page}
        marginPagesDisplayed={0}
        pageRangeDisplayed={0}
        onPageChange={::this.handlePageClick}
        containerClassName={"pagination"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"}/>
    </div>;
  }

  render () {
    return (
      <Card title="Top Pages" width={this.props.width || {md:6, sm: 6, xs: 12}} cardHeight={"480px"}>
        { this.renderTable() }
      </Card>);
  }
}
const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    interval: state.ranges.interval,
    rangeName: state.ranges.name,
    primaryRange: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(TopPaths);
