import plexMeet from "@/assets/logo/plexMeet.png";
import Image from "next/image";

function Navbar() {
  return (
    <span className="flex gap-3 items-center ">
      <Image src={plexMeet} alt="plexMeet" width={80} height={80} />
      <span className="text-3xl text-[#353B51] font-bold">Plex Meet</span>
    </span>
  );
}
export default Navbar;
