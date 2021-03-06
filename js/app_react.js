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

var convertData = function (data) {
	var res = [];
	for (var i = 0; i < data.length; i++) {
		var geoCoord = geoCoordMap[data[i].name];
		if (geoCoord) {
			res.push({
				name: data[i].name,
				value: geoCoord.concat(data[i].value)
			});
		}
	}
	return res;
};

var mapChartOptions = {
	calculable: true,
	backgroundColor: '#404a59',
	title: {
		text: 'Error Hosts',
		left: 'center',
		textStyle: { color: '#fff' }
	},
	tooltip: { trigger: 'item' },
	geo: {
		map: 'china',
		label: {
			emphasis: { show: false }
		},
		roam: true,
		itemStyle: {
			normal: {
				areaColor: '#323c48',
				borderColor: '#111'
			},
			emphasis: { areaColor: '#2a333d' }
		}
	},
	series: [
		{
			name: 'Error Hosts',
			type: 'scatter',
			coordinateSystem: 'geo',
			roam: true,
			selectedMode: 'single',
			data: [],
			symbolSize: function (val) { return val[2]; },
			label: {
				normal: {
					formatter: '{b}',
					position: 'right',
					show: false
				},
				emphasis: { show: true }
			},
			itemStyle: {
				normal: { color: '#ddb926' }
			}
		},
		{
			name: 'Top 5',
			type: 'effectScatter',
			coordinateSystem: 'geo',
			data: [],
			symbolSize: function (val) { return val[2]; },
			showEffectOn: 'render',
			rippleEffect: { brushType: 'stroke' },
			hoverAnimation: true,
			label: {
				normal: {
					formatter: '{b}',
					position: 'right',
					show: true
				}
			},
			itemStyle: {
				normal: {
					color: '#f4e925',
					shadowBlur: 10,
					shadowColor: '#333'
				}
			},
			zlevel: 1
		}
	]
};

var Overview = React.createClass({
	click: function () {
		this.props.hideStatus();
	},
	render: function() {
		if (this.props.anomalies) {
			var anomalies = this.props.anomalies;
			var count = 0;
			var data = [];
			for (var provinceName in anomalies) {
				count = anomalies[provinceName].count;
				data.push({
					name: provinceName,
					value: count
				});
			}
			data.sort(function(a, b) {
				return b.value - a.value;
			});
			var top5 = data.slice(0, 5);
			mapChartOptions.series[0].data = convertData(data);
			mapChartOptions.series[1].data = convertData(top5);
			var myChart = echarts.init(document.getElementById('mapChart'));
			myChart.setOption(mapChartOptions, true);
		}
		if (this.props.count) {
			var count = this.props.count;
			var data = [
				{
					name: 'deactivated',
					value: count['deactivated']
				},
				{
					name: 'error',
					value: count['error']
				},
				{
					name: 'miss',
					value: count['miss']
				},
				{
					name: 'normal',
					value: count['normal']
				},
				{
					name: 'warn',
					value: count['warn']
				}
			];
			roseChartOptions.series[0].data = data;
			var myChart = echarts.init(document.getElementById('roseChart'));
			myChart.setOption(roseChartOptions, true);
		}
		return (
			<div>
				<div id="mapChart" className="chartPlaceholder"></div>
				<div id="roseChart" className="chartPlaceholder"></div>
			</div>
		);
	}
});

