import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactHighcharts from 'react-highcharts'
import Card from './components/Card'
import FiltersDialog from './FiltersDialog'

class Chart extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    width: PropTypes.object,
    dataFunction: PropTypes.func,
    convertResultToSeries: PropTypes.func,
    defaultSeriesName: PropTypes.string.isRequired,
    yAxisTitle: PropTypes.string
  };
  constructor(props) {
    super(props);
    this.state = {
      queries: [{
        name: props.defaultSeriesName,
        filters: []
      }],
      series: [{
        name: props.defaultSeriesName,
        data: []
      }],
      showFiltersDialog: false
    }
  }
  componentDidMount () {
    this.loadData(this.props, this.state.queries);
  }
  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps, this.state.queries);
  }
  loadData(props, queries) {
    Promise.all(queries.map(query => {
      const baseQuery = {
        ...props.primaryRange,
        interval: props.interval,
        groupBy: [],
        orderBy: [{ name: props.interval, order: 'ASC'}],
        filters: query.filters
      };

      return props.dataFunction(props.apiKey, query.name, baseQuery)
    })).then((results) => {
      let series = results.map(res => {
        return res.map(s => {
          return this.props.convertResultToSeries(s.name, props.interval, s.data);
        });
      });
      series = Array.prototype.concat(...series);

      this.setState(prevState => {
        return {
          ...prevState,
          showFiltersDialog: false,
          queries,
          series
        }
      });
    });
  }
  showFiltersDialog() {
    this.setState(prevState => {
      return {
        ...prevState,
        showFiltersDialog: true
      }
    });
  }
  callback(queries) {
    this.loadData(this.props, queries);
  }
  renderFilters() {
    if (this.state.showFiltersDialog !== true) {
      return null
    }
    return <FiltersDialog callback={::this.callback} queries={this.state.queries}/>
  }
  render () {
    const chartConfig = {
      chart: {
        height: this.props.height
      },
      title : {
        text: ''
      },
      tooltip: {
        shared: true
      },
      xAxis : {
        type : 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year : '%b'
        }
      },
      yAxis : {
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        title    : {
          text: this.props.yAxisTitle || ''
        }
      },
      series: this.state.series,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title={this.props.title} width={this.props.width || { md:12, sm: 12, xs: 12}} fixedHeight={false} cardHeight="auto">
        <div>
          <div>
            <a className="btn btn-info filters-button" onClick={::this.showFiltersDialog}>
              <i className="fa fa-filter"></i>
              <span>Filters</span>
            </a>
            {this.renderFilters()}
          </div>
          <ReactHighcharts config={chartConfig}/>
        </div>
      </Card>);
  }
}

const mapStateToProps = (state) => {
  const { name, interval, primaryRange, secondaryRange } = state.ranges;
  return {
    apiKey: state.api.apiKey,
    name,
    interval,
    primaryRange,
    secondaryRange
  }
};

export default connect(mapStateToProps)(Chart);
