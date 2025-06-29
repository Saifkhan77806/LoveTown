import {  useEffect, useRef, useState } from 'react'
import { useMatchUser } from '../../store/store';
import { io } from 'socket.io-client';
import { Video, X } from 'lucide-react';


const VedioInterface = ({messageCount} : {messageCount: number}) => {

    const socket = useRef(io('http://localhost:5000')).current;
    const { users } = useMatchUser();

    const [isVideo, setIsVideo] = useState(false);
    const [isCaller, setIsCaller] = useState(false);

    const localVideo = useRef<HTMLVideoElement>(null);
    const remoteVideo = useRef<HTMLVideoElement>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);

    const user1 = users?.user1?._id;
    const user2 = users?.user2?._id;

    const getRoomId = (user1: string | undefined, user2: string | undefined) =>
        [user1, user2].sort().join('-');
    const roomId = getRoomId(user1, user2);

    useEffect(() => {
        socket.emit('register', user1);
        socket.emit('join-room', { from: user1, to: user2 });

        let stream: MediaStream
        const setupMediaAndConnection = async () => {
            if (isVideo) {
                stream = await navigator.mediaDevices.getUserMedia({ video: isVideo ? true : false, audio: isVideo ? true : false });
                localStream.current = stream;

                if (localVideo.current) {
                    localVideo.current.srcObject = stream;
                }
            }

            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            });

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            const remoteStream = new MediaStream();
            pc.ontrack = (event) => {
                remoteStream.addTrack(event.track);
                if (remoteVideo.current) {
                    remoteVideo.current.srcObject = remoteStream;
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { roomId, candidate: event.candidate });
                }
            };

            socket.on('call-made', async ({ offer }) => {
                if (!pc.currentRemoteDescription) {
                    await pc.setRemoteDescription(new RTCSessionDescription(offer));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('make-answer', { roomId, answer });
                    setIsVideo(true)
                }
            });

            socket.on('answer-made', async ({ answer }) => {
                if (!pc.currentRemoteDescription) {
                    await pc.setRemoteDescription(new RTCSessionDescription(answer));
                }
            });

            socket.on('end-call', () => {
                if (peerConnection.current) {
                    peerConnection.current.close();
                    peerConnection.current = null;
                }

                if (localStream.current) {
                    localStream.current.getTracks().forEach((track) => track.stop());
                    localStream.current = null;
                }

                if (localVideo.current) localVideo.current.srcObject = null;
                if (remoteVideo.current) remoteVideo.current.srcObject = null;

                setIsVideo(false); // close modal
            });


            socket.on('ice-candidate', async ({ candidate }) => {
                try {
                    await pc.addIceCandidate(candidate);
                } catch (err) {
                    console.error('Failed to add ICE candidate', err);
                }
            });

            peerConnection.current = pc;
        };

        setupMediaAndConnection();

        return () => {
            socket.off('call-made');
            socket.off('answer-made');
            socket.off('ice-candidate');
            socket.off('end-call'); // ✅ Cleanup this too
        };

    }, [user1, user2, isVideo]);


    const endCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        if (localStream.current) {
            localStream.current.getTracks().forEach((track) => track.stop());
            localStream.current = null;
        }

        if (localVideo.current) localVideo.current.srcObject = null;
        if (remoteVideo.current) remoteVideo.current.srcObject = null;

        socket.emit('end-call', { roomId }); // 👈 Notify the other peer
        setIsVideo(false); // 👈 Close modal
    };

    const startCall = async () => {
        setIsCaller(true);
        if (!peerConnection.current) return;
        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);
        socket.emit('call-user', { roomId, offer });
    };



    
        return (
            <>
            <button
            onClick={() => setIsVideo(true)}
            className={`p-2 rounded-full ${messageCount >= 1 ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <Video size={20} />
          </button>
    {
        isVideo && 
            <div className="w-[80%] h-[65%] bg-gray-800 rounded-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-3 z-50">
                <div
                    className="absolute right-3 top-3 cursor-pointer p-2 hover:bg-white/10 rounded-full text-white"
                    onClick={() => {
                        setIsVideo(false)
                        endCall()
                    }
                    }
                >
                    <X />
                </div>
                <div className="flex gap-4 items-center justify-center p-4">
                    <div className="flex flex-col items-center">
                        <video ref={localVideo} autoPlay muted playsInline className="w-64 h-48 bg-black" />
                        <p className="text-white mt-1 text-sm">{isCaller ? 'You (Caller)' : 'You (Receiver)'}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <video ref={remoteVideo} autoPlay playsInline className="w-64 h-48 bg-black" />
                        <p className="text-white mt-1 text-sm">{isCaller ? 'Receiver' : 'Caller'}</p>
                    </div>
                </div>
                <button onClick={startCall} className="block mx-auto mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Start Call
                </button>
                <button
                    onClick={endCall}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                    End Call
                </button>
            </div>
    }
            </>
    
        )
    

}



export default VedioInterface