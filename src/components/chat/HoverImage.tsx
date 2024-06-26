import React, {useState} from "react";
import {CircleX} from "lucide-react";
import Image from "next/image";
interface HoverImageProps {
  base64: string,
  remove: Function
}
export const HoverImage: React.FC<HoverImageProps> = ({base64, remove}) => {
  const [showClose, setShowClose] = useState(false);

  return (
    <div
      className={'relative'}
      key={base64}
      onMouseEnter={() => setShowClose(true)}
      onMouseLeave={() => setShowClose(false)}
    >
      {showClose && <CircleX onClick={() => remove()} className={'w-5 h-5 -top-2 -right-2 absolute cursor-pointer'}/>}
      <Image width={100} height={100} src={base64} alt="#" className="rounded"/>
    </div>
  )
}
