// components/KofiButton.js
import { motion } from "framer-motion";
import { KofiIcon } from "./icons";

const KofiButton = () => {
  return (
    <motion.a
      href="https://buymeacoffee.com/jcwatch"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center text-black dark:text-white rounded-full shadow-lg overflow-hidden cursor-pointer focus:outline-none"
      whileHover="hover"
      initial="initial"
      animate="initial"
      variants={{
        initial: { width: "2.9rem" },
        hover: { width: "13rem" },
      }}
      transition={{ type: "tween", stiffness: 100 }}
    >
      <KofiIcon />

      <motion.span
        className="whitespace-nowrap pr-1"
        variants={{
          initial: { opacity: 0, width: 0 },
          hover: { opacity: 1, width: "auto" },
        }}
        transition={{ duration: 0.3 }}
      >
        Buy Me a Coffee
      </motion.span>
    </motion.a>
  );
};

export default KofiButton;
