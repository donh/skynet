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
		this.loadHostsFromServer();
		setInterval(this.loadCommentsFromServer, this.props.pollInterval);
	},
	handleStatusUpdate: function(host) {
		this.setState({
			host: host
		});
	},
	render: function() {
		return (
			<div className="wrapper">
				<HostStatus host={this.state.host} />
				<HostList data={this.state.data} updateHostList={this.handleStatusUpdate} />
			</div>
		);
	}
});

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