import Link from "next/link";

import GitBookIcon from "../Icons/SocialIcons/GitBook";
import GithubIcon from "../Icons/SocialIcons/Github";
import XIcon from "../Icons/SocialIcons/X";

export default function Socials() {
  return (
    <div className="mx-auto flex items-center justify-center space-x-10 py-10 text-shade-mute transition">
      <Link
        href="https://x.com/ApolloByZeus"
        target="_blank"
        className="transition hover:text-primary-apollo"
      >
        <XIcon />
      </Link>
      <Link
        href="https://github.com/ZeusNetworkHQ/orpheus/README.md"
        target="_blank"
        className="transition hover:text-primary-apollo"
      >
        <GitBookIcon />
      </Link>
      <Link
        href="https://github.com/ZeusNetworkHQ/orpheus"
        target="_blank"
        className="transition hover:text-primary-apollo"
      >
        <GithubIcon />
      </Link>
    </div>
  );
}
