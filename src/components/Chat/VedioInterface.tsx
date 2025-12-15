import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Video, X } from "lucide-react";

const VedioInterface = ({ messageCount }: { messageCount: number }) => {
//   const socket = useRef(io("http://localhost:5000")).current;

//   const [isVideo, setIsVideo] = useState(false);
//   const [isCaller, setIsCaller] = useState(false);

//   const localVideo = useRef<HTMLVideoElement>(null);
//   const remoteVideo = useRef<HTMLVideoElement>(null);
//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const localStream = useRef<MediaStream | null>(null);

//   const user1 = "";
//   const user2 = "";

//   const getRoomId = (user1: string | undefined, user2: string | undefined) =>
//     [user1, user2].sort().join("-");
//   const roomId = getRoomId(user1, user2);

//   useEffect(() => {
//     socket.emit("register", user1);
//     socket.emit("join-room", { from: user1, to: user2 });

//     let stream: MediaStream;
//     const setupMediaAndConnection = async () => {
//       if (isVideo) {
//         stream = await navigator.mediaDevices.getUserMedia({
//           video: isVideo ? true : false,
//           audio: isVideo ? true : false,
//         });
//         localStream.current = stream;

//         if (localVideo.current) {
//           localVideo.current.srcObject = stream;
//         }
//       }

//       const pc = new RTCPeerConnection({
//         iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//       });

//       stream.getTracks().forEach((track) => pc.addTrack(track, stream));

//       const remoteStream = new MediaStream();
//       pc.ontrack = (event) => {
//         remoteStream.addTrack(event.track);
//         if (remoteVideo.current) {
//           remoteVideo.current.srcObject = remoteStream;
//         }
//       };

//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("ice-candidate", { roomId, candidate: event.candidate });
//         }
//       };

//       socket.on("call-made", async ({ offer }) => {
//         if (!pc.currentRemoteDescription) {
//           await pc.setRemoteDescription(new RTCSessionDescription(offer));
//           const answer = await pc.createAnswer();
//           await pc.setLocalDescription(answer);
//           socket.emit("make-answer", { roomId, answer });
//           setIsVideo(true);
//         }
//       });

//       socket.on("answer-made", async ({ answer }) => {
//         if (!pc.currentRemoteDescription) {
//           await pc.setRemoteDescription(new RTCSessionDescription(answer));
//         }
//       });

//       socket.on("end-call", () => {
//         if (peerConnection.current) {
//           peerConnection.current.close();
//           peerConnection.current = null;
//         }

//         if (localStream.current) {
//           localStream.current.getTracks().forEach((track) => track.stop());
//           localStream.current = null;
//         }

//         if (localVideo.current) localVideo.current.srcObject = null;
//         if (remoteVideo.current) remoteVideo.current.srcObject = null;

//         setIsVideo(false); // close modal
//       });

//       socket.on("ice-candidate", async ({ candidate }) => {
//         try {
//           await pc.addIceCandidate(candidate);
//         } catch (err) {
//           console.error("Failed to add ICE candidate", err);
//         }
//       });

//       peerConnection.current = pc;
//     };

//     setupMediaAndConnection();

//     return () => {
//       socket.off("call-made");
//       socket.off("answer-made");
//       socket.off("ice-candidate");
//       socket.off("end-call"); // ✅ Cleanup this too
//     };
//   }, [user1, user2, isVideo]);

//   const endCall = () => {
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     if (localStream.current) {
//       localStream.current.getTracks().forEach((track) => track.stop());
//       localStream.current = null;
//     }

//     if (localVideo.current) localVideo.current.srcObject = null;
//     if (remoteVideo.current) remoteVideo.current.srcObject = null;

//     socket.emit("end-call", { roomId }); // 👈 Notify the other peer
//     setIsVideo(false); // 👈 Close modal
//   };

//   const startCall = async () => {
//     setIsCaller(true);
//     if (!peerConnection.current) return;
//     const offer = await peerConnection.current.createOffer();
//     await peerConnection.current.setLocalDescription(offer);
//     socket.emit("call-user", { roomId, offer });
//   };

  return (
    <>
      <button
        // onClick={() => setIsVideo(true)}
        className={`p-2 rounded-full ${
          messageCount >= 100
            ? "text-blue-600 hover:bg-blue-50"
            : "text-gray-300 cursor-not-allowed"
        }`}
        disabled
      >
        <Video size={20} />
      </button>
    </>
  );
};

export default VedioInterface;
