console.log('JS_LOADED');
const socket = io();

let localStream;
let peerConnection;
let room = null;

const config = {
    iceServers: [
        {urls: 'stun:stun.l.google.com:19302'}
        ]
    };

async function init(){
    localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
        });
    
    document.getElementById('localVideo').srcObject = localStream;
    }

init();

window.joinRoom = function (){
    room = document.getElementById('roomInput').value;
    
    if (!room) {
        alert('Masukkan room dulu!');
        return;
    }
    socket.emit('join', {room:room});
    alert('Joined room: '+room);
    }

function createPeerConnection(){
    peerConnection = new RTCPeerConnection(config);
    
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
        });
    
    peerConnection.ontrack = event => {
        document.getElementById('remoteVideo').srcObject = event.streams[0];
        };
    peerConnection.onicecandidate = event => {
        if (event.candidate){
            socket.emit('ice-candidate', {
                room:room,
                candidate:event.candidate
                });
            }
        };
    }

window.startCall = async function () {
    if (!room) {
        alert("Join room dulu!");
        return;
    }

    createPeerConnection();

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit('offer', {
        room: room,
        offer: offer
    });
};

socket.on('offer', async (offer) => {
    createPeerConnection();
    
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
        );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    socket.emit('answer', {
        room:room,
        answer:answer
        });
    });

socket.on('answer', async (answer) => {
    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer)
        );
    });
    
socket.on("ice-candidate", async (candidate) => {
    try {
        await peerConnection.addIceCandidate(candidate);
    } catch (e) {
        console.error("ICE error:", e);
    }
});

