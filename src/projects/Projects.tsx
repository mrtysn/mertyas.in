type Category = "Active Projects" | "Tools" | "Games" | "Archive";

interface Project {
  name: string;
  icon: string;
  link?: string;
  category: Category;
}

const projects: Project[] = [
  // Active Projects
  { name: "mertyas.in", icon: "🌐", link: "https://github.com/mrtysn/mertyas.in", category: "Active Projects" },
  { name: "cv", icon: "📄", link: "https://github.com/mrtysn/cv", category: "Active Projects" },
  { name: "dev-env", icon: "🔧", link: "https://github.com/mrtysn/dev-env", category: "Active Projects" },
  { name: "agents-shared", icon: "🤖", link: "https://github.com/mrtysn/agents-shared", category: "Active Projects" },
  { name: "aw-cli", icon: "⚡", link: "https://github.com/mrtysn/aw-cli", category: "Active Projects" },

  // Tools
  { name: "toolbelt", icon: "🧰", link: "https://github.com/mrtysn/toolbelt", category: "Tools" },
  { name: "peek", icon: "👁", link: "https://github.com/mrtysn/peek", category: "Tools" },
  { name: "blame-session", icon: "🔍", category: "Tools" },
  { name: "make-icon", icon: "🎨", link: "https://github.com/mrtysn/make-icon", category: "Tools" },
  { name: "teleport", icon: "🚀", link: "https://github.com/mrtysn/teleport", category: "Tools" },
  { name: "tgo", icon: "📟", category: "Tools" },
  { name: "tmux-start", icon: "🖥", category: "Tools" },
  { name: "aw", icon: "🐝", category: "Tools" },
  { name: "pull_of_wonders", icon: "🎩", category: "Tools" },
  { name: "peon-ping", icon: "🔔", link: "https://github.com/mrtysn/peon-ping", category: "Tools" },
  { name: "app-toggle", icon: "🔀", link: "https://github.com/mrtysn/app-toggle", category: "Tools" },

  // Games
  { name: "oj", icon: "🎮", category: "Games" },
  { name: "moji", icon: "😎", category: "Games" },

  // Archive
  { name: "instagram-extension", icon: "📷", link: "https://github.com/mrtysn/instagram-extension", category: "Archive" },
  { name: "lstm", icon: "🧠", link: "https://github.com/mrtysn/lstm", category: "Archive" },
  { name: "splendor-clone", icon: "♠️", link: "https://github.com/mrtysn/splendor-clone", category: "Archive" },
  { name: "ransomware-mars", icon: "🔓", link: "https://github.com/mrtysn/ransomware-mars", category: "Archive" },
  { name: "intern-case-study", icon: "📋", link: "https://github.com/mrtysn/intern-case-study", category: "Archive" },
  { name: "mahalle-baskisi", icon: "📁", category: "Archive" },
  { name: "mrtysn.github.io", icon: "📁", link: "https://github.com/mrtysn/mrtysn.github.io", category: "Archive" },
  { name: "draw-svg", icon: "📁", category: "Archive" },
  { name: "eeg", icon: "📁", category: "Archive" },
  { name: "todo", icon: "📁", category: "Archive" },
];

const categories: Category[] = ["Active Projects", "Tools", "Games", "Archive"];

function Tile({ project }: { project: Project }) {
  const content = (
    <>
      <span className="tile-icon">{project.icon}</span>
      <span className="tile-name">{project.name}</span>
    </>
  );

  return (
    <div className="project-tile">
      {project.link ? (
        <a href={project.link} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}

function Projects() {
  return (
    <div>
      <h2>Projects</h2>
      {categories.map((category) => (
        <section key={category}>
          <h3>{category}</h3>
          <div className="projects-grid">
            {projects
              .filter((p) => p.category === category)
              .map((project) => (
                <Tile key={project.name} project={project} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default Projects;
