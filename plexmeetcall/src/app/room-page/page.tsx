"use client";
import dynamic from "next/dynamic";
import Navbar from "@/components/homePageImage/navbar";
import { useSocket } from "../context/socketProvider";
import { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";

// Interfaces for TypeScript
interface UserJoin {
  email: string;
  id: string;
}

interface IncomingCall {
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface CallAccepted {
  from: string;
  answer: RTCSessionDescriptionInit;
}

interface NegotiationIncoming {
  from: string;
  offer: RTCSessionDescriptionInit;
}

// RoomPage Component
function RoomPage() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure rendering only after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleUserJoined = useCallback(({ email, id }: UserJoin) => {
    console.log(`Email ${email} joined room with id ${id}`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMyStream(stream);
      const offer = await peer.getOffer();
      socket?.emit("user:call", {
        to: remoteSocketId,
        offer,
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }: IncomingCall) => {
      try {
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMyStream(stream);
        console.log(`Incoming call`, from, offer);
        const answer = await peer.getAnswer(offer);
        socket?.emit("call:accepted", {
          to: from,
          answer,
        });
      } catch (error) {
        console.error("Error handling incoming call:", error);
      }
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => {
        peer.peer.addTrack(track, myStream);
      });
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, answer }: CallAccepted) => {
      peer.setLocalDescription(answer);
      console.log(`Call accepted`, from, answer);
      sendStream();
    },
    [sendStream]
  );

  const handleNegotiation = useCallback(async () => {
    const offer = await peer.getOffer();
    socket?.emit("peer:negotiation:needed", {
      offer,
      to: remoteSocketId,
    });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    if (peer?.peer) {
      peer.peer.addEventListener("negotiationneeded", handleNegotiation);
      return () => {
        peer.peer.removeEventListener("negotiationneeded", handleNegotiation);
      };
    }
  }, [handleNegotiation]);

  const handleNegotiationIncoming = useCallback(
    async ({ from, offer }: NegotiationIncoming) => {
      const answer = await peer.getAnswer(offer);
      socket?.emit("peer:nego:done", { to: from, answer });
    },
    [socket]
  );

  const handleNegotiationFinal = useCallback(
    async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      await peer.setLocalDescription(answer);
    },
    []
  );

  useEffect(() => {
    if (peer?.peer) {
      const trackHandler = (e: RTCTrackEvent) => {
        setRemoteStream(e.streams[0]);
      };
      peer.peer.addEventListener("track", trackHandler);
      return () => {
        peer.peer.removeEventListener("track", trackHandler);
      };
    }
  }, []);

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:negotiation:needed", handleNegotiationIncoming);
    socket?.on("peer:nego:final", handleNegotiationFinal);
    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:negotiation:needed", handleNegotiationIncoming);
      socket?.off("peer:nego:final", handleNegotiationFinal);
    };
  }, [
    handleUserJoined,
    socket,
    handleIncomingCall,
    handleCallAccepted,
    handleNegotiationIncoming,
    handleNegotiationFinal,
  ]);

  if (!isClient) return null; // Prevents SSR hydration mismatch

  return (
    <div className="p-5 h-screen w-screen roomPageBg">
      <Navbar />
      <h1 className="text-center text-[#353B51] text-xl font-semibold">
        {remoteSocketId ? "Connected" : "No one in room"}
      </h1>
      <div className="flex sm:flex-row flex-col items-start gap-5 justify-between p-2">
        <div className="flex flex-col sm:w-[500px] w-[300px] gap-5">
          {myStream && (
            <>
              <span className="text-2xl text-[#353B51] font-semibold">You</span>
              <ReactPlayer
                height="240px"
                width="370px"
                playing
                muted
                url={myStream}
                className="rounded-lg border sm:w-[500px] w-[300px] border-black"
              />
            </>
          )}
        </div>
        <div className="flex flex-col sm:items-end sm:w-[500px] w-[300px] gap-5">
          {remoteStream && (
            <>
              <span className="text-2xl text-right text-[#353B51] font-semibold">
                Other Participants
              </span>
              <ReactPlayer
                height="240px"
                width="370px"
                playing
                muted
                url={remoteStream}
                className="rounded-lg border border-black"
              />
            </>
          )}
        </div>
      </div>
      <div className="flex gap-5">
        {remoteSocketId && (
          <button
            className="mt-5 bg-[#948eff6f] p-2 rounded-md text-[#353B51] font-semibold border border-black"
            onClick={handleCallUser}
          >
            Share my video
          </button>
        )}
        {remoteStream && (
          <button
            className="mt-5 bg-[#948eff6f] p-2 rounded-md text-[#353B51] font-semibold border border-black"
            onClick={sendStream}
          >
            Share Stream
          </button>
        )}
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(RoomPage), { ssr: false });
