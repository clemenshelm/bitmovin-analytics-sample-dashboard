import React, { Component } from 'react'
import { connect } from 'react-redux'
import Card from '../../Card'
import ReactHighcharts from 'react-highcharts'
import moment from 'moment'
import * as rebuffer from '../../../api/metrics/rebuffer'
import * as formats from '../../../formats'

class RebufferCountGraph extends Component {
  constructor (props) {
    super(props);
    this.state = {
      series: []
    }
  }
	componentDidMount () {
		this.loadData(this.props);
	}
	componentWillReceiveProps (nextProps) {
		this.loadData(nextProps);
	}
  loadData (props) {
    const convertResultToBufferedSeries = (results) => {
      results.sort((a,b) => { return a[0] - b[0]; });
      return results.map(row => {
        const ts = moment(row[0]).format(formats[props.interval]);
        const val = Math.round(row[3] * 100) / 100;
        return [ts, val];
      });
    }
    Promise.all([
      rebuffer.rebufferPercentageOverTime(props.apiKey, { ...props.primaryRange, interval: props.interval })
    ]).then(results => {
      this.setState(prevState => {
        return {
          ...prevState,
          series: [{
            name: 'Rebuffer Percentage ' + props.rangeName,
            type: 'spline',
            data: convertResultToBufferedSeries(results[0])
          }]
        }
      })
    })
  }
  getSeries() {
    return this.state.series;
  }
  chartConfig () {
    return {
      chart: {
        height: this.props.height
      },
      title : {
        text: ''
      },
      xAxis : {
        type                : 'category',
        stackLabels: {
          enabled: true
        }
      },
      yAxis : [{
        plotLines: [{
          value: 0,
          width: 1,
        }],
        min: 0,
        max: 100,
        title    : {
          text: 'Rebuffer Percentage'
        }
      }],
      tooltip    : {
        crosshairs: true
      },
      series: this.getSeries(),
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
  }
  render () {
    return <div>
      <Card cardHeight="auto" title="Rebuffer Percentage" width={this.props.width || { sm: 6, md: 6, xs: 12}}>
        <ReactHighcharts config={this.chartConfig()} />
      </Card>
    </div>;
  }
}
const mapStateToProps = (state) => {
	return {
		apiKey: state.api.apiKey,
		interval: state.ranges.interval,
		rangeName: state.ranges.name,
		primaryRange: state.ranges.primaryRange,
		secondaryRange: state.ranges.secondaryRange
	}
}
export default connect(mapStateToProps)(RebufferCountGraph);
