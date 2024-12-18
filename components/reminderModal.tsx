"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect } from "react";

export const ReminderModal = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const hasSeenModal = sessionStorage.getItem("hasSeenReminderModal");
    if (!hasSeenModal) {
      onOpen();
      sessionStorage.setItem("hasSeenReminderModal", "true");
    }
  }, []);

  return (
    <div>
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        radius="lg"
        classNames={{
          body: "py-6",
          backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
          base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
          header: "border-b-[1px] border-[#292f46]",
          footer: "border-t-[1px] border-[#292f46]",
          closeButton: "hover:bg-white/5 active:bg-white/10",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Support JC-Anime ❤️
              </ModalHeader>
              <ModalBody>
                <p>
                  Welcome to <strong>JC-Anime!</strong> We're proud to provide
                  an ad-free, free-to-use platform for all your entertainment
                  needs. 🎥✨
                </p>
                <p>
                  To keep this platform running and free for everyone, we rely
                  on donations and the support of our amazing community.
                </p>
                <p className="mt-4">
                  <strong>Ways you can support us:</strong>
                </p>
                <ul className="list-disc pl-6">
                  <li>
                    <a
                      href="https://www.buymeacoffee.com/jcwatch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6f4ef2] underline"
                    >
                      Buy us a coffee ☕
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://discord.gg/GXu64738nD"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6f4ef2] underline"
                    >
                      Join our Discord Community 🌐
                    </a>
                  </li>
                </ul>
                <p className="mt-4">
                  Every contribution, big or small, helps us maintain and
                  improve the platform. Thank you for being part of the
                  JC-Anime family!
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};
