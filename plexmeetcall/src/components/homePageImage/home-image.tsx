import Image from "next/image";
import videoAvatar from "@/assets/image/videoAvatar.png";
import phone from "@/assets/image/phone.png";

function HomeImage() {
  return (
    <div className="flex flex-col relative left-20">
      <Image src={videoAvatar} alt="Home Image" width={431} height={331} />
      <Image
        src={phone}
        alt="Home Image"
        width={180}
        height={180}
        className="relative left-20 "
      />
    </div>
  );
}
export default HomeImage;
