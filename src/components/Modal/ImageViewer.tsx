import Image from "next/image";
import React from "react";
import Modal from "react-responsive-modal";

export default function ImageViewer({ isModalOpen, setIsModalOpen, url }: any) {
  return (
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} center>
      <div className="p-10">
        <Image src={url} width={1200} height={1200} alt="attachment" />
      </div>
    </Modal>
  );
}
