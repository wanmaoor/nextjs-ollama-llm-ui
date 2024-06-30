"use client";

import React, {useEffect} from "react";
import {ChatProps} from "./chat";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {Button, buttonVariants} from "../ui/button";
import TextareaAutosize from "react-textarea-autosize";
import {motion, AnimatePresence} from "framer-motion";
import {ImageIcon, PaperPlaneIcon, StopIcon} from "@radix-ui/react-icons";
import {Mic, SendHorizonal, X} from "lucide-react";
import useSpeechToText from "@/app/hooks/useSpeechRecognition";
import {toBase64} from "@/utils/util";
import Image from "next/image";
import {HoverImage} from "@/components/chat/HoverImage";

export default function ChatBottombar({
                                        messages,
                                        input,
                                        handleInputChange,
                                        handleSubmit,
                                        isLoading,
                                        error,
                                        stop,
                                        formRef,
                                        setInput,
                                      }: ChatProps) {
  const [message, setMessage] = React.useState(input);
  const [isMobile, setIsMobile] = React.useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [imageFiles, setImageFiles] = React.useState<FileList | null>(null);
  const [base64Images, setBase64Images] = React.useState<Array<string>>([]);


  React.useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Initial check
    checkScreenWidth();

    // Event listener for screen width changes
    window.addEventListener("resize", checkScreenWidth);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>, {images: base64Images});
    }
  };

  const {isListening, transcript, startListening, stopListening} =
    useSpeechToText({continuous: true});

  const listen = () => {
    isListening ? stopVoiceInput() : startListening();
  };

  const stopVoiceInput = () => {
    setInput && setInput(transcript.length ? transcript : "");
    stopListening();
  };

  const handleListenClick = () => {
    listen();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isLoading) {
      stopVoiceInput();
    }
  }, [isLoading]);

  const imageToBase64 = async (files: FileList | null): Promise<string[]> => {
    const base64List: string[] = [];
    if (files) {
      for await (const file of files) {
        let base64: string = await toBase64(file);
        base64List.push(base64);
      }
    }
    return base64List;
  }

  React.useEffect(() => {
    imageToBase64(imageFiles).then(res => {
      setBase64Images(res);
    });
  }, [imageFiles])

  const removeImageFile = (index: number) => {
    if (imageFiles) {
      const fileArray = Array.from(imageFiles)
      fileArray.splice(index, 1)
      const newFileList = new DataTransfer()
      for (const file of fileArray) {
        newFileList.items.add(file)
      }
      setImageFiles(newFileList.files)
    }
  }

  const appendFiles = (files: FileList) => {
    setImageFiles(prevFiles => {
      const dataTransfer = new DataTransfer();
      if (prevFiles) {
        // @ts-ignore
        for (const prevFile of prevFiles) {
          dataTransfer.items.add(prevFile)
        }
      }

      // @ts-ignore
      for (const file of files) {
        dataTransfer.items.add(file)
      }

      return dataTransfer.files
    });
  }
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    const files = dt.files;
    appendFiles(files)
  }

  const handleFileChange = () => {
    if (fileRef.current?.files) {
      appendFiles(fileRef.current.files);
    }
  }


  return (
    <div className="p-4 pb-7 flex justify-between w-full items-center gap-2">
      <AnimatePresence initial={false}>
        <div
          className="w-full items-center flex relative gap-2"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="absolute left-5 z-10 bottom-7">
            <Button
              className="shrink-0 rounded-full"
              variant="ghost"
              size="icon"
              onClick={() => fileRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5"/>
            </Button>
          </div>
          <div className={"w-full bg-accent rounded-3xl p-4"}>
            <input ref={fileRef} type="file" accept={'image/*'} multiple className={'hidden'} onChange={handleFileChange}/>
            <div className="flex items-center gap-2 px-2 mb-2">
              {
                base64Images.map((base64, i) => (
                  <HoverImage base64={base64} key={base64} remove={() => removeImageFile(i)}  />
                ))
              }
            </div>
            <form
              onSubmit={(e) => handleSubmit(e, {images: base64Images})}
              className="w-full items-center flex relative gap-2"
            >
              <TextareaAutosize
                autoComplete="off"
                value={
                  isListening ? (transcript.length ? transcript : "") : input
                }
                ref={inputRef}
                onKeyDown={handleKeyPress}
                onChange={handleInputChange}
                name="message"
                placeholder={
                  !isListening ? "Enter your prompt here" : "Listening"
                }
                className="rounded-3xl max-h-24 px-14 bg-accent py-[22px] text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full  flex items-center h-16 resize-none overflow-hidden dark:bg-card"
              />
              {!isLoading ? (
                <div className="flex absolute right-3 items-center">
                  {isListening ? (
                    <div className="flex">
                      <Button
                        className="shrink-0 relative rounded-full bg-blue-500/30 hover:bg-blue-400/30 "
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={handleListenClick}
                        disabled={isLoading}
                      >
                        <Mic className="w-5 h-5 "/>
                        <span className="animate-pulse absolute h-[120%] w-[120%] rounded-full bg-blue-500/30"/>
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="shrink-0 rounded-full"
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={handleListenClick}
                      disabled={isLoading}
                    >
                      <Mic className="w-5 h-5 "/>
                    </Button>
                  )}
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    disabled={isLoading || !input.trim() || isListening}
                  >
                    <SendHorizonal className="w-5 h-5 "/>
                  </Button>
                </div>
              ) : (
                <div className="flex absolute right-3 items-center">
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="button"
                    disabled={true}
                  >
                    <Mic className="w-5 h-5 "/>
                  </Button>
                  <Button
                    className="shrink-0 rounded-full"
                    variant="ghost"
                    size="icon"
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      stop();
                    }}
                  >
                    <StopIcon className="w-5 h-5  "/>
                  </Button>
                </div>
              )}
            </form>
          </div>

        </div>
      </AnimatePresence>
    </div>
  );
}
