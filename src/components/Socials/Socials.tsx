import Link from "next/link";

import DiscordIcon from "../Icons/SocialIcons/Discord";
import GalxeIcon from "../Icons/SocialIcons/Galxe";
import GitBookIcon from "../Icons/SocialIcons/GitBook";
import MediumIcon from "../Icons/SocialIcons/Medium";
import XIcon from "../Icons/SocialIcons/X";

export default function Socials() {
  return (
    <div className="mx-auto flex items-center justify-center space-x-10 py-10 text-shade-mute transition">
      <Link
        href="https://go.zeusnetwork.xyz/galxe-muses-atelier-01"
        target="_blank"
        className="transition hover:text-shade-secondary"
      >
        <GalxeIcon />
      </Link>
      <Link
        href="https://x.com/ApolloByZeus"
        target="_blank"
        className="transition hover:text-shade-secondary"
      >
        <XIcon />
      </Link>
      <Link
        href="https://docs.apollobyzeus.app/"
        target="_blank"
        className="transition hover:text-shade-secondary"
      >
        <GitBookIcon />
      </Link>
      <Link
        href="https://discord.com/invite/zeusnetwork"
        target="_blank"
        className="transition hover:text-shade-secondary"
      >
        <DiscordIcon />
      </Link>
      <Link
        href="https://medium.com/@apollo-by-zeusnetwork"
        target="_blank"
        className="transition hover:text-shade-secondary"
      >
        <MediumIcon />
      </Link>
    </div>
  );
}
