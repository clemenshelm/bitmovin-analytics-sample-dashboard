import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Card from '../../Card';
import ReactHighcharts from 'react-highcharts';
import * as startupDelay from '../../../api/metrics/startupdelay';

class StartupDelayByPlayerVersion extends Component {
  static propTypes = {
    width: PropTypes.object
  };

  constructor (props) {
    super(props);
    this.state = {
      series: []
    }
  }

  componentDidMount () {
    const convertResultToSeries = (result) => {
      const series = [];
      for (let key of Object.keys(result)) {
        result[key].sort((a,b) => { return a[0] - b[0]});
        series.push({
          name: key.toUpperCase(),
          data: result[key].map(row => {
            row[0] = row[0];
            row[2] = Math.round(row[2]);
            return [row[0], row[2]];
          })
        })
      }
      return series;
    };

    const baseQuery = {
      ...this.props.primaryRange,
      licenseKey: this.props.licenseKey
    };

    startupDelay.videoStartupDelayByPlayerVersion(this.props.apiKey, baseQuery)
    .then(results => {
      const techRows = results.reduce((memo, item) => {
        memo[item[1]] = memo[item[1]] || [];
        memo[item[1]].push(item);
        return memo;
      }, {});
      this.setState(prevState => {
        return {
          ...prevState,
          series: convertResultToSeries(techRows)
        }
      });
    })
  }
  getSeries () {
    return this.state.series
  }
  chartConfig () {
    return {
      chart: {
        height: 400,
        type: 'spline'
      },
      title : {
        text: ''
      },
      xAxis : {
        type: 'datetime'
      },
      yAxis : {
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        title    : {
          text: 'Milliseconds'
        }
      },
      tooltip    : {
        shared    : true,
        crosshairs: true
      },
      series: this.getSeries(),
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
  }
  render () {
    return <Card title="Startup Delay by Player Version" width={this.props.width || {md: 12, sm: 12, xd: 12}} cardHeight="500px">
      <ReactHighcharts config={this.chartConfig()} />
    </Card>;
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    interval: state.ranges.interval,
    rangeName: state.ranges.name,
    primaryRange: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey
  };
};

export default connect(mapStateToProps)(StartupDelayByPlayerVersion);
