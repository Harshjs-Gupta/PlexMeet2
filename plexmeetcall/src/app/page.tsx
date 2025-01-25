"use client";

import { useCallback, useEffect, useState } from "react";
import Shadow from "@/components/home-background/shadow";
import HomeImage from "@/components/homePageImage/home-image";
import Navbar from "@/components/homePageImage/navbar";
import TextField from "@mui/material/TextField";
import { Button, InputAdornment } from "@mui/material";
import mail from "@/assets/icon/mail.png";
import keyboardIcon from "@/assets/icon/keyboardIcon.png";
import Image from "next/image";
import { useSocket } from "./context/socketProvider";
import { useRouter } from "next/navigation";

interface Combine {
  email: string;
  roomCode: string;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const router = useRouter();

  const socket = useSocket();

  //handle submit for joining room
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      socket?.emit("room:join", { email, roomCode });
      setEmail("");
      setRoomCode("");
    },
    [email, roomCode, socket]
  );

  const handleJoinRoom = useCallback(
    (data: Combine) => {
      const { email, roomCode } = data;
      router.push(`/room-page?email=${email}?roomCode=${roomCode}`);
    },
    [router]
  );

  useEffect(() => {
    socket?.on("room:join", handleJoinRoom);
    return () => {
      socket?.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div className="background relative overflow-hidden">
      <Shadow />
      <div className="relative p-3">
        <Navbar />
      </div>
      <div className="relative flex sm:flex-row flex-col sm:gap-32 gap-5 items-center">
        <HomeImage />
        <div className="relative right-0 flex flex-col gap-5 sm:p-0 p-3">
          <div className="flex flex-col gap-2">
            <span className="sm:text-5xl text-2xl text-[#353B51] font-bold">
              Video calls and meetings
            </span>
            <span className="sm:text-5xl text-2xl text-[#353B51] font-bold">
              for everyone
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="sm:text-[#737373] text-[#353b51cc] sm:text-3xl text-md">
              Connect, Collaborate and celebrate from
            </span>
            <span className="sm:text-[#737373] text-[#353b51cc] sm:text-3xl text-md">
              anywhere with Plex Meet
            </span>
          </div>
          <form
            className="flex gap-5 sm:flex-row flex-col"
            onSubmit={handleSubmit}
          >
            <TextField
              variant="outlined"
              label="Email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image src={mail} alt="mail" className="h-5 w-5" />
                  </InputAdornment>
                ),
              }}
              size="small"
              className="w-[350px] sm:w-auto"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              label="Room Code"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Image src={keyboardIcon} alt="mail" className="h-5 w-5" />
                  </InputAdornment>
                ),
              }}
              size="small"
              className="w-[350px] sm:w-auto"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <Button
              variant="contained"
              type="submit"
              size="small"
              className="w-[350px] sm:w-auto"
              sx={{ backgroundColor: "#353B51" }}
            >
              Enter
            </Button>
          </form>
          <div className="sm:w-[500px] w-[350px]  border-b-2 border-black "></div>
        </div>
      </div>
    </div>
  );
}