var HostStatus = React.createClass({
	click: function () {
		this.props.hideStatus();
	},
	render: function() {
		var className = 'host_desc ';
		var classShow = this.props.classShow;
		var chartClassName = 'chartPlaceholder';
		if (this.props.host) {
			if (this.props.host.status === 'warm') {
				className += 'orange';
			} else {
				className += this.props.host.status;
			}
			if (this.props.series) {
				classShow += ' blackBackground';
				var cpu = [];
				var net = [];
				var obj = {};
				this.props.series.result.map(function(line) {
					obj = {
						label: line.host + '.' + line.metric,
						shadowSize: 5,
						data: line.data
					};
					if (line.metric.indexOf('net') > -1) {
						net.push(obj);
					} else if (line.metric.indexOf('cpu') > -1) {
						cpu.push(obj);
					}
				});

				jQuery("#cpu").css({visibility: "visible"});
				jQuery("#net").css({visibility: "visible"});
				$.plot("#cpu", cpu, lineChartOptions);
				$.plot("#net", net, lineChartOptions);

				$("<div id='tooltip'></div>").css({
					position: "absolute",
					display: "none",
					border: "1px solid #fdd",
					padding: "2px",
					"background-color": "#fee",
					opacity: 0.80
				}).appendTo("body");

				$("#cpu").bind("plothover", function (event, pos, item) {
					if (item) {
						var x = item.datapoint[0],
							y = suffixFormatter(item.datapoint[1], 1);

						var d = $.plot.dateGenerator(x, {timezone: "browser"});
						var time = $.plot.formatDate(d, '%Y-%m-%d %H:%M');
						$("#tooltip")
							.html('<center>' + time + '</center>' + '<div>' + item.series.label + " = " + y + '</div>')
							.css({top: item.pageY+5, left: item.pageX+5})
							.fadeIn(200);
					} else {
						$("#tooltip").hide();
					}
				});
				$("#net").bind("plothover", function (event, pos, item) {
					if (item) {
						var x = item.datapoint[0],
							y = suffixFormatter(item.datapoint[1], 1);

						var d = $.plot.dateGenerator(x, {timezone: "browser"});
						var time = $.plot.formatDate(d, '%Y-%m-%d %H:%M');
						$("#tooltip")
							.html('<center>' + time + '</center>' + '<div>' + item.series.label + " = " + y + '</div>')
							.css({top: item.pageY+5, left: item.pageX+5})
							.fadeIn(200);
					} else {
						$("#tooltip").hide();
					}
				});
			} else {
				jQuery("#cpu").css({visibility: "hidden"});
				jQuery("#net").css({visibility: "hidden"});
			}
			return (
				<div id="statusContainer" className={classShow} onClick={this.click}>
					<div className="chartContainer" onClick={this.click}>
						<div className="chartTitle"><center>cpu</center></div>
						<div id="cpu" className={chartClassName}></div>
					</div>
					<div className={className} onClick={this.click}>
						<div>host: {this.props.host.name}</div>
						<div>status: {this.props.host.status}</div>
						<div>agent version: {this.props.host.version}</div>
						<div>time: {this.props.time}</div>
					</div>
					<div className="chartContainer" onClick={this.click}>
						<div className="chartTitle"><center>net</center></div>
						<div id="net" className={chartClassName}></div>
					</div>
				</div>
			);
		} else {
			return (
				<div id="statusContainer" className={classShow}>
					<div id="cpu" className="chartPlaceholder"></div>
					<div className={className}></div>
					<div id="net" className="chartPlaceholder"></div>
				</div>
			);
		}
	}
});

var GroupList = React.createClass({
	sort: function () {
		this.props.updateHostStatus(this.props.host);
	},
	render: function() {
		var result = [];
		var hosts = [];
		if ('result' in this.props.data) {
			result = this.props.data.result;
		}
		var groupNodes = result.map(function(group) {
			var hosts = group.hosts;
			hosts.sort(function(a, b) {
				return a.status.localeCompare(b.status);
			});
			hosts.sort;
			return (
				<div className="groupWrapper">
					<div className="groupHeading">
						<div className="groupTitle">{group.platformName}</div>
						<div>{group.platformCount.all}</div>
					</div>
					<HostList data={group.hosts} updateHostList={this.props.updateGroupList} hideHostList={this.props.hideGroupList} sendURLByHostList={this.props.sendURLByGroup} hideStatusByHostList={this.props.hideStatusByGroup} />
				</div>
			);
		}.bind(this));
		return (
			<div>
				{groupNodes}
			</div>
		);
	}
});

var HostList = React.createClass({
	render: function() {
		var hosts = this.props.data;
		if ('result' in this.props.data) {
			result = this.props.data.result;
		}
		var hostNodes = hosts.map(function(host) {
			var className = 'rectangle ' + host.status;
			if (host.status === 'normal' || host.status === 'warm' || host.status === 'error') {
				className += ' pointer';
			}
			return (
				<Host host={host} hostClassName={className} key={host.id} updateHostStatus={this.props.updateHostList} hideHostStatus={this.props.hideHostList} sendURLByHost={this.props.sendURLByHostList} hideStatusByHost={this.props.hideStatusByHostList}>
				</Host>
			);
		}.bind(this));
		return (
			<div>
				{hostNodes}
			</div>
		);
	}
});

var Host = React.createClass({
	mouseOver: function () {
		this.props.updateHostStatus(this.props.host);
	},
	mouseOut: function () {
		this.props.hideHostStatus();
	},
	click: function () {
		this.props.updateHostStatus(this.props.host);
		var status = this.props.host.status;
		if (status === 'normal' || status === 'warm' || status === 'error') {
			$.ajax({
				url: 'http://localhost/getUrl',
				dataType: 'json',
				cache: false,
				success: function(data) {
					var url = data + this.props.host.name + '/all/3d';
					this.props.sendURLByHost(url);
				}.bind(this),
				error: function(xhr, status, err) {
					console.log('loadConfigFromServer error:');
					console.error('http://localhost/getUrl', status, err.toString());
				}.bind(this)
			});
		}
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
