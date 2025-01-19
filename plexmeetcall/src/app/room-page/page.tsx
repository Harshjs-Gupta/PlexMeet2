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
  const [myStream, setMyStream] = useState<MediaStream>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  const handleUserJoined = useCallback(({ email, id }: UserJoin) => {
    console.log(`Email ${email} joined room with id ${id}`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    if (typeof window !== "undefined" && navigator.mediaDevices) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const offer = await peer.getOffer();
      socket?.emit("user:call", {
        to: remoteSocketId,
        offer,
      });
      setMyStream(stream);
    }
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }: IncomingCall) => {
      if (typeof window !== "undefined" && navigator.mediaDevices) {
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
      }
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    if (myStream) {
      for (const track of myStream.getTracks()) {
        peer.peer.addTrack(track, myStream);
      }
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
        const remoteStream = e.streams[0];
        setRemoteStream(remoteStream);
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

  return (
    <div className="p-5 h-screen w-screen bg-[#BAD2D9]">
      <Navbar />
      <h1 className="text-center text-[#353B51] text-xl font-semibold">
        {remoteSocketId ? "Connected" : "No one in room"}
      </h1>
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-5">
          {myStream && (
            <>
              <span className="text-2xl text-[#353B51] font-semibold">You</span>
              <ReactPlayer
                height="240px"
                width="500px"
                playing
                muted
                url={myStream}
                className="rounded-lg border border-black"
              />
            </>
          )}
        </div>
        <div className="flex flex-col gap-5">
          {remoteStream && (
            <>
              <span className="text-2xl text-right text-[#353B51] font-semibold">
                Other Participants
              </span>
              <ReactPlayer
                height="240px"
                width="500px"
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
