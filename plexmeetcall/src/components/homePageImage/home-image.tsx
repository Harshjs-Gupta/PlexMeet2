import Image from "next/image";
import videoAvatar from "@/assets/image/videoAvatar.png";
import phone from "@/assets/image/phone.png";

function HomeImage() {
  return (
    <div className="flex-col relative  sm:left-20 left-0">
      <Image src={videoAvatar} alt="Home Image" width={431} height={331} />
      <Image
        src={phone}
        alt="Home Image"
        width={180}
        height={180}
        className="relative left-20 sm:block hidden"
      />
    </div>
  );
}
export default HomeImage;
