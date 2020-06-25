var serverName = "Party_Not_PaTI_Server";
var peerConfig =  {
	host: "/",
	port: 9000,
	debug: 2
};
serverName = null;
peerConfig = null;

function repopulateConnections() {
	let list = $("#connections_list");
	list.empty();
	for(let connection of Object.keys(peer.connections)) {
		list.append($(`<ul>${connection}</ul>`));
	}
}

async function enumerateDevices() {
	let allDevices = await navigator.mediaDevices.enumerateDevices();
	let deviceIndex = 0;
	for(let device of allDevices) {
		switch(device.kind) {
			case 'audioinput':
				$("<option />")
				.attr('value', device.deviceId)
				.text(device.label || `Input #${deviceIndex}`)
				.appendTo("#input_device_selector");
			    deviceIndex++;
			break;
		}
	}
	$("#recordButton").show();
}
$("#recordButton").hide();
enumerateDevices();

$("#recordButton").click(() => {
	$("#recordButton").hide();
	var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
	var userMediaStream;
	getUserMedia({ 
		audio : {
			deviceId: $(".inputSelector select option:selected").val(),
			autoGainControl: false,
			channelCount: 2,
			echoCancellation: false,
			latency: 0,
			noiseSuppression: false,
			sampleRate: 48000,
			sampleSize: 16,
			volume: 1.0
		  },
		video : false
	}, (stream) => {
		userMediaStream = stream;
		window.userMediaStream = userMediaStream;
	}, (error) => {
		console.error("Failed to get user media strream", error);
	});

	var peer = new Peer(serverName, peerConfig);
	peer.on('error', (error) => {
		console.error("Peer error :");
		console.error(error);
	});
	peer.on('open', (id) => {
		console.log("Peer : Opened with ID : " + id);
		$("#peer_ID").text(id);
	});
	peer.on('connection', (connection) => {
		console.log("Peer : Incoming connection:");
		console.log(connection);

		// call client on connection
		call = peer.call(connection.peer, userMediaStream);
		call.on('stream', function(stream) {
			console.log("Call : Stream");
			console.log(stream);
		});
		call.on('close', function() {
			console.log("Call : Close");
		});
		call.on('error', function(error) {
			console.error("Call Error :");
			console.error(error);
		});
		window.call = call;

		repopulateConnections();
	});

	peer.on('call', (call) => {
		console.log("Peer : Incoming call:");
		console.log(call);
	});
	peer.on('disconnected', () => {
		console.log("Peer : Disconnected");
		repopulateConnections();
	});

	if(false) {
		// answer calls
		var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
		peer.on('call', function (call) {
			getUserMedia({ video: false, audio: true }, function (stream) {
				call.answer(stream); // Answer the call with an A/V stream.
			}, function (err) {
				console.log('Failed to get local stream', err);
			});
		});
	}

	window.peer = peer;
});
