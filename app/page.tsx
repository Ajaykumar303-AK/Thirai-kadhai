"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Trash2, Plus, Download, CheckCircle2, RefreshCw, 
  PanelLeftClose, PanelLeftOpen, Film, Users, MessageSquare, 
  FolderOpen, FolderPlus, BookOpen, Upload, FileCode, FileText, ChevronDown, Split, BarChart2, Clapperboard, CheckSquare, Globe
} from "lucide-react";

type ElementType = "scene" | "action" | "character" | "parenthetical" | "dialogue" | "transition" | "dual_dialogue";

interface DualData {
  leftCharacter: string;
  leftDialogue: string;
  rightCharacter: string;
  rightDialogue: string;
}

interface SceneMeta {
  shots: string[];
  props: string[];
  notes: string;
}

interface Line {
  id: number;
  text: string;
  type: ElementType;
  dualData?: DualData;
  sceneMeta?: SceneMeta;
}

interface TitlePageInfo {
  showTitlePage: boolean;
  author: string;
  contact: string;
  draft: string;
}

interface Project {
  id: string;
  title: string;
  lines: Line[];
  titlePage: TitlePageInfo;
  updatedAt: number;
}

const DEFAULT_SCRIPT: Line[] = [
  { id: 1, text: "FADE IN:", type: "transition" },
  { id: 2, text: "INT. WRITER'S ROOM - NIGHT", type: "scene", sceneMeta: { shots: ["Wide Establishing Shot", "Close-up on Keyboard"], props: ["Coffee Mug", "Mechanical Keyboard"], notes: "Keep lighting dim and moody." } },
  { id: 3, text: "Dim lamp glows. A coffee mug sits near the mechanical keyboard.", type: "action" },
  { id: 4, text: "DIRECTOR", type: "character" },
  { id: 5, text: "Let's roll the camera.", type: "dialogue" }
];

const TAMIL_MAP: Record<string, string> = {
  "vanakam": "வணக்கம்", "vanakkam": "வணக்கம்", "raja": "ராஜா", "nanba": "நண்பா",
  "da": "டா", "machan": "மச்சான்", "kathai": "கதை", "padam": "படம்",
  "kaatchi": "காட்சி", "int": "INT.", "ext": "EXT.", "day": "DAY", "night": "NIGHT"
};

const transliterateTanglish = (text: string): string => {
  return text.split(" ").map(word => TAMIL_MAP[word.toLowerCase()] || word).join(" ");
};

const DEFAULT_TITLE_PAGE: TitlePageInfo = {
  showTitlePage: true,
  author: "Ajaykumar",
  contact: "Tonight Film Production\nEmail: contact@tonightfilm.com",
  draft: "First Draft"
};

