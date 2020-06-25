var serverName = "6znge7x7all00000";
var peerConfig =  {
	host: "/",
	port: 9000,
	debug: 2
};
peerConfig = null;

var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var userMediaStream;
getUserMedia({
	audio : true,
	video : false
}, (stream) => {
	userMediaStream = stream;
}), (error) => {
	console.error("Failed to get media stream", error);
};

function open() {
	var peer = new Peer(null, peerConfig);
	peer.on('error', (error) => {
		console.error("Peer error :");
		console.error(error);
	});
	peer.on('open', (id) => {
		console.log("Peer : Opened with ID : " + id);
		$("#peer_ID").text(id);

		var dataConnection = peer.connect(serverName);
		dataConnection.on('data', (data) => {
			console.log("DataConnection : data");
			console.log(data);
		});
		dataConnection.on('open', () => {
			console.log("DataConnection : open");
		});
		dataConnection.on('close', () => {
			console.log("DataConnection : close");
		});
		dataConnection.on('error', (error) => {
			console.error("DataConnection : error");
			console.error(error);
		});
		window.dataConnection = dataConnection;
	});
	peer.on('connection', (connection) => {
		console.log("Peer : Incoming connection:");
		console.log(connection);
	});
	peer.on('call', async (call) => {
		console.log("Peer : Incoming call:");
		console.log(call);
	
		call.on('stream', function(stream) {
			console.log("Call : Stream");
			console.log(stream);
	
			var audioOut = document.querySelector('audio#audio');
			audioOut.srcObject = stream;
		});
		call.on('close', function() {
			console.log("Call : Close");
		});
		call.on('error', function(error) {
			console.error("Call Error :");
			console.error(error);
		});
		window.call = call;

		call.answer(userMediaStream);
	});
	peer.on('disconnected', () => {
		console.log("Peer : Disconnected");
		$("#peer_ID").text("");
		peer.reconnect();
	});
	window.peer = peer;
}

$("#stopButton").click(() => {
	if (window.call) {
		window.call.close();
	} 
	if (window.peer) {
		window.peer.destroy();
	}
});

$("#listenButton").click(() => {
	open();
});