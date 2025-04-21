"use client";

/* eslint-disable react/display-name */

import dynamic from "next/dynamic";
import React from "react";
import { EmailEditorProps } from "react-email-editor";
import parse from "html-react-parser";

const EditorWrapper = dynamic(
  async () => {
    const { default: Editor } = await import("react-email-editor");

    const MyEditor = ({ forwardedRef, onLoad, ...props }: any) => (
      <Editor ref={forwardedRef} onLoad={onLoad} options={{}} {...props} />
    );
    return MyEditor;
  },
  { ssr: false },
);

export default function EmailEditor({ innerRef, exportHtml, body }: any) {
  //   const emailEditorRef = useRef<EditorRef>(null);

  //   const exportHtml = () => {
  //     console.log("first");
  //     console.log(emailEditorRef);
  //     const unlayer = emailEditorRef.current?.editor;
  //     unlayer?.exportHtml((data) => {
  //       console.log("data: ", data);
  //       const { design, html } = data;
  //       console.log(html);
  //     });
  //   };

  const onLoad: EmailEditorProps["onLoad"] = (unlayer) => {
    unlayer.loadDesign({
      html: body,
      classic: true,
    } as any);
  };

  return (
    <>
      <EditorWrapper forwardedRef={innerRef} onLoad={onLoad} />

      <div className="mt-10 flex justify-center">
        <button
          onClick={exportHtml}
          className="w-52 cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
        >
          Submit
        </button>
      </div>
    </>
  );
}
