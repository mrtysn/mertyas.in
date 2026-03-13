interface Project {
  name: string;
  icon: string;
  desc: string;
  link?: string;
  archived?: boolean;
}

const projects: Project[] = [
  { name: "mertyas.in", icon: "🌐", desc: "This website — React, Classless.css, Vite", link: "https://github.com/mrtysn/mertyas.in" },
  { name: "aw-cli", icon: "⚡", desc: "Multi-agent Claude Code workflow coordinator", link: "https://github.com/mrtysn/aw-cli" },
  { name: "agents-shared", icon: "🤖", desc: "Shared Claude Code commands and skills via submodule", link: "https://github.com/mrtysn/agents-shared" },
  { name: "toolbelt", icon: "🧰", desc: "CLI dashboard for custom scripts and apps", link: "https://github.com/mrtysn/toolbelt" },
  { name: "peek", icon: "👁", desc: "Screenshot + local LLM analysis wrapper", link: "https://github.com/mrtysn/peek" },
  { name: "teleport", icon: "🚀", desc: "Push local changes to remote WIP branches", link: "https://github.com/mrtysn/teleport" },
  { name: "make-icon", icon: "🎨", desc: "Generate .icns app icons from SF Symbols", link: "https://github.com/mrtysn/make-icon" },
  { name: "dev-env", icon: "🔧", desc: "Machine bootstrap and dotfiles", link: "https://github.com/mrtysn/dev-env" },
  { name: "cv", icon: "📄", desc: "Online CV — React, Semantic UI", link: "https://github.com/mrtysn/cv" },
  { name: "app-toggle", icon: "🔀", desc: "Batch open/close communication apps", link: "https://github.com/mrtysn/app-toggle" },
  { name: "peon-ping", icon: "🔔", desc: "Notification relay service", link: "https://github.com/mrtysn/peon-ping" },
  { name: "instagram-extension", icon: "📷", desc: "Browser extension for Instagram utilities", link: "https://github.com/mrtysn/instagram-extension" },
  { name: "oj", icon: "🎮", desc: "Mobile game framework in Godot 4.4" },
  { name: "moji", icon: "😎", desc: "Emoji-based mobile game in Godot 3.x" },
  { name: "blame-session", icon: "🔍", desc: "Git blame session analyzer" },
  { name: "tgo", icon: "📟", desc: "Terminal-based Go board" },
  { name: "tmux-start", icon: "🖥", desc: "Tmux session bootstrapper" },
  { name: "aw", icon: "🐝", desc: "ActivityWatch CLI for time tracking" },
  { name: "pull_of_wonders", icon: "🎩", desc: "Random useful script collection" },
  { name: "lstm", icon: "🧠", desc: "LSTM neural network experiments", link: "https://github.com/mrtysn/lstm" },
  { name: "splendor-clone", icon: "♠️", desc: "Digital board game clone", link: "https://github.com/mrtysn/splendor-clone" },
  { name: "ransomware-mars", icon: "🔓", desc: "Security research — ransomware analysis", link: "https://github.com/mrtysn/ransomware-mars" },
  { name: "intern-case-study", icon: "📋", desc: "Technical case study for interns", link: "https://github.com/mrtysn/intern-case-study" },
  { name: "mahalle-baskisi", icon: "🏘", desc: "Social pressure simulation", archived: true },
  { name: "mrtysn.github.io", icon: "📁", desc: "Legacy GitHub Pages site", link: "https://github.com/mrtysn/mrtysn.github.io", archived: true },
  { name: "draw-svg", icon: "✏️", desc: "SVG drawing experiments", archived: true },
  { name: "eeg", icon: "🧪", desc: "EEG signal processing research", archived: true },
  { name: "todo", icon: "✅", desc: "Task management prototype", archived: true },
];

function Card({ project }: { project: Project }) {
  const classes = ["project-card", project.archived && "archived", project.link && "linked"]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className="card-icon">{project.icon}</span>
      <span className="card-body">
        <span className="card-name">{project.name}</span>
        <span className="card-desc">{project.desc}</span>
      </span>
    </>
  );

  return (
    <div className={classes}>
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
      <div className="projects-grid">
        {projects.map((project) => (
          <Card key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
}

export default Projects;
