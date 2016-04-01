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
