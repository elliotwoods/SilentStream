const socket = io();

const leftMeterClip = document.querySelector("#left .clip");
const rightMeterClip = document.querySelector("#right .clip");

const leftMeterAverage = document.querySelector("#left .average");
const rightMeterAverage = document.querySelector("#right .average");

let videoElement = document.querySelector("video");

try {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
}
catch (e) {
	alert('Web Audio API not supported');
	console.log(e);
}

var audioInput;
var script;
var detectedLevelClip = [0, 0];
var detectedLevelAverage = [0, 0];

var rtcPeerConnection = null;

const minDbValue = -10.0;
function decibelRangeValue(realValue) {
	let value = Math.log10(realValue) / minDbValue;
	return Math.max(Math.min(1.0 - value, 1), 0);
}

async function startRecord() {
	window.audioContext = new AudioContext();

	let inputConstraints = {
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
	};
	let stream = await navigator.mediaDevices.getUserMedia(inputConstraints);

	// put var into global scope
	window.stream = stream;	

	script = audioContext.createScriptProcessor(256, 2, 2);

	script.onaudioprocess = (event) => {
		for(let channelIndex = 0; channelIndex < 2; channelIndex++) {
			const input = event.inputBuffer.getChannelData(channelIndex);
			let max = 0;
			let sumSquares = 0;
			for(let i=0; i<input.length; ++i) {
				const level2 = input[i] * input[i];
				if(level2 > max) {
					max = level2;
				}
				sumSquares += level2
			}
			detectedLevelClip[channelIndex] = max;
			detectedLevelAverage[channelIndex] = sumSquares / input.length;
		}
	}

	audioInput = audioContext.createMediaStreamSource(stream);
	audioInput.connect(script);

	setInterval(() => {
		leftMeterClip.value = decibelRangeValue(detectedLevelClip[0]).toFixed(2);
		leftMeterAverage.value = decibelRangeValue(detectedLevelAverage[0]).toFixed(2);
		rightMeterClip.value = decibelRangeValue(detectedLevelClip[1]).toFixed(2);
		rightMeterAverage.value = decibelRangeValue(detectedLevelAverage[1]).toFixed(2);
	});
	
	script.connect(audioContext.destination);



	rtcPeerConnection = new RTCPeerConnection();
	rtcPeerConnection.onicecandidate = e => onIceCandidate(rtcPeerConnection, e);
	stream.getTracks().forEach(track => {
		rtcPeerConnection.addTrack(track, stream);
	});
	let connectionDescription = await rtcPeerConnection.createOffer({
		voiceActivityDetection: false
	});
	await rtcPeerConnection.setLocalDescription(connectionDescription);
	socket.emit("setBroadcastDescription", connectionDescription);

	videoElement.srcObject = stream;
	updateMonitoring();
}

async function updateMonitoring() {
	let deviceId = $(".outputSelector select option:selected").val();
	videoElement.setSinkId(deviceId);

	// let outputConstraints = {
	// 	audio : {
	// 		deviceId: deviceId,
	// 	},
	// 	video : false
	// };
	// let outputStream = await navigator.mediaDevices.getUserMedia(outputConstraints);
	// let audioOutput = audioContext.createMediaStreamDestination(outputStream);
	// script.connect(audioOutput);
	
}

function onIceCandidate(rtcPeerConnection, event) {
	console.log(event.candidate);
}

function handleError(error) {
	console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

let devices = {
	audioinput : [],
	audiooutput : [],
	videoinput : []
};

async function enumerateDevices() {
	let allDevices = await navigator.mediaDevices.enumerateDevices();
	let deviceIndex = 0;
	for(let device of allDevices) {
		devices[device.kind].push(device);
	}

	for(let device of devices.audioinput) {
		$("<option />")
			.attr('value', device.deviceId)
			.text(device.label || `Input #${deviceIndex}`)
			.appendTo(".inputSelector select");
		deviceIndex++;
	}

	for(let device of devices.audiooutput) {
		$("<option />")
			.attr('value', device.deviceId)
			.text(device.label || `Output #${deviceIndex}`)
			.appendTo(".outputSelector select");
		deviceIndex++;
	}
}

$(document).ready(() => {

	enumerateDevices();

	$("#recordButton").click(() => {
		startRecord();
	})
});
