"use client";

import { Button } from "@nextui-org/button";
import { RefreshCcw, SquareArrowUpRight } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    /* eslint-disable no-console */
  }, [error]);

  return (
    <div>
      <h2>The page couldn't load properly :( . If you believe this is a bug please report it in our <a target="_blank" className="text-blue-600 underline" href="https://discord.gg/GXu64738nD">Discord server <SquareArrowUpRight size={14} className="inline-block"/> </a></h2>
      <Button
      className="my-2"
      variant="ghost"
      color="warning"
      startContent={
        <RefreshCcw />
      }
        onPress={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