export default function ScriptEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>("");
  const [title, setTitle] = useState("UNTITLED SCREENPLAY");
  const [titlePage, setTitlePage] = useState<TitlePageInfo>(DEFAULT_TITLE_PAGE);
  const [lines, setLines] = useState<Line[]>(DEFAULT_SCRIPT);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [isLoaded, setIsLoaded] = useState(false);
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "scenes" | "characters" | "titlepage">("projects");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Language Mode State Added Here
  const [langMode, setLangMode] = useState<"normal" | "tanglish_tamil">("tanglish_tamil");

  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [secondsPerPage, setSecondsPerPage] = useState<number>(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const savedProjects = localStorage.getItem("screenplay_projects");
      if (savedProjects) {
        const parsed: Project[] = JSON.parse(savedProjects);
        if (parsed.length > 0) {
          setProjects(parsed);
          const activeId = localStorage.getItem("screenplay_active_project_id") || parsed[0].id;
          const activeProj = parsed.find(p => p.id === activeId) || parsed[0];
          setCurrentProjectId(activeProj.id);
          setTitle(activeProj.title);
          setLines(activeProj.lines);
          setTitlePage(activeProj.titlePage || DEFAULT_TITLE_PAGE);
        } else {
          initDefaultProject();
        }
      } else {
        initDefaultProject();
      }
    } catch (e) {
      console.error("Failed to load local projects", e);
      initDefaultProject();
    }
    setIsLoaded(true);
  }, []);

  const initDefaultProject = () => {
    const newProj: Project = {
      id: Date.now().toString(),
      title: "UNTITLED SCREENPLAY",
      lines: DEFAULT_SCRIPT,
      titlePage: DEFAULT_TITLE_PAGE,
      updatedAt: Date.now()
    };
    setProjects([newProj]);
    setCurrentProjectId(newProj.id);
    setTitle(newProj.title);
    setLines(newProj.lines);
    setTitlePage(DEFAULT_TITLE_PAGE);
  };

  useEffect(() => {
    if (!isLoaded || !currentProjectId) return;

    setSaveStatus("saving");
    const timeout = setTimeout(() => {
      try {
        setProjects(prevProjects => {
          const updatedProjects = prevProjects.map(p => 
            p.id === currentProjectId 
              ? { ...p, title, lines, titlePage, updatedAt: Date.now() }
              : p
          );
          localStorage.setItem("screenplay_projects", JSON.stringify(updatedProjects));
          localStorage.setItem("screenplay_active_project_id", currentProjectId);
          return updatedProjects;
        });
        setSaveStatus("saved");
      } catch (e) {
        console.error("Failed to save projects", e);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [lines, title, titlePage, currentProjectId, isLoaded]);

  const createNewProject = () => {
    const newProj: Project = {
      id: Date.now().toString(),
      title: "NEW SCREENPLAY",
      lines: [
        { id: 1, text: "FADE IN:", type: "transition" },
        { id: 2, text: "INT. NEW SCENE - DAY", type: "scene", sceneMeta: { shots: ["Wide Shot"], props: [], notes: "" } }
      ],
      titlePage: DEFAULT_TITLE_PAGE,
      updatedAt: Date.now()
    };
    const updated = [newProj, ...projects];
    setProjects(updated);
    setCurrentProjectId(newProj.id);
    setTitle(newProj.title);
    setLines(newProj.lines);
    setTitlePage(DEFAULT_TITLE_PAGE);
    localStorage.setItem("screenplay_projects", JSON.stringify(updated));
    localStorage.setItem("screenplay_active_project_id", newProj.id);
  };

  const switchProject = (proj: Project) => {
    setCurrentProjectId(proj.id);
    setTitle(proj.title);
    setLines(proj.lines);
    setTitlePage(proj.titlePage || DEFAULT_TITLE_PAGE);
    localStorage.setItem("screenplay_active_project_id", proj.id);
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) return;
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    localStorage.setItem("screenplay_projects", JSON.stringify(remaining));
    if (currentProjectId === id) switchProject(remaining[0]);
  };

  const updateSceneMeta = (lineId: number, field: keyof SceneMeta, value: any) => {
    setLines(lines.map(l => {
      if (l.id !== lineId) return l;
      const currentMeta = l.sceneMeta || { shots: [], props: [], notes: "" };
      return { ...l, sceneMeta: { ...currentMeta, [field]: value } };
    }));
  };

  const exportAsFDX = () => {
    const fdxTypeMap: Record<ElementType, string> = {
      scene: "Scene Heading",
      action: "Action",
      character: "Character",
      parenthetical: "Parenthetical",
      dialogue: "Dialogue",
      transition: "Transition",
      dual_dialogue: "Dialogue"
    };

    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="No" Version="4">
<Content>\n`;

    lines.forEach(l => {
      if (l.type === "dual_dialogue" && l.dualData) {
        xml += `  <Paragraph Type="Character"><Text>${l.dualData.leftCharacter}</Text></Paragraph>\n`;
        xml += `  <Paragraph Type="Dialogue"><Text>${l.dualData.leftDialogue}</Text></Paragraph>\n`;
        xml += `  <Paragraph Type="Character"><Text>${l.dualData.rightCharacter}</Text></Paragraph>\n`;
        xml += `  <Paragraph Type="Dialogue"><Text>${l.dualData.rightDialogue}</Text></Paragraph>\n`;
      } else {
        const pType = fdxTypeMap[l.type] || "Action";
        const cleanText = l.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        xml += `  <Paragraph Type="${pType}"><Text>${cleanText}</Text></Paragraph>\n`;
        
        if (l.type === "scene" && l.sceneMeta) {
          const metaStr = `[BREAKDOWN - Shots: ${l.sceneMeta.shots.join(", ")} | Props: ${l.sceneMeta.props.join(", ")} | Notes: ${l.sceneMeta.notes}]`;
          xml += `  <Paragraph Type="General"><Text>${metaStr}</Text></Paragraph>\n`;
        }
      }
    });

    xml += `</Content>\n</FinalDraft>`;
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.trim() || "screenplay"}.fdx`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const exportAsText = () => {
    let textContent = `${title.toUpperCase()}\nWritten by ${titlePage.author}\n\n==============================\n\n`;
    lines.forEach(l => {
      if (l.type === "dual_dialogue" && l.dualData) {
        textContent += `\n          ${l.dualData.leftCharacter.padEnd(25)} ${l.dualData.rightCharacter}\n`;
        textContent += `     ${l.dualData.leftDialogue.padEnd(30)} ${l.dualData.rightDialogue}\n`;
      } else if (l.type === "character") textContent += `\n                    ${l.text}\n`;
      else if (l.type === "parenthetical") textContent += `                 ${l.text}\n`;
      else if (l.type === "dialogue") textContent += `          ${l.text}\n`;
      else if (l.type === "transition") textContent += `\n                                                            ${l.text}\n`;
      else if (l.type === "scene") textContent += `\n\n${l.text}\n\n`;
      else textContent += `\n${l.text}\n`;
    });

    textContent += `\n\n==============================\nPRODUCTION BREAKDOWN & SHOT LIST\n==============================\n\n`;
    lines.filter(l => l.type === "scene").forEach((scene, idx) => {
      textContent += `Scene #${idx + 1}: ${scene.text}\n`;
      if (scene.sceneMeta) {
        textContent += `  - Shots: ${scene.sceneMeta.shots.join(", ") || "None"}\n`;
        textContent += `  - Props: ${scene.sceneMeta.props.join(", ") || "None"}\n`;
        textContent += `  - Notes: ${scene.sceneMeta.notes || "None"}\n`;
      }
      textContent += `\n`;
    });

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.trim() || "screenplay"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    const fileName = file.name.replace(/\.[^/.]+$/, "");

    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      const importedLines: Line[] = [];

      if (file.name.endsWith(".fdx")) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, "text/xml");
        const paragraphs = xmlDoc.getElementsByTagName("Paragraph");
        Array.from(paragraphs).forEach((p, idx) => {
          const typeAttr = p.getAttribute("Type") || "Action";
          const textContent = p.textContent?.trim() || "";
          let type: ElementType = "action";
          if (typeAttr.includes("Scene")) type = "scene";
          else if (typeAttr.includes("Character")) type = "character";
          else if (typeAttr.includes("Dialogue")) type = "dialogue";
          else if (typeAttr.includes("Parenthetical")) type = "parenthetical";
          else if (typeAttr.includes("Transition")) type = "transition";

          if (textContent && !textContent.startsWith("[BREAKDOWN")) {
            importedLines.push({ 
              id: Date.now() + idx, 
              text: textContent, 
              type, 
              sceneMeta: type === "scene" ? { shots: ["Wide Shot"], props: [], notes: "" } : undefined 
            });
          }
        });
      } else {
        const rawLines = content.split("\n");
        rawLines.forEach((rLine, idx) => {
          const trimmed = rLine.trim();
          if (!trimmed || trimmed.startsWith("================")) return;
          let type: ElementType = "action";
          const upper = trimmed.toUpperCase();
          if (upper.startsWith("INT.") || upper.startsWith("EXT.")) type = "scene";
          else if (upper.endsWith("TO:") || upper === "FADE IN:" || upper === "FADE OUT.") type = "transition";
          else if (trimmed.startsWith("(") && trimmed.endsWith(")")) type = "parenthetical";
          else if (trimmed === upper && trimmed.length < 35 && !trimmed.includes(".")) type = "character";

          importedLines.push({ 
            id: Date.now() + idx, 
            text: trimmed, 
            type, 
            sceneMeta: type === "scene" ? { shots: ["Wide Shot"], props: [], notes: "" } : undefined 
          });
        });
      }

      if (importedLines.length > 0) {
        const newProj: Project = {
          id: Date.now().toString(),
          title: fileName.toUpperCase(),
          lines: importedLines,
          titlePage: DEFAULT_TITLE_PAGE,
          updatedAt: Date.now()
        };
        const updated = [newProj, ...projects];
        setProjects(updated);
        setCurrentProjectId(newProj.id);
        setTitle(newProj.title);
        setLines(importedLines);
        localStorage.setItem("screenplay_projects", JSON.stringify(updated));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    if (focusIndex !== null && inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]?.focus();
      setFocusIndex(null);
    }
  }, [focusIndex, lines]);

  const updateLine = (id: number, text: string) => {
    const processedText = langMode === "tanglish_tamil" ? transliterateTanglish(text) : text;

    setLines(lines.map(l => {
      if (l.id !== id) return l;
      let newType = l.type;
      let newText = processedText;
      const upper = processedText.toUpperCase();

      if (upper.startsWith("INT. ") || upper.startsWith("EXT. ") || upper.startsWith("INT/EXT. ")) {
        newType = "scene";
        newText = upper;
        if (!l.sceneMeta) l.sceneMeta = { shots: ["Wide Shot"], props: [], notes: "" };
      } else if (processedText.startsWith("(") && !processedText.endsWith(")")) {
        newType = "parenthetical";
      } else if (upper === "CUT TO:" || upper === "FADE IN:" || upper === "DISSOLVE TO:" || upper.endsWith("TO:")) {
        newType = "transition";
        newText = upper;
      } else if (l.type === "character" || l.type === "scene") {
        newText = upper;
      }
      return { ...l, text: newText, type: newType };
    }));
  };

  const updateDualData = (id: number, field: keyof DualData, value: string) => {
    setLines(lines.map(l => {
      if (l.id !== id) return l;
      const currentData = l.dualData || { leftCharacter: "", leftDialogue: "", rightCharacter: "", rightDialogue: "" };
      const updatedValue = (field === "leftCharacter" || field === "rightCharacter") ? value.toUpperCase() : value;
      return { ...l, dualData: { ...currentData, [field]: updatedValue } };
    }));
  };

  const addLine = (currentIndex: number, type: ElementType = "action") => {
    const newLine: Line = { 
      id: Date.now(), 
      text: "", 
      type,
      sceneMeta: type === "scene" ? { shots: ["Wide Shot"], props: [], notes: "" } : undefined,
      dualData: type === "dual_dialogue" ? { leftCharacter: "VARUN", leftDialogue: "Give ball da!", rightCharacter: "SIDDARTH", rightDialogue: "Po da!" } : undefined 
    };
    const updated = [...lines];
    updated.splice(currentIndex + 1, 0, newLine);
    setLines(updated);
    setFocusIndex(currentIndex + 1);
  };

  const deleteLine = (currentIndex: number) => {
    if (lines.length > 1) {
      const updated = lines.filter((_, idx) => idx !== currentIndex);
      setLines(updated);
      setFocusIndex(Math.max(0, currentIndex - 1));
    }
  };

  const handleTabKey = (currentIndex: number, currentType: ElementType) => {
    let nextType: ElementType = "action";
    if (currentType === "action") nextType = "character";
    else if (currentType === "character") nextType = "parenthetical";
    else if (currentType === "parenthetical") nextType = "dialogue";
    else if (currentType === "dialogue") nextType = "action";
    else if (currentType === "scene") nextType = "action";
    else if (currentType === "transition") nextType = "scene";

    setLines(lines.map((l, idx) => idx === currentIndex ? { ...l, type: nextType } : l));
  };

  const handleEnterKey = (currentIndex: number, currentType: ElementType) => {
    let nextType: ElementType = "action";
    if (currentType === "scene") nextType = "action";
    else if (currentType === "action") nextType = "character";
    else if (currentType === "character") nextType = "dialogue";
    else if (currentType === "dialogue") nextType = "action";
    else if (currentType === "parenthetical") nextType = "dialogue";
    else if (currentType === "transition") nextType = "scene";
    addLine(currentIndex, nextType);
  };

  const scrollToIndex = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRefs.current[index]?.focus();
    }
  };

  const getStyle = (type: ElementType, text: string) => {
    switch (type) {
      case "scene": return "uppercase font-bold tracking-wide text-left";
      case "character": return "uppercase font-bold text-center tracking-wider w-3/5 mx-auto mt-4";
      case "dialogue": return "text-left w-3/4 mx-auto";
      case "parenthetical": return "text-center italic w-1/2 mx-auto";
      case "transition": return text.toUpperCase().startsWith("FADE IN") ? "uppercase font-bold text-left mb-2" : "uppercase font-bold text-right my-2";
      default: return "text-left";
    }
  };

  const scenes = lines
    .map((line, index) => ({ ...line, originalIndex: index }))
    .filter(line => line.type === "scene");

  const characterStats = lines.reduce((acc, line, index) => {
    if (line.type === "character" && line.text.trim()) {
      const charName = line.text.trim().toUpperCase();
      if (!acc[charName]) acc[charName] = { count: 0, firstIndex: index };
      acc[charName].count += 1;
    }
    return acc;
  }, {} as Record<string, { count: number; firstIndex: number }>);

  const characterList = Object.entries(characterStats);
  const estimatedPages = (lines.length / 45).toFixed(1);
  const totalSeconds = (lines.length / 45) * secondsPerPage;
  const calcMins = Math.floor(totalSeconds / 60);
  const calcSecs = Math.round(totalSeconds % 60);

  if (!isLoaded) {
    return <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-neutral-400">Loading your scripts...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex font-mono">
      {/* Side Navigation Panel */}
      <aside className={`no-print fixed top-0 left-0 h-full bg-neutral-950 border-r border-neutral-800 transition-all duration-300 z-20 flex flex-col ${
        isSidebarOpen ? "w-80" : "w-12"
      }`}>
        <div className="p-3 border-b border-neutral-800 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex gap-1 bg-neutral-900 p-0.5 rounded text-xs font-sans">
              <button onClick={() => setActiveTab("projects")} className={`px-2 py-1 rounded transition cursor-pointer ${activeTab === "projects" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-neutral-400 hover:text-white"}`}>Scripts</button>
              <button onClick={() => setActiveTab("scenes")} className={`px-2 py-1 rounded transition cursor-pointer ${activeTab === "scenes" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-neutral-400 hover:text-white"}`}>Scenes</button>
              <button onClick={() => setActiveTab("characters")} className={`px-2 py-1 rounded transition cursor-pointer ${activeTab === "characters" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-neutral-400 hover:text-white"}`}>Cast</button>
              <button onClick={() => setActiveTab("titlepage")} className={`px-2 py-1 rounded transition cursor-pointer ${activeTab === "titlepage" ? "bg-amber-500/20 text-amber-400 font-bold" : "text-neutral-400 hover:text-white"}`}>Cover</button>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 cursor-pointer mx-auto">
            {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>

        {isSidebarOpen && (
          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs">
            {activeTab === "projects" && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 mb-2">
                  <button onClick={createNewProject} className="flex-1 flex items-center justify-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 p-2 rounded font-medium transition cursor-pointer">
                    <FolderPlus size={14} /> + New Script
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".fdx,.txt" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 rounded transition cursor-pointer" title="Import">
                    <Upload size={14} />
                  </button>
                </div>
                {projects.map((proj) => (
                  <div key={proj.id} onClick={() => switchProject(proj)} className={`group flex items-center justify-between p-2.5 rounded border transition cursor-pointer ${proj.id === currentProjectId ? "bg-neutral-800/90 border-amber-500/50 text-amber-400 font-bold" : "bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"}`}>
                    <div className="truncate pr-2">
                      <p className="truncate font-mono text-[13px]">{proj.title || "UNTITLED"}</p>
                      <p className="text-[10px] text-neutral-500 font-sans mt-0.5">{proj.lines.filter(l => l.type === "scene").length} Scenes</p>
                    </div>
                    {projects.length > 1 && (
                      <button onClick={(e) => deleteProject(proj.id, e)} className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 p-1 rounded transition">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "scenes" && (
              <div className="flex flex-col gap-3">
                <div className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">Click Scene to Edit Breakdown:</div>
                {scenes.length === 0 ? (
                  <p className="text-neutral-500 italic p-2">No scenes found.</p>
                ) : (
                  scenes.map((scene, idx) => (
                    <div key={scene.id} className={`p-2 rounded border transition ${selectedSceneId === scene.id ? "bg-amber-500/10 border-amber-500/50" : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"}`}>
                      <div className="flex items-center justify-between">
                        <button onClick={() => scrollToIndex(scene.originalIndex)} className="text-left font-mono text-[12px] text-amber-400 font-bold truncate pr-2 cursor-pointer">
                          #{idx + 1} {scene.text}
                        </button>
                        <button onClick={() => setSelectedSceneId(selectedSceneId === scene.id ? null : scene.id)} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer">
                          <Clapperboard size={12} /> {selectedSceneId === scene.id ? "Close" : "Breakdown"}
                        </button>
                      </div>

                      {selectedSceneId === scene.id && scene.sceneMeta && (
                        <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-col gap-2 font-sans">
                          <div>
                            <label className="text-[10px] text-neutral-400 block mb-1">Shot List (Comma separated)</label>
                            <input 
                              type="text" 
                              value={scene.sceneMeta.shots.join(", ")}
                              onChange={(e) => updateSceneMeta(scene.id, "shots", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-xs text-neutral-200 outline-none focus:border-amber-500"
                              placeholder="Wide shot, Close-up..."
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-400 block mb-1">Props & Requirements</label>
                            <input 
                              type="text" 
                              value={scene.sceneMeta.props.join(", ")}
                              onChange={(e) => updateSceneMeta(scene.id, "props", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-xs text-neutral-200 outline-none focus:border-amber-500"
                              placeholder="Coffee mug, Gun..."
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-neutral-400 block mb-1">Director Notes</label>
                            <textarea 
                              rows={2}
                              value={scene.sceneMeta.notes}
                              onChange={(e) => updateSceneMeta(scene.id, "notes", e.target.value)}
                              className="w-full bg-neutral-950 border border-neutral-800 rounded p-1 text-xs text-neutral-200 outline-none focus:border-amber-500 resize-none"
                              placeholder="Lighting, mood..."
                            />
                          </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "characters" && (
            characterList.length === 0 ? <p className="text-neutral-500 italic p-2">No characters found.</p> :
            characterList.map(([charName, data]) => (
              <button key={charName} onClick={() => scrollToIndex(data.firstIndex)} className="w-full flex items-center justify-between p-2 rounded text-neutral-300 hover:bg-neutral-800 hover:text-amber-400 transition cursor-pointer">
                <span className="font-mono font-bold text-[12px] truncate">{charName}</span>
                <span className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded text-[10px]">
                  <MessageSquare size={10} /> {data.count}
                </span>
              </button>
            ))
          )}

          {activeTab === "titlepage" && (
            <div className="flex flex-col gap-3 font-sans">
              <label className="flex items-center gap-2 text-neutral-200 cursor-pointer text-xs">
                <input type="checkbox" checked={titlePage.showTitlePage} onChange={(e) => setTitlePage({ ...titlePage, showTitlePage: e.target.checked })} className="rounded text-amber-500 focus:ring-0" />
                Include Cover Page
              </label>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Author Name</label>
                <input type="text" value={titlePage.author} onChange={(e) => setTitlePage({ ...titlePage, author: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-xs text-neutral-200 outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Draft Info</label>
                <input type="text" value={titlePage.draft} onChange={(e) => setTitlePage({ ...titlePage, draft: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-xs text-neutral-200 outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Production Contact</label>
                <textarea rows={3} value={titlePage.contact} onChange={(e) => setTitlePage({ ...titlePage, contact: e.target.value })} className="w-full bg-neutral-900 border border-neutral-800 rounded p-1.5 text-xs text-neutral-200 outline-none focus:border-amber-500" />
              </div>
            </div>
          )}
        </div>
      )}
      </aside>

      {/* Main Canvas Area */}
      <div className={`flex-1 flex flex-col items-center p-6 transition-all duration-300 ${isSidebarOpen ? "ml-80" : "ml-12"}`}>
        <header className="w-full max-w-3xl flex items-center justify-between pb-4 border-b border-neutral-800 mb-6 no-print">
          <div className="flex items-center gap-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-transparent font-bold text-lg text-amber-500 outline-none border-b border-transparent focus:border-amber-500" />
            <div className="flex items-center gap-1 text-xs font-sans text-neutral-400">
              {saveStatus === "saved" ? <><CheckCircle2 size={13} className="text-emerald-500" /><span>Saved</span></> : <><RefreshCw size={13} className="text-amber-500 animate-spin" /><span>Saving...</span></>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tanglish Toggle Button */}
            <button 
              onClick={() => setLangMode(langMode === "normal" ? "tanglish_tamil" : "normal")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-sans font-medium transition cursor-pointer border ${langMode === "tanglish_tamil" ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"}`}
            >
              <Globe size={14} /> Tanglish: {langMode === "tanglish_tamil" ? "ON" : "OFF"}
            </button>

            <button onClick={() => setShowAnalytics(!showAnalytics)} className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-sans font-medium transition cursor-pointer border ${showAnalytics ? "bg-amber-500/20 text-amber-400 border-amber-500/40" : "bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white"}`}>
              <BarChart2 size={14} /> Analytics {showAnalytics ? "ON" : "OFF"}
            </button>

            <div className="relative">
              <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded text-sm font-sans font-medium transition cursor-pointer">
                <Download size={16} /> Export <ChevronDown size={14} />
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-neutral-950 border border-neutral-800 rounded shadow-xl py-1 z-30 font-sans text-xs">
                  <button onClick={() => { setIsExportMenuOpen(false); window.print(); }} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-neutral-200 cursor-pointer">
                    <Download size={14} className="text-amber-400" /> PDF / Print (With Breakdown)
                  </button>
                  <button onClick={exportAsFDX} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-neutral-200 cursor-pointer">
                    <FileCode size={14} className="text-emerald-400" /> Final Draft (.FDX)
                  </button>
                  <button onClick={exportAsText} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-neutral-800 text-neutral-200 cursor-pointer">
                    <FileText size={14} className="text-sky-400" /> Plain Text (.TXT)
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {showAnalytics && (
          <div className="no-print w-full max-w-3xl bg-neutral-950 border border-amber-500/30 p-3 rounded mb-6 flex flex-wrap items-center justify-between gap-4 font-sans text-xs">
            <div className="flex items-center gap-4">
              <div><span className="text-neutral-500 block text-[10px]">PAGES</span><span className="text-amber-400 font-bold text-sm">{estimatedPages}</span></div>
              <div className="h-6 w-[1px] bg-neutral-800"></div>
              <div><span className="text-neutral-500 block text-[10px]">RUNTIME</span><span className="text-emerald-400 font-bold text-sm">{calcMins}m {calcSecs}s</span></div>
              <div className="h-6 w-[1px] bg-neutral-800"></div>
              <div><span className="text-neutral-500 block text-[10px]">SCENES</span><span className="text-sky-400 font-bold text-sm">{scenes.length}</span></div>
            </div>
            <select value={secondsPerPage} onChange={(e) => setSecondsPerPage(Number(e.target.value))} className="bg-neutral-900 border border-neutral-700 text-neutral-200 rounded px-2 py-1 text-xs outline-none cursor-pointer">
              <option value={45}>Fast (45s/pg)</option>
              <option value={60}>Standard (60s/pg)</option>
              <option value={75}>Dialogue Heavy (75s/pg)</option>
            </select>
          </div>
        )}

        {titlePage.showTitlePage && (
          <div className="script-container page-break w-full max-w-3xl bg-white text-black p-16 shadow-2xl rounded-sm mb-8 flex flex-col justify-between min-h-[9.5in]">
            <div></div>
            <div className="text-center my-auto space-y-4">
              <h1 className="text-2xl font-bold uppercase tracking-widest underline decoration-1 underline-offset-8">{title || "UNTITLED SCREENPLAY"}</h1>
              <p className="text-sm italic">written by</p>
              <p className="text-lg font-bold uppercase">{titlePage.author || "AUTHOR NAME"}</p>
            </div>
            <div className="flex justify-between items-end text-xs leading-relaxed">
              <div className="whitespace-pre-line text-neutral-700">{titlePage.contact}</div>
              <div className="text-right text-neutral-700"><p>{titlePage.draft}</p></div>
            </div>
          </div>
        )}

        <div className="script-container w-full max-w-3xl bg-white text-black p-12 min-h-[900px] shadow-2xl rounded-sm flex flex-col gap-2">
          {lines.map((line, index) => {
            if (line.type === "dual_dialogue" && line.dualData) {
              return (
                <div key={line.id} className="group relative my-3 p-2 bg-amber-50/40 border border-dashed border-amber-300 rounded">
                  <div className="no-print flex items-center justify-between pb-2 border-b border-amber-200/50 mb-2">
                    <span className="text-[10px] font-sans font-bold text-amber-700 uppercase flex items-center gap-1"><Split size={12} /> Dual Dialogue</span>
                    <button onClick={() => deleteLine(index)} className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"><Trash2 size={13} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-6 w-full">
                    <div className="flex flex-col gap-1">
                      <input type="text" value={line.dualData.leftCharacter} onChange={(e) => updateDualData(line.id, "leftCharacter", e.target.value)} className="w-full text-center font-bold uppercase outline-none bg-transparent text-[14px]" />
                      <textarea rows={2} value={line.dualData.leftDialogue} onChange={(e) => updateDualData(line.id, "leftDialogue", e.target.value)} className="w-full text-left outline-none bg-transparent resize-none text-[14px]" />
                    </div>
                    <div className="flex flex-col gap-1 border-l border-neutral-200 pl-4">
                      <input type="text" value={line.dualData.rightCharacter} onChange={(e) => updateDualData(line.id, "rightCharacter", e.target.value)} className="w-full text-center font-bold uppercase outline-none bg-transparent text-[14px]" />
                      <textarea rows={2} value={line.dualData.rightDialogue} onChange={(e) => updateDualData(line.id, "rightDialogue", e.target.value)} className="w-full text-left outline-none bg-transparent resize-none text-[14px]" />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div key={line.id} className="group relative flex flex-col">
                <div className="flex items-center gap-2">
                  <select
                    value={line.type}
                    onChange={(e) => {
                      const newType = e.target.value as ElementType;
                      setLines(lines.map(l => l.id === line.id ? { 
                        ...l, 
                        type: newType,
                        sceneMeta: newType === "scene" && !l.sceneMeta ? { shots: ["Wide Shot"], props: [], notes: "" } : l.sceneMeta
                      } : l));
                    }}
                    className="no-print text-[11px] font-sans text-neutral-500 bg-neutral-100 rounded px-1 py-0.5 outline-none cursor-pointer"
                  >
                    <option value="scene">SCENE</option>
                    <option value="action">ACTION</option>
                    <option value="character">CHARACTER</option>
                    <option value="parenthetical">PARENTHETICAL</option>
                    <option value="dialogue">DIALOGUE</option>
                    <option value="transition">TRANSITION</option>
                    <option value="dual_dialogue">⚡ DUAL</option>
                  </select>

                  <input
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    value={line.text}
                    placeholder={line.type.toUpperCase()}
                    onChange={(e) => updateLine(line.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") { e.preventDefault(); handleTabKey(index, line.type); }
                      else if (e.key === "Enter") { e.preventDefault(); handleEnterKey(index, line.type); }
                      else if (e.key === "Backspace" && line.text === "") { e.preventDefault(); deleteLine(index); }
                    }}
                    className={`w-full outline-none bg-transparent ${getStyle(line.type, line.text)} text-[14px]`}
                  />

                  <button onClick={() => deleteLine(index)} className="no-print opacity-0 group-hover:opacity-100 text-red-500 p-1 cursor-pointer"><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}

          <div className="no-print flex gap-3 mt-4">
            <button onClick={() => addLine(lines.length - 1, "action")} className="flex items-center gap-1.5 text-neutral-500 hover:text-black text-xs font-sans cursor-pointer bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded transition">
              <Plus size={14} /> Add Line
            </button>
            <button onClick={() => addLine(lines.length - 1, "dual_dialogue")} className="flex items-center gap-1.5 text-amber-700 hover:text-amber-900 text-xs font-sans cursor-pointer bg-amber-100/60 hover:bg-amber-100 px-3 py-1.5 rounded transition font-medium">
              <Split size={14} /> + Add Dual Dialogue
            </button>
          </div>
        </div>

        <div className="print-breakdown hidden print:block w-full max-w-3xl mt-12 bg-white text-black p-12">
          <h2 className="text-xl font-bold uppercase mb-6 border-b-2 border-black pb-2">Production Breakdown & Shot List</h2>
          {scenes.map((scene, idx) => (
            <div key={scene.id} className="mb-6 pb-4 border-b border-neutral-300">
              <h3 className="font-bold text-sm uppercase mb-2">Scene #{idx + 1}: {scene.text}</h3>
              {scene.sceneMeta && (
                <div className="text-xs space-y-1 pl-4">
                  <p><strong>Shots:</strong> {scene.sceneMeta.shots.join(", ") || "Standard Setup"}</p>
                  <p><strong>Props/Elements:</strong> {scene.sceneMeta.props.join(", ") || "None specified"}</p>
                  <p><strong>Director Notes:</strong> {scene.sceneMeta.notes || "None"}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
  </div>
  );
}
import React from 'react';

export default function ScreenplayPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">
      
      {/* திரைக்கதை பேப்பர் கன்டெய்னர் */}
      <div className="screenplay-sheet mx-auto bg-white shadow-xl print:shadow-none box-border">
        
        {/* Fade In */}
        <div className="script-scene font-mono font-bold uppercase tracking-wide">
          FADE IN:
        </div>

        {/* Scene Heading */}
        <div className="script-scene font-mono font-bold uppercase tracking-wide mt-6 mb-4">
          INT. WRITER'S ROOM - NIGHT
        </div>

        {/* Action / Description */}
        <div className="script-action font-mono text-base mb-4 leading-relaxed">
          Dim lamp glows. A coffee mug sits near the mechanic setup on the wooden table. Papers are scattered everywhere.
        </div>

        {/* Character Name */}
        <div className="script-character font-mono font-bold uppercase mt-6 mb-1 text-center sm:text-left">
          DIRECTOR
        </div>

        {/* Dialogue */}
        <div className="script-dialogue font-mono text-base mb-4 leading-relaxed">
          Let&apos;s roll the camera. We need perfection on this shot.
        </div>

      </div>

    </div>
  );
}