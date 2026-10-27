import { useEffect } from "react";
import Outlink from "../utils/Outlink";
import githubIcon from "../assets/icons/github.svg";
import linkedinIcon from "../assets/icons/linkedin.svg";
import twitterIcon from "../assets/icons/twitter.svg";
import fileTextIcon from "../assets/icons/file-text.svg";
import instagramIcon from "../assets/icons/instagram.svg";

const snapshotDate = new Date("2024-07-12");
const snapshotExperience = 10;

const calculateExperience = (): number => {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - snapshotDate.getTime());
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  return diffYears;
};

const AboutWebsite = () => (
  <>
    <h2 className="mb-1">About the Website</h2>
    <p>
      A personal website designed and developed by Mert Yaşin using{" "}
      <Outlink text="Classless" link="https://github.com/emareg/classlesscss" />
      {", "}
      <Outlink text="React" link="https://github.com/facebook/react" />
      {", and "}
      <Outlink text="Vite" link="https://github.com/vitejs/vite" />
      {"."}
    </p>
    <p>
      The source code is available on{" "}
      <Outlink text="GitHub" link="https://github.com/mrtysn/mertyas.in" />.
    </p>
  </>
);

const AboutAuthor = ({ experience }: { experience: number }) => (
  <>
    <h1 className="mb-1">About</h1>
    <p>
      I’m a <span className="text-primary">Lead Software Engineer</span> with{" "}
      {experience + snapshotExperience}+ years of experience, and I notice
      patterns: the same backend shape serves many games, and the same
      discipline serves many projects. I was the sole backend engineer behind
      Match Squad and Royal Smash, led the technical team of a startup at the
      Garanti BBVA Partners accelerator, and did PhD research in machine
      learning at Wayne State University. I write Python, TypeScript and C#.
    </p>
    <h2>Now</h2>
    <p>
      I build <span className="text-primary">backends for mobile game studios</span>{" "}
      and work as a <span className="text-primary">fractional CTO</span>, and I do
      AI engineering and research.
    </p>
    <p>
      Building a game backend or need a fractional CTO?{" "}
      <Outlink text="Message me on LinkedIn" link="https://linkedin.com/in/mert-yasin/" />.
    </p>
  </>
);
const AuthorLink = ({
  icon,
  text,
  link,
  linkText,
}: {
  icon: string;
  text: string;
  link: string;
  linkText: string;
}) => {
  return (
    <tr>
      <td>
        <img src={icon} width={25} height={25} alt={text} />
      </td>
      <td className="text-left">{text}</td>
      <td>
        <Outlink text={linkText} link={link} />
      </td>
    </tr>
  );
};

const AuthorLinks = () => (
  <>
    <h2>Links</h2>
    <table>
      {/* <thead></thead> */}
      <tbody>
        <AuthorLink
          icon={fileTextIcon}
          text="cv"
          link="https://mrtysn.github.io/cv"
          linkText="mrtysn.github.io/cv"
        />
        <AuthorLink
          icon={githubIcon}
          text="github"
          link="https://github.com/mrtysn"
          linkText="mrtysn"
        />
        <AuthorLink
          icon={linkedinIcon}
          text="linkedin"
          link="https://linkedin.com/in/mert-yasin/"
          linkText="mert-yasin"
        />
        <AuthorLink
          icon={twitterIcon}
          text="twitter"
          link="https://twitter.com/mertyas_in"
          linkText="mertyas_in"
        />
        <AuthorLink
          icon={githubIcon}
          text="github"
          link="https://github.com/mert-cypher"
          linkText="mert-cypher"
        />
        <AuthorLink
          icon={instagramIcon}
          text="instagram"
          link="https://www.instagram.com/mertyas.in/"
          linkText="mertyas.in"
        />
      </tbody>
    </table>
  </>
);

function About() {
  const experience = calculateExperience();

  useEffect(() => {
    document.title = "About — Mert Yaşin";
  }, []);

  return (
    <div>
      <AboutAuthor experience={experience} />
      <AuthorLinks />
      <AboutWebsite />
    </div>
  );
}

export default About;
