"use strict";

var HostBox = React.createClass({
	loadHostsFromServer: function() {
		$.ajax({
			url: this.props.url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				console.log('data =', data);
				this.setState({data: data});
			}.bind(this),
			error: function(xhr, status, err) {
				console.error(this.props.url, status, err.toString());
			}.bind(this)
		});
	},
	getInitialState: function() {
		return {
			data: []
		};
	},
	componentDidMount: function() {
		this.setState({
			classShow: 'hide',
			ajax: 0
		});
		this.loadHostsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	handleStatusUpdate: function(host) {
		if (!this.state.series && !this.state.ajax) {
			this.setState({
				host: host,
				classShow: 'show'
			});
		}
	},
	handleStatusHide: function(host) {
		if (!this.state.series && !this.state.ajax) {
			this.setState({classShow: 'hide'});
		}
	},
	getMetricValues: function(url) {
		this.setState({ajax: 1});
		$.ajax({
			url: url,
			dataType: 'json',
			cache: false,
			success: function(data) {
				this.setState({
					series: data,
					ajax: 0
				});
			}.bind(this),
			error: function(xhr, status, err) {
				console.log('loadConfigFromServer error:');
				console.error('getMetricValues()', status, err.toString());
				this.setState({ajax: 0});
			}.bind(this)
		});
	},
	hideStatusBar: function() {
		this.setState({
			classShow: 'hide',
			series: false
		});
	},
	render: function() {
		return (
			<div className="wrapper">
				<HostStatus host={this.state.host} time={this.state.data.time} series={this.state.series} classShow={this.state.classShow} hideStatus={this.hideStatusBar} />
				<Overview count={this.state.data.count} anomalies={this.state.data.anomalies} />
				<div className="groupContainer">
					<GroupList data={this.state.data} updateGroupList={this.handleStatusUpdate} hideGroupList={this.handleStatusHide} sendURLByGroup={this.getMetricValues} hideStatusByGroup={this.hideStatusBar} />
				</div>
			</div>
		);
	}
});

var lineChartOptions = {
	lines: {
		show: true,
		fill: true ,
		fillColor: 'rgba(242, 239, 145, 0.18)'
	},
	legend: { show: false },
	grid: { hoverable: true },
	xaxis: {
		mode: "time",
		timeformat: "%m/%d %H:%M",
		timezone: "browser",
		minTickSize: [1, "hour"],
		font: { color: "#fff" }
	},
	yaxis: {
		tickFormatter: function (v, axis) { return suffixFormatterAxis(v, axis); },
		font: { color: "#fff" }
	},
	colors: ['#669900', '#33B5E5', '#ECBB13', '#FF8800', '#005f81', '#9933CC']
};

var suffixFormatterAxis = function (val, axis) {
	return suffixFormatter(val, axis.tickDecimals);
}

var suffixFormatter = function (val, decimals) {
	if (val > 1000000)
		return (val / 1000000).toFixed(decimals) + " M";
	else if (val > 1000)
		return (val / 1000).toFixed(decimals) + " k";
	else
		return val.toFixed(decimals);
}

var roseChartOptions = {
	calculable: true,
	tooltip: {
		trigger: 'item',
		formatter: '{a} <br/>{b} : {c} ({d}%)'
	},
	color: ['gray', 'red', 'blue', 'green', 'orange'],
	series: [
		{
			name: 'Hosts',
			itemStyle: {
				emphasis: {
					label: { show: false },
					labelLine: { show: false }
				},
				normal: {
					label: { show: false },
					labelLine: { show: false }
				}
			},
			type: 'pie',
			radius : [80, 170],
			center: ['50%', '50%'],
			roseType: 'area',
			data: []
		}
	]
};

var geoCoordMap = {
	'辽宁': [123.429096, 41.796767],
	'吉林': [125.3245, 43.886841],
	'黑龙江': [126.642464, 45.756967],
	'台湾': [121.509062, 25.044332],
	'香港': [114.173355, 22.320048],
	'安徽': [117.283042, 31.86119],
	'上海': [121.472644, 31.231706],
	'江苏': [118.767413, 32.041544],
	'浙江': [120.153576, 30.287459],
	'江西': [115.892151, 28.676493],
	'河南': [113.665412, 34.757975],
	'湖北': [114.298572, 30.584355],
	'湖南': [112.982279, 28.19409],
	'北京': [116.405285, 39.904989],
	'内蒙古': [111.670801, 40.818311],
	'河北': [114.502461, 38.045474],
	'山西': [112.549248, 37.857014],
	'天津': [117.190182, 39.125596],
	'山东': [117.000923, 36.675807],
	'广东': [113.280637, 23.125178],
	'福建': [119.306239, 26.075302],
	'海南': [110.33119, 20.031971],
	'广西': [108.320004, 22.82402],
	'陕西': [108.948024, 34.263161],
	'新疆': [87.617733, 43.792818],
	'甘肃': [103.823557, 36.058039],
	'宁夏': [106.278179, 38.46637],
	'四川': [104.065735, 30.659462],
	'重庆': [106.504962, 29.533155],
	'云南': [102.712251, 25.040609],
	'贵州': [106.713478, 26.578343]
};

var HostStatus = React.createClass({
	render: function() {
		if (this.props.host) {
			return (
				<div ng-show="show_desc" className="host_desc">
					<div>host: {this.props.host.hostname}</div>
					<div>status: {this.props.host.status}</div>
					<div>agent version: {this.props.host.agent_version}</div>
					<div>time: {this.props.host.time}</div>
				</div>
			);
		} else {
			return (
				<div></div>
			);
		}
	}
});

var HostList = React.createClass({
	updateHostList: function(host) {
		if (host) {
			host.time = this.props.data.time;
		}
		this.props.updateHostList(host);
	},
	render: function() {
		var result = [];
		if ('result' in this.props.data) {
			result = this.props.data.result;
		}
		var hostNodes = result.map(function(host) {
			var className = 'rectangle ' + host.status
			return (
				<Host host={host} hostClassName={className} key={host.id} updateHost={this.updateHostList}>
				</Host>
			);
		}.bind(this));
		return (
			<div className="main">
				{hostNodes}
			</div>
		);
	}
});

var Host = React.createClass({
	mouseOver: function () {
		this.props.updateHost(this.props.host);
	},
	mouseOut: function () {
		this.props.updateHost(null);
	},
	click: function () {
		$.ajax({
			url: 'http://localhost/getUrl',
			dataType: 'json',
			cache: false,
			success: function(data) {
				var url = data + this.props.host.hostname;
				window.location.href = url;
			}.bind(this),
			error: function(xhr, status, err) {
				console.log('loadConfigFromServer error:');
				console.error('http://localhost/getUrl', status, err.toString());
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div className={this.props.hostClassName}
			 onMouseOver={this.mouseOver} onMouseOut={this.mouseOut}
			 onClick={this.click}>
			</div>
		);
	}
});

ReactDOM.render(
	<HostBox url="http://localhost/alive" pollInterval={5000} />,
	document.getElementById('content')
);
