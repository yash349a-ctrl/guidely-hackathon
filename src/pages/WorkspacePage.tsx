import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLearning } from "../context/LearningContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Navigation, 
  Compass, 
  AlertCircle, 
  Lock, 
  Zap, 
  BookOpen, 
  ExternalLink, 
  ChevronRight, 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sparkles, 
  Calendar,
  Layers,
  Award,
  Video,
  FileText,
  Sun,
  Moon,
  Check,
  MapPin,
  Map as MapIcon
} from "lucide-react";
import { CURATED_RESOURCES } from "../data/resources";
import { GuidelyLogo } from "../components/GuidelyLogo";

const DESKTOP_NODE_WIDTH = 210;
const DESKTOP_NODE_HEIGHT = 80;
const MOBILE_NODE_WIDTH = 176;
const MOBILE_NODE_HEIGHT = 68;
const ACTIVE_DESKTOP_NODE_WIDTH = 230;
const ACTIVE_DESKTOP_NODE_HEIGHT = 90;

const getNodeDimensions = (nodeId: string, currentGpsNodeId: string | null | undefined, isMobile: boolean) => {
  if (isMobile) {
    return { width: MOBILE_NODE_WIDTH, height: MOBILE_NODE_HEIGHT };
  }
  const isActive = nodeId === currentGpsNodeId;
  if (isActive) {
    return { width: ACTIVE_DESKTOP_NODE_WIDTH, height: ACTIVE_DESKTOP_NODE_HEIGHT };
  }
  return { width: DESKTOP_NODE_WIDTH, height: DESKTOP_NODE_HEIGHT };
};

export const WorkspacePage: React.FC = () => {
  const {
    goal,
    dailyLearningMinutes,
    learningStyle,
    learnerProfile,
    knowledgeGraph,
    studyGPS,
    selectedNodeId,
    completeNode,
    selectNode,
    resetAll,
    isDemoMode,
    errorMsg,
    theme,
    toggleTheme,
    journeyProgress,
    setStep,
    learnerId,
    updateRouteActivity
  } = useLearning();

  // Graph interaction state
  const [scale, setScale] = useState<number>(0.95);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Responsive mobile states
  const [activeTab, setActiveTab] = useState<"gps" | "map">("gps");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [sheetState, setSheetState] = useState<"default" | "expanded">("default");
  const [showLegendModal, setShowLegendModal] = useState<boolean>(false);
  const [showLogoConfirmModal, setShowLogoConfirmModal] = useState<boolean>(false);
  const [isCameraAnimating, setIsCameraAnimating] = useState<boolean>(false);
  const [isRerouting, setIsRerouting] = useState<boolean>(false);
  const [reroutingProgress, setReroutingProgress] = useState<number>(0);
  const [reroutingStage, setReroutingStage] = useState<string>("");

  // Locating current step states
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locatingError, setLocatingError] = useState<string | null>(null);

  // Refs for tracking multi-touch pointer events
  const pointerCache = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);
  const initialPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<{ nodeId: string; time: number } | null>(null);

  // Sync ref values for wheel events
  const scaleRef = useRef<number>(scale);
  const panRef = useRef<{ x: number; y: number }>(pan);

  useEffect(() => {
    scaleRef.current = scale;
    panRef.current = pan;
  }, [scale, pan]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Set initial sheet state when selecting a node
  useEffect(() => {
    if (selectedNodeId) {
      setSheetState("default");
    }
  }, [selectedNodeId]);

  // Prevent body scroll only on Workspace Page
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalOverscroll = window.getComputedStyle(document.body).overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    
    const originalHtmlStyle = document.documentElement.style.overflow;
    const originalHtmlOverscroll = window.getComputedStyle(document.documentElement).overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.overscrollBehavior = originalOverscroll;
      document.documentElement.style.overflow = originalHtmlStyle;
      document.documentElement.style.overscrollBehavior = originalHtmlOverscroll;
    };
  }, []);

  // Zoom and Pan Handlers (clamped to suggested limits 0.45 to 2.25)
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.15, 2.25));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.15, 0.45));

  // Focus and center camera on a node
  const focusNode = (nodeId: string, zoomLevel = 1.15) => {
    const coords = getNodeCoordinates(nodeId);
    let containerWidth = window.innerWidth;
    let containerHeight = window.innerHeight;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      containerWidth = rect.width;
      containerHeight = rect.height;
    } else {
      containerWidth = isMobile ? window.innerWidth : window.innerWidth * 0.7;
      containerHeight = isMobile ? window.innerHeight - 52 : window.innerHeight;
    }

    const headerOffset = isMobile ? 100 : 0; // mobile top safe area for floating header
    
    // We want the node to center in the remaining area below the header
    const viewportCenterX = containerWidth / 2;
    const viewportCenterY = (containerHeight + headerOffset) / 2;

    setIsCameraAnimating(true);
    setScale(zoomLevel);
    setPan({
      x: viewportCenterX - coords.x * zoomLevel,
      y: viewportCenterY - coords.y * zoomLevel
    });
    
    setTimeout(() => {
      setIsCameraAnimating(false);
    }, 400); // matches CSS transition transform duration
  };

  // Automatically fit the complete learning route inside the viewport with responsive adjustments
  const fitGraphToViewport = () => {
    if (!knowledgeGraph || !knowledgeGraph.nodes || knowledgeGraph.nodes.length === 0) return;

    const coordsList = knowledgeGraph.nodes.map(node => getNodeCoordinates(node.id));
    if (coordsList.length === 0) return;

    // Get current node dimensions
    const nWidth = isMobile ? MOBILE_NODE_WIDTH : DESKTOP_NODE_WIDTH;
    const nHeight = isMobile ? MOBILE_NODE_HEIGHT : DESKTOP_NODE_HEIGHT;

    let minX = Math.min(...coordsList.map(c => c.x - nWidth / 2));
    let maxX = Math.max(...coordsList.map(c => c.x + nWidth / 2));
    let minY = Math.min(...coordsList.map(c => c.y - nHeight / 2));
    let maxY = Math.max(...coordsList.map(c => c.y + nHeight / 2));

    // Include end destination bounds
    const finalNode = knowledgeGraph.nodes[knowledgeGraph.nodes.length - 1];
    if (finalNode) {
      const finalNodeCoord = getNodeCoordinates(finalNode.id);
      const destX = finalNodeCoord.x + 260;
      const destY = finalNodeCoord.y;
      const destWidth = isMobile ? MOBILE_NODE_WIDTH : DESKTOP_NODE_WIDTH;
      const destHeight = isMobile ? MOBILE_NODE_HEIGHT : DESKTOP_NODE_HEIGHT;

      const destXMin = destX - destWidth / 2;
      const destXMax = destX + destWidth / 2;
      const destYMin = destY - destHeight / 2;
      const destYMax = destY + destHeight / 2;

      minX = Math.min(minX, destXMin);
      maxX = Math.max(maxX, destXMax);
      minY = Math.min(minY, destYMin);
      maxY = Math.max(maxY, destYMax);
    }

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    let containerWidth = 0;
    let containerHeight = 0;

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      containerWidth = rect.width;
      containerHeight = rect.height;
    }

    if (containerWidth === 0 || containerHeight === 0) {
      containerWidth = isMobile ? window.innerWidth : window.innerWidth * 0.7;
      containerHeight = isMobile ? window.innerHeight - 52 : window.innerHeight;
    }

    const padding = isMobile ? 32 : 65; // Suggested padding
    const headerOffset = isMobile ? 100 : 0; // mobile top safe area for floating header to prevent overlaying

    const availableWidth = containerWidth - padding * 2;
    const availableHeight = containerHeight - headerOffset - padding * 2;

    const scaleX = availableWidth / graphWidth;
    const scaleY = availableHeight / graphHeight;
    let targetScale = Math.min(scaleX, scaleY);

    const nodeCount = knowledgeGraph.nodes.length;
    if (nodeCount <= 10) {
      if (isMobile) {
        targetScale = Math.max(0.65, Math.min(0.95, targetScale));
      } else {
        targetScale = Math.max(0.75, Math.min(1.1, targetScale));
      }
    } else {
      if (isMobile) {
        targetScale = Math.max(0.45, Math.min(1.1, targetScale));
      } else {
        targetScale = Math.max(0.45, Math.min(1.3, targetScale));
      }
    }

    const boundsCenterX = (minX + maxX) / 2;
    const boundsCenterY = (minY + maxY) / 2;

    const viewportCenterX = containerWidth / 2;
    const viewportCenterY = (containerHeight + headerOffset) / 2;

    // Camera failsafe check
    const hasVisibleNode = knowledgeGraph.nodes.some(node => {
      const coords = getNodeCoordinates(node.id);
      const screenX = (viewportCenterX - boundsCenterX * targetScale) + coords.x * targetScale;
      const screenY = (viewportCenterY - boundsCenterY * targetScale) + coords.y * targetScale;
      return screenX >= 0 && screenX <= containerWidth && screenY >= 0 && screenY <= containerHeight;
    });

    let finalPanX = viewportCenterX - boundsCenterX * targetScale;
    let finalPanY = viewportCenterY - boundsCenterY * targetScale;

    if (!hasVisibleNode) {
      console.warn("[MOBILE GRAPH] Fit produced off-screen graph. Applying safe camera reset.");
      const firstNode = knowledgeGraph.nodes[0];
      if (firstNode) {
        const firstCoords = getNodeCoordinates(firstNode.id);
        finalPanX = viewportCenterX - firstCoords.x * targetScale;
        finalPanY = viewportCenterY - firstCoords.y * targetScale;
      }
    }

    setIsCameraAnimating(true);
    setScale(targetScale);
    setPan({
      x: finalPanX,
      y: finalPanY
    });

    setTimeout(() => {
      setIsCameraAnimating(false);
    }, 400);
  };

  // Automatically call fitGraphToViewport using ResizeObserver when activeTab switches or graph updates
  useEffect(() => {
    const element = canvasRef.current;
    if (!element || !knowledgeGraph || !knowledgeGraph.nodes || knowledgeGraph.nodes.length === 0) {
      return;
    }

    if (isMobile && activeTab !== "map") {
      return;
    }

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fitGraphToViewport();
        });
      });
    });

    observer.observe(element);

    // Initial fits
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fitGraphToViewport();
      });
    });

    return () => {
      observer.disconnect();
    };
  }, [activeTab, knowledgeGraph, isMobile]);

  const handleFitView = () => {
    fitGraphToViewport();
  };

  // Re-useable resolver for finding real current step concept node in knowledgeGraph
  const resolveCurrentStepNode = () => {
    if (!studyGPS || !knowledgeGraph || !knowledgeGraph.nodes) return null;
    const currentNodeId = studyGPS.current_node_id;
    const currentStepTitle = studyGPS.current_step?.title || studyGPS.current_step?.name;

    // 1. Match by stable ID
    let matchedNode = knowledgeGraph.nodes.find(n => n.id === currentNodeId);
    if (matchedNode) return matchedNode;

    // 2. Normalization fallback
    const normalize = (val: string) => val.toLowerCase().trim().replace(/[^a-z0-9]+/g, " ");
    
    if (currentStepTitle) {
      const normStepTitle = normalize(currentStepTitle);
      matchedNode = knowledgeGraph.nodes.find(n => {
        const normLabel = normalize(n.label);
        const normId = normalize(n.id);
        return normLabel === normStepTitle || normId === normStepTitle;
      });
      if (matchedNode) return matchedNode;
    }

    console.warn("[CURRENT STEP] Unable to resolve Study GPS step to graph node", {
      currentNodeId,
      currentStepTitle
    });
    return null;
  };

  // Dynamic flow to inspect, focus camera, select node, and open Concept Details
  const inspectCurrentStep = () => {
    const node = resolveCurrentStepNode();
    if (!node) {
      setLocatingError("Current step could not be located on your learning map.");
      setTimeout(() => setLocatingError(null), 4000);
      return;
    }

    setIsLocating(true);
    setLocatingError(null);

    if (isMobile && activeTab !== "map") {
      setActiveTab("map");
    }

    const checkAndFocus = () => {
      if (canvasRef.current && canvasRef.current.clientWidth > 0 && canvasRef.current.clientHeight > 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            selectNode(node.id);
            focusNode(node.id, 1.25);
            setIsLocating(false);
          });
        });
      } else {
        setTimeout(checkAndFocus, 100);
      }
    };

    checkAndFocus();
  };

  // Pointer Event handlers supporting single touch, pointer drag, and multi-touch pinch to zoom
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".graph-node") || (e.target as HTMLElement).closest("button")) {
      return;
    }
    
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerCache.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    
    if (pointerCache.current.size === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    } else if (pointerCache.current.size === 2) {
      const pointers = Array.from(pointerCache.current.values()) as { clientX: number; clientY: number }[];
      const p1 = pointers[0];
      const p2 = pointers[1];
      initialDistance.current = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
      initialScale.current = scale;
      initialPan.current = { ...pan };
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerCache.current.has(e.pointerId)) return;
    pointerCache.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    if (pointerCache.current.size === 1 && isDragging) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    } else if (pointerCache.current.size === 2 && initialDistance.current !== null) {
      const pointers = Array.from(pointerCache.current.values()) as { clientX: number; clientY: number }[];
      const p1 = pointers[0];
      const p2 = pointers[1];
      const currentDistance = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
      
      if (initialDistance.current > 0) {
        const factor = currentDistance / initialDistance.current;
        const newScale = Math.max(0.45, Math.min(2.25, initialScale.current * factor));
        
        // Midpoint coordinates
        const midX = (p1.clientX + p2.clientX) / 2;
        const midY = (p1.clientY + p2.clientY) / 2;
        
        // Zoom centered around the touch midpoint
        const canvasX = (midX - initialPan.current.x) / initialScale.current;
        const canvasY = (midY - initialPan.current.y) / initialScale.current;
        
        const newPanX = midX - canvasX * newScale;
        const newPanY = midY - canvasY * newScale;
        
        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointerCache.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
    
    if (pointerCache.current.size < 2) {
      initialDistance.current = null;
    }
    if (pointerCache.current.size === 0) {
      setIsDragging(false);
    } else if (pointerCache.current.size === 1) {
      // Re-initialize drag start with the remaining pointer
      const remaining = Array.from(pointerCache.current.values())[0] as { clientX: number; clientY: number };
      dragStart.current = { x: remaining.clientX - pan.x, y: remaining.clientY - pan.y };
    }
  };

  // Wheel zoom focusing around the mouse pointer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelPrevent = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 0.05;
      const direction = e.deltaY < 0 ? 1 : -1;
      
      const currentScale = scaleRef.current;
      const currentPan = panRef.current;
      const newScale = Math.max(0.45, Math.min(2.25, currentScale + direction * zoomFactor));
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const canvasX = (mouseX - currentPan.x) / currentScale;
      const canvasY = (mouseY - currentPan.y) / currentScale;

      const newPanX = mouseX - canvasX * newScale;
      const newPanY = mouseY - canvasY * newScale;

      setScale(newScale);
      setPan({ x: newPanX, y: newPanY });
    };

    canvas.addEventListener("wheel", handleWheelPrevent, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheelPrevent);
    };
  }, []);

  // Node Tap & Double Tap Focus Handler
  const handleNodeClick = (nodeId: string) => {
    const now = Date.now();
    if (lastTapRef.current && lastTapRef.current.nodeId === nodeId && (now - lastTapRef.current.time) < 300) {
      // Double tap -> smoothly focus and center node
      focusNode(nodeId, 1.25);
      lastTapRef.current = null;
    } else {
      // Normal click -> select node
      lastTapRef.current = { nodeId, time: now };
      selectNode(nodeId);
    }
  };

  // Node focus opacity states helpers
  const isNodeRelated = (nodeId: string): boolean => {
    if (selectedNodeId === null) return true;
    if (selectedNodeId === nodeId) return true;
    const edges = knowledgeGraph.edges || [];
    return edges.some(edge => 
      (edge.source === selectedNodeId && edge.target === nodeId) ||
      (edge.source === nodeId && edge.target === selectedNodeId)
    );
  };

  const isEdgeRelated = (edge: { source: string; target: string }): boolean => {
    if (selectedNodeId === null) return true;
    return edge.source === selectedNodeId || edge.target === selectedNodeId;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".graph-node")) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Non-destructive Home navigation: preserves learnerId, knowledgeGraph, Study GPS,
  // mastered nodes and route metadata. Only updates lastActivityAt and navigates to
  // the landing page. Does NOT call resetAll and does NOT touch Neo4j/Gemini.
  const leaveWorkspaceToHome = () => {
    if (learnerId) {
      updateRouteActivity(learnerId);
    }
    setShowLogoConfirmModal(false);
    setStep("landing");
  };

  // Intercept completion to trigger an immersive, calming route update sequence
  const handleCompleteNode = (nodeId: string) => {
    setIsRerouting(true);
    setReroutingProgress(10);
    setReroutingStage("Saving your progress...");

    setTimeout(() => {
      setReroutingProgress(45);
      setReroutingStage("Updating your dependency map...");
    }, 450);

    setTimeout(() => {
      setReroutingProgress(80);
      setReroutingStage("Plotting next milestones...");
    }, 950);

    setTimeout(() => {
      setReroutingProgress(100);
      setReroutingStage("Route updated successfully!");
    }, 1450);

    setTimeout(() => {
      completeNode(nodeId);
      setIsRerouting(false);
    }, 1800);
  };

  // Dynamically compute organic, layered topological coordinates for any arbitrary DAG
  const computedCoordinates = React.useMemo(() => {
    if (!knowledgeGraph || !knowledgeGraph.nodes) return {};

    const nodes = knowledgeGraph.nodes;
    const edges = knowledgeGraph.edges || [];

    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    
    nodes.forEach(node => {
      adj[node.id] = [];
      inDegree[node.id] = 0;
    });

    edges.forEach(edge => {
      if (adj[edge.source]) {
        adj[edge.source].push(edge.target);
      }
      if (inDegree[edge.target] !== undefined) {
        inDegree[edge.target]++;
      }
    });

    const queue: { id: string; layer: number }[] = [];
    nodes.forEach(node => {
      if (inDegree[node.id] === 0) {
        queue.push({ id: node.id, layer: 0 });
      }
    });

    const nodeLayers: Record<string, number> = {};
    const layerGroups: Record<number, string[]> = {};

    while (queue.length > 0) {
      const { id, layer } = queue.shift()!;
      nodeLayers[id] = layer;
      
      if (!layerGroups[layer]) {
        layerGroups[layer] = [];
      }
      if (!layerGroups[layer].includes(id)) {
        layerGroups[layer].push(id);
      }

      const neighbors = adj[id] || [];
      neighbors.forEach(neighbor => {
        inDegree[neighbor]--;
        const nextLayer = Math.max(nodeLayers[neighbor] || 0, layer + 1);
        queue.push({ id: neighbor, layer: nextLayer });
      });
    }

    nodes.forEach(node => {
      if (nodeLayers[node.id] === undefined) {
        nodeLayers[node.id] = 0;
        if (!layerGroups[0]) layerGroups[0] = [];
        layerGroups[0].push(node.id);
      }
    });

    const coords: Record<string, { x: number; y: number }> = {};
    const colWidth = 260;
    const rowHeight = 150;
    const startX = 140;

    Object.keys(layerGroups).forEach(layerStr => {
      const layer = parseInt(layerStr, 10);
      const ids = layerGroups[layer];
      const count = ids.length;

      ids.forEach((id, idx) => {
        const x = startX + layer * colWidth;
        const y = 220 + (idx - (count - 1) / 2) * rowHeight;
        coords[id] = { x, y };
      });
    });

    return coords;
  }, [knowledgeGraph]);

  // Map node IDs to coordinates
  const getNodeCoordinates = (nodeId: string): { x: number; y: number } => {
    const layoutMap: Record<string, { x: number; y: number }> = {
      // AI Engineer Track
      "python": { x: 120, y: 260 },
      "numpy": { x: 340, y: 100 },
      "pandas": { x: 340, y: 260 },
      "statistics": { x: 340, y: 420 },
      "linear-algebra": { x: 560, y: 100 },
      "machine-learning": { x: 800, y: 260 },
      "model-evaluation": { x: 1040, y: 100 },
      "deep-learning": { x: 1040, y: 260 },
      "transformers": { x: 1280, y: 260 },

      // DSA Track
      "arrays-lists": { x: 380, y: 140 },
      "stacks-queues": { x: 640, y: 260 },
      "recursion": { x: 900, y: 380 },
      "trees-graphs": { x: 1160, y: 260 },

      // Full Stack Track
      "web-basics": { x: 150, y: 140 },
      "react-framework": { x: 420, y: 260 },
      "node-express": { x: 690, y: 140 },
      "sql-databases": { x: 960, y: 260 }
    };

    return layoutMap[nodeId] || computedCoordinates[nodeId] || { x: 300, y: 300 };
  };

  if (!knowledgeGraph || !studyGPS) {
    return (
      <div className="min-h-screen bg-bg-app text-text-primary flex items-center justify-center font-sans">
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Configuring learning route...</span>
        </div>
      </div>
    );
  }

  // Active inspector node
  const activeInspectorNode = knowledgeGraph.nodes.find(n => n.id === selectedNodeId) || null;
  const currentGPSNode = knowledgeGraph.nodes.find(n => n.id === studyGPS.current_node_id) || null;

  // Curated resources
  const activeResources = activeInspectorNode 
    ? CURATED_RESOURCES.filter(r => r.conceptId.toLowerCase() === activeInspectorNode.id.toLowerCase()).length > 0
      ? CURATED_RESOURCES.filter(r => r.conceptId.toLowerCase() === activeInspectorNode.id.toLowerCase())
      : [
          {
            id: `search_${activeInspectorNode.id}`,
            conceptId: activeInspectorNode.id,
            title: `Official '${activeInspectorNode.label}' Learning Guide`,
            provider: "Google Search",
            type: "documentation" as any,
            difficulty: "Beginner" as any,
            description: `Search query: "${activeInspectorNode.label} documentation developer tutorial"`,
            url: `https://www.google.com/search?q=${encodeURIComponent(activeInspectorNode.label + " tutorial documentation")}`
          }
        ]
    : [];

  const getResourcePreferenceBadge = (type: string) => {
    if (learningStyle === "visual" && type === "video") return "Best Match";
    if (learningStyle === "reading" && (type === "documentation" || type === "article")) return "Best Match";
    if (learningStyle === "hands-on" && type === "practice") return "Best Match";
    return null;
  };

  const totalNodesCount = knowledgeGraph.nodes.length;
  const masteredNodesCount = knowledgeGraph.nodes.filter(n => n.status === "mastered").length;

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-bg-app text-text-primary flex flex-col overflow-hidden font-sans transition-colors duration-300">
      
      {/* Background ambient glow */}
      <div className="absolute top-[5%] left-[5%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* MOBILE TAB BAR CONTROLS */}
      <div className="md:hidden flex bg-bg-surface border-b border-border-primary shrink-0 h-[52px] z-40 p-2">
        <button
          onClick={() => setActiveTab("gps")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "gps" 
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" 
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Study GPS</span>
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === "map" 
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" 
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          <MapIcon className="w-4 h-4" />
          <span>Learning Map</span>
        </button>
      </div>

      {/* MAIN WORKSPACE COLUMNS CONTAINER */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden relative w-full">

        {/* LEFT PANEL - STUDY GPS CONSOLE */}
        <div 
          id="left-gps-panel" 
          className={`${activeTab === "gps" ? "flex" : "hidden"} md:flex w-full md:w-[35%] lg:w-[30%] bg-bg-sidebar border-r border-border-primary/60 flex-col h-full overflow-y-auto shrink-0 relative transition-colors duration-300`}
        >
        
        {/* Brand Header */}
        <div className="p-4 border-b border-border-primary/60 flex items-center justify-between bg-bg-surface/90 backdrop-blur sticky top-0 z-30">
          <div onClick={() => setShowLogoConfirmModal(true)} className="flex items-center space-x-2 cursor-pointer hover:opacity-85 transition-opacity">
            <GuidelyLogo size="xs" />
            <span className="font-sans font-extrabold text-sm tracking-tight text-text-primary">
              GUIDELY
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-border-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer bg-bg-app"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Highly Discoverable Destination Header with Change Destination Button */}
        <div className="p-5 border-b border-border-primary/60 bg-bg-surface/40">
          <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase block">CURRENT DESTINATION</span>
          <h1 className="text-base font-extrabold text-text-primary tracking-tight mt-1 flex items-center gap-1.5 leading-snug">
            <Sparkles className="w-4.5 h-4.5 text-blue-500 shrink-0" />
            {goal || "Become an AI Engineer"}
          </h1>
          <div className="mt-3.5">
            <button
              onClick={resetAll}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors cursor-pointer bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/30 px-3 py-1.5 rounded-lg"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Change Destination</span>
            </button>
          </div>
        </div>

        {/* Journey Route Progress Card - Distinguishes route setup progress (10%) and concept mastery */}
        <div className="p-5 border-b border-border-primary/60 bg-bg-surface/20 space-y-4">
          <div className="bg-bg-surface border border-border-primary/80 p-4 rounded-xl space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-secondary">Route Progress</span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">{journeyProgress}%</span>
            </div>
            
            {/* Elegant high-quality progress bar */}
            <div className="w-full bg-bg-app border border-border-primary/80 h-2.5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${journeyProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            {/* Supporting progress message */}
            <p className="text-xs text-text-muted leading-relaxed font-sans">
              {journeyProgress === 10 || masteredNodesCount === 0
                ? "Your route is mapped. You're ready to start."
                : journeyProgress === 100
                ? "Congratulations! You've mastered your entire route!"
                : "You're making great progress along your route!"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-surface border border-border-primary/80 p-3.5 rounded-xl flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                Mastery
              </span>
              <div className="mt-2.5 flex items-baseline space-x-1">
                <span className="text-base font-extrabold text-text-primary">{masteredNodesCount} / {totalNodesCount}</span>
                <span className="text-[10px] text-text-muted font-sans">concepts</span>
              </div>
            </div>

            <div className="bg-bg-surface border border-border-primary/80 p-3.5 rounded-xl flex flex-col justify-between shadow-sm">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                ETA
              </span>
              <div className="mt-2.5 flex items-baseline space-x-1">
                <span className="text-base font-extrabold text-text-primary">~{studyGPS.estimated_days}</span>
                <span className="text-[10px] text-text-muted font-sans">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* STUDY GPS NAVIGATION TIMELINE */}
        <div className="p-5 flex-1 space-y-6">
          <div>
            <h2 className="text-xs font-bold text-text-primary uppercase tracking-wide flex items-center mb-4">
              <Navigation className="w-4 h-4 text-blue-500 mr-2" />
              Your Guided Milestones
            </h2>
            
            {/* Elegant vertical pathway visualizer */}
            <div className="space-y-3 relative pl-4 border-l border-border-primary/80 ml-2.5">
              {knowledgeGraph.nodes.map((node) => {
                const isCurrent = node.id === studyGPS.current_node_id;
                const isMastered = node.status === "mastered";
                const isBlocked = node.status === "locked";
                const isMissing = node.status === "missing";
                
                let dotColor = "border-border-primary bg-bg-sidebar text-text-muted";
                if (isMastered) dotColor = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500";
                else if (isCurrent) dotColor = "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-500 animate-pulse";
                else if (isMissing) dotColor = "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-500";

                return (
                  <div key={node.id} className="relative flex items-start space-x-3.5 group">
                    {/* Route bullet */}
                    <div className={`absolute left-[-22.5px] w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${dotColor}`}>
                      {isMastered ? (
                        <Check className="w-2.5 h-2.5 text-emerald-500 stroke-[2]" />
                      ) : isBlocked ? (
                        <Lock className="w-2 h-2 text-text-muted" />
                      ) : isCurrent ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      ) : (
                        <span className="w-1 h-1 rounded-full bg-text-muted" />
                      )}
                    </div>

                    <button 
                      onClick={() => selectNode(node.id)}
                      className={`text-left flex-1 focus:outline-none p-2 rounded-lg transition-all cursor-pointer ${
                        selectedNodeId === node.id 
                          ? "bg-bg-surface border border-border-primary shadow-sm text-text-primary" 
                          : "hover:bg-bg-surface/50 text-text-secondary"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isCurrent ? "text-text-primary underline decoration-blue-500 decoration-2 underline-offset-4" : isBlocked ? "text-text-muted" : "text-text-secondary"}`}>
                          {node.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[8px] font-mono font-bold bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 px-1.5 py-0.2 rounded">
                            GPS ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-text-muted line-clamp-1 mt-0.5">{node.description}</p>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NEXT STEP RECOMMENDATION CARD */}
          {currentGPSNode && (
            <div className="bg-bg-surface border border-border-primary p-4.5 rounded-xl space-y-3.5 relative shadow-sm">
              <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-blue-500 fill-current" />
                Next Best Step
              </div>

              <div>
                <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest block">RECOMMENDED STEP</span>
                <h3 className="text-xs font-extrabold text-text-primary mt-1">{currentGPSNode.label}</h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed font-sans">
                  {studyGPS.reason || "Recommended because this concept builds crucial prerequisite strength for your learning goals."}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-muted font-mono py-1.5 border-y border-border-primary/60">
                <span>ESTIMATED: ~{Math.round(currentGPSNode.estimatedHours / (dailyLearningMinutes / 60)) || 3} days</span>
                <span>TARGET: {dailyLearningMinutes}m / day</span>
              </div>

              <button
                onClick={inspectCurrentStep}
                disabled={isLocating}
                id="btn-start-current-step"
                className={`w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg shadow-lg shadow-blue-600/10 cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center space-x-1.5 ${
                  isLocating ? "bg-amber-600 shadow-amber-600/10" : ""
                }`}
              >
                <span>{isLocating ? "Locating current step..." : "Inspect Current Step"}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
              </button>

              {locatingError && (
                <p className="text-[10px] text-red-500 font-bold font-sans mt-1.5 text-center leading-tight">
                  {locatingError}
                </p>
              )}
            </div>
          )}

          {/* FRIENDLY TODAY'S PLAN CARD - No technical OS jargon */}
          <div className="bg-bg-surface/30 border border-border-primary/50 p-4 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <MapIcon className="w-4 h-4 text-blue-500" />
              Your Daily Study Plan
            </h3>
            <div className="space-y-2 text-[11px] text-text-secondary leading-relaxed">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold shrink-0">1.</span>
                <span>Spend about 20 minutes reviewing core concepts and interactive learning resources.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold shrink-0">2.</span>
                <span>Practice with hands-on challenge codes and exercises to solidify your understanding.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold shrink-0">3.</span>
                <span>Work on the custom suggested project match to apply your skills.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Console footer without OS version jargon */}
        <div className="p-4 bg-bg-surface/90 backdrop-blur border-t border-border-primary/60 flex justify-between items-center z-10 sticky bottom-0">
          <span className="text-[11px] font-medium text-text-muted">
            Guidely • The Google Maps for Learning
          </span>
          {isDemoMode && (
            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200/50">
              Demo Mode
            </span>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - GRAPH CANVAS */}
      <div 
        id="graph-canvas-container" 
        className={`${activeTab === "map" ? "flex" : "hidden"} md:flex flex-1 h-full flex-col relative select-none`}
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Background Dot pattern */}
        <div className="absolute inset-0 bg-dot-pattern pointer-events-none" />
 
        {/* Minimalist Map Header & Controls Toolbar */}
        <div className="absolute top-4 left-4 right-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 z-20 pointer-events-none font-sans">
          {/* Custom Minimal mobile/desktop header */}
          <div 
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="bg-bg-surface/90 backdrop-blur border border-border-primary/80 p-3 px-4 rounded-2xl shadow-lg pointer-events-auto flex flex-col max-w-[280px] sm:max-w-xs transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
              <span className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
                Your learning map
              </span>
            </div>
            <span className="text-[10px] text-text-secondary mt-1 font-medium leading-tight">
              Follow your route to the next concept.
            </span>
          </div>
 
          {/* Legend trigger button on mobile */}
          <div 
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex items-center space-x-2 pointer-events-auto self-end sm:self-auto"
          >
            <button
              onClick={() => setShowLegendModal(true)}
              className="md:hidden bg-bg-surface/90 backdrop-blur border border-border-primary p-2 px-3.5 rounded-xl text-[10px] font-bold text-text-secondary shadow-md hover:text-text-primary cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              <span>Legend</span>
            </button>
          </div>
        </div>
 
        {/* Floating Compact Map Navigation Controls - Bottom Right Stack */}
        <div 
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute bottom-6 right-6 flex flex-col space-y-2.5 z-20 pointer-events-auto"
        >
          {/* Zoom In */}
          <button 
            onClick={handleZoomIn}
            className="w-10 h-10 bg-bg-surface/90 hover:bg-bg-surface backdrop-blur border border-border-primary rounded-xl flex items-center justify-center shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-text-secondary hover:text-text-primary cursor-pointer"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          
          {/* Zoom Out */}
          <button 
            onClick={handleZoomOut}
            className="w-10 h-10 bg-bg-surface/90 hover:bg-bg-surface backdrop-blur border border-border-primary rounded-xl flex items-center justify-center shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-text-secondary hover:text-text-primary cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
 
          {/* Fit Learning Route Camera bounds */}
          <button 
            onClick={fitGraphToViewport}
            className="w-10 h-10 bg-bg-surface/90 hover:bg-bg-surface backdrop-blur border border-border-primary rounded-xl flex items-center justify-center shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-text-secondary hover:text-text-primary cursor-pointer"
            title="Fit learning route"
            aria-label="Fit learning route"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
 
          {/* Go to Current Active Step */}
          <button 
            onClick={() => focusNode(studyGPS.current_node_id, 1.15)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer shadow-blue-500/25"
            title="Go to current step"
            aria-label="Go to current step"
          >
            <Navigation className="w-5 h-5 rotate-45 fill-current" />
          </button>
        </div>
 
        {/* Floating Graph Legend for Desktops */}
        <div 
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute bottom-6 left-6 bg-bg-surface/85 backdrop-blur border border-border-primary p-4 rounded-2xl shadow-lg z-20 space-y-2.5 hidden md:block w-52 font-sans text-left"
        >
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Legend</span>
          <div className="grid grid-cols-1 gap-2 text-[10px] font-mono text-text-secondary">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400 shrink-0" />
              <span>Mastered</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-400 animate-pulse shrink-0" />
              <span>Active Step</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-bg-sidebar border border-border-primary shrink-0" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-400 shrink-0" />
              <span>Missing Gap</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-bg-app border border-border-primary/80 flex items-center justify-center shrink-0">
                <Lock className="w-1.5 h-1.5 text-text-muted" />
              </span>
              <span>Locked</span>
            </div>
          </div>
        </div>

        {/* THE CORE PANNING AND ZOOMING VIEWPORT CANVAS */}
        <div 
          ref={canvasRef}
          className="w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
          style={{ transform: "translate3d(0,0,0)" }}
        >
          <div 
            className="absolute inset-0 origin-top-left"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: isCameraAnimating ? "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none"
            }}
          >
            {/* SVG Dependency Connecting Edges background */}
            <svg className="absolute top-0 left-0 w-[2000px] h-[1500px] pointer-events-none z-0 overflow-visible">
              {knowledgeGraph.edges.map((edge, idx) => {
                const sourceCoord = getNodeCoordinates(edge.source);
                const targetCoord = getNodeCoordinates(edge.target);
                
                const sx = sourceCoord.x + 110;
                const sy = sourceCoord.y + 27;
                const tx = targetCoord.x + 110;
                const ty = targetCoord.y + 27;

                const sourceNode = knowledgeGraph.nodes.find(n => n.id === edge.source);
                const targetNode = knowledgeGraph.nodes.find(n => n.id === edge.target);

                const isMasteredEdge = sourceNode?.status === "mastered" && targetNode?.status === "mastered";
                const isActiveEdge = targetNode?.id === studyGPS.current_node_id && sourceNode?.status === "mastered";
                const isMissingEdge = sourceNode?.status === "missing" || targetNode?.status === "missing";
                const isAvailableEdge = targetNode?.status === "available" && sourceNode?.status === "mastered";
                
                // Define if this edge is on the active learning route
                const isActiveRouteEdge = 
                  (targetNode?.id === studyGPS.current_node_id && sourceNode?.status === "mastered") ||
                  (sourceNode?.id === studyGPS.current_node_id && targetNode?.status === "available") ||
                  (sourceNode?.id === studyGPS.current_node_id && targetNode?.status === "locked");

                const dx = tx - sx;
                const dy = ty - sy;
                const cx1 = sx + dx * 0.5;
                const cy1 = sy;
                const cx2 = sx + dx * 0.5;
                const cy2 = ty;
                const pathD = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

                const isRelated = isEdgeRelated(edge);
                const focusOpacity = isRelated ? 1.0 : 0.22;
                const edgeStyle = {
                  opacity: focusOpacity,
                  transition: "opacity 0.3s ease"
                };

                if (isMasteredEdge) {
                  return (
                    <g key={idx} style={edgeStyle}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="rgba(16, 185, 129, 0.12)"
                        strokeWidth={6}
                        className="transition-all duration-300"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="rgba(16, 185, 129, 0.7)"
                        strokeWidth={2}
                        className="transition-all duration-300"
                      />
                      {isActiveRouteEdge && (
                        <motion.path
                          d={pathD}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth={1.8}
                          strokeDasharray="6, 12"
                          animate={{ strokeDashoffset: [-36, 0] }}
                          transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 2
                          }}
                        />
                      )}
                    </g>
                  );
                }

                if (isActiveEdge) {
                  return (
                    <g key={idx} style={edgeStyle}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.18)"
                        strokeWidth={8}
                        className="transition-all duration-300"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.45)"
                        strokeWidth={4.5}
                        className="transition-all duration-300"
                      />
                      {/* Active Flowing Kinetic Impulse */}
                      <motion.path
                        d={pathD}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={2.2}
                        strokeDasharray="10, 15"
                        animate={{ strokeDashoffset: [-50, 0] }}
                        transition={{
                          repeat: Infinity,
                          ease: "linear",
                          duration: 1.6
                        }}
                      />
                    </g>
                  );
                }

                if (isMissingEdge) {
                  return (
                    <g key={idx} style={edgeStyle}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.1)"
                        strokeWidth={5}
                        className="animate-pulse"
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="rgba(239, 68, 68, 0.65)"
                        strokeWidth={1.5}
                        strokeDasharray="4, 4"
                        className="animate-pulse"
                      />
                    </g>
                  );
                }

                if (isAvailableEdge) {
                  return (
                    <g key={idx} style={edgeStyle}>
                      <path
                        d={pathD}
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.45)"
                        strokeWidth={1.5}
                        className="transition-all duration-300"
                      />
                      {isActiveRouteEdge && (
                        <motion.path
                          d={pathD}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth={1.8}
                          strokeDasharray="6, 12"
                          animate={{ strokeDashoffset: [-36, 0] }}
                          transition={{
                            repeat: Infinity,
                            ease: "linear",
                            duration: 2
                          }}
                        />
                      )}
                    </g>
                  );
                }

                return (
                  <g key={idx} style={edgeStyle}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="var(--border-primary)"
                      strokeWidth={1}
                      strokeDasharray="2, 6"
                      className="opacity-40 transition-all duration-300"
                    />
                    {isActiveRouteEdge && (
                      <motion.path
                        d={pathD}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={1.8}
                        strokeDasharray="6, 12"
                        animate={{ strokeDashoffset: [-36, 0] }}
                        transition={{
                          repeat: Infinity,
                          ease: "linear",
                          duration: 2
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Dynamic Connection to Destination Marker Pin */}
              {(() => {
                if (!knowledgeGraph.nodes || knowledgeGraph.nodes.length === 0) return null;
                const finalNode = knowledgeGraph.nodes[knowledgeGraph.nodes.length - 1];
                if (!finalNode) return null;
                
                const sourceCoord = getNodeCoordinates(finalNode.id);
                const sx = sourceCoord.x + 110;
                const sy = sourceCoord.y + 27;
                const tx = sourceCoord.x + 260 - 110;
                const ty = sourceCoord.y + 27;
                
                const dx = tx - sx;
                const dy = ty - sy;
                const cx1 = sx + dx * 0.5;
                const cy1 = sy;
                const cx2 = sx + dx * 0.5;
                const cy2 = ty;
                const pathD = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;

                const isRelated = selectedNodeId === null || selectedNodeId === "destination_marker" || selectedNodeId === finalNode.id;
                const focusOpacity = isRelated ? 1.0 : 0.22;
                const edgeStyle = {
                  opacity: focusOpacity,
                  transition: "opacity 0.3s ease"
                };

                return (
                  <g style={edgeStyle}>
                    <path
                      d={pathD}
                      fill="none"
                      stroke="rgba(99, 102, 241, 0.45)"
                      strokeWidth={2}
                      strokeDasharray="4, 4"
                      className="transition-all duration-300"
                    />
                    <motion.path
                      d={pathD}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeDasharray="6, 12"
                      animate={{ strokeDashoffset: [-36, 0] }}
                      transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 1.8
                      }}
                    />
                  </g>
                );
              })()}
            </svg>

            {/* Absolute positioned Node Components */}
            <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
              {knowledgeGraph.nodes.map((node) => {
                const coords = getNodeCoordinates(node.id);
                const isSelected = selectedNodeId === node.id;
                const isRelated = isNodeRelated(node.id);
                const focusOpacity = isRelated ? 1.0 : 0.28;

                return (
                  <div
                    key={node.id}
                    className="graph-node absolute pointer-events-auto font-sans"
                    style={{ 
                      left: coords.x - 110, 
                      top: coords.y - 27,
                      width: "220px",
                      height: "54px",
                      opacity: focusOpacity,
                      transform: isSelected ? "scale(1.04)" : "scale(1)",
                      transition: "opacity 0.3s ease, transform 0.2s ease"
                    }}
                    onClick={() => handleNodeClick(node.id)}
                  >
                    <div className={`w-full h-full rounded-xl border transition-all duration-200 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md flex items-center px-3.5 py-2.5 ${
                      isSelected 
                        ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-bg-app bg-bg-surface border-blue-500 shadow-lg shadow-blue-500/15" 
                        : node.status === "mastered"
                        ? "border-emerald-500/30 bg-bg-surface shadow-sm hover:border-emerald-500/60"
                        : node.status === "active"
                        ? "border-blue-500/60 bg-bg-surface shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:border-blue-500"
                        : node.status === "missing"
                        ? "border-red-500/30 bg-bg-surface hover:border-red-500/60 shadow-sm"
                        : node.status === "available"
                        ? "border-border-primary bg-bg-surface hover:border-text-muted"
                        : "border-border-primary/50 bg-bg-app/40 opacity-50"
                    }`}>
                      
                      {/* Left: Waypoint Marker Indicator */}
                      <div className="relative flex items-center justify-center shrink-0 w-8 h-8 mr-3">
                        {node.status === "mastered" && (
                          <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center shadow-sm">
                            <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                          </div>
                        )}
                        
                        {node.status === "active" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            {/* Inner core pulsing glow */}
                            <motion.div 
                              className="absolute w-8 h-8 rounded-full bg-blue-500/15"
                              animate={{
                                scale: [1, 1.35, 1],
                              }}
                              transition={{
                                duration: 2.2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            {/* Outer propagating ripple */}
                            <motion.div
                              className="absolute w-8 h-8 rounded-full border-2 border-blue-500/40 bg-blue-500/5"
                              animate={{
                                scale: [0.8, 2.2],
                                opacity: [0.7, 0]
                              }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: [0.1, 0.8, 0.3, 1]
                              }}
                            />
                            {/* Secondary delay ripple */}
                            <motion.div
                              className="absolute w-8 h-8 rounded-full border border-blue-400/30 bg-blue-400/3"
                              animate={{
                                scale: [0.8, 1.7],
                                opacity: [0.6, 0]
                              }}
                              transition={{
                                duration: 1.8,
                                repeat: Infinity,
                                ease: [0.1, 0.8, 0.3, 1],
                                delay: 0.6
                              }}
                            />
                            {/* High contrast sharp core */}
                            <div className="relative w-5 h-5 rounded-full bg-blue-500 border border-white/20 flex items-center justify-center shadow-lg shadow-blue-500/40 z-10">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            </div>
                          </div>
                        )}

                        {node.status === "missing" && (
                          <>
                            <motion.div
                              className="absolute w-8 h-8 rounded-full border border-red-500/30 bg-red-500/5"
                              animate={{ scale: [1, 1.4, 1] }}
                              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <div className="w-5.5 h-5.5 rounded-full bg-red-500 border border-white/10 flex items-center justify-center shadow-md">
                              <AlertCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                          </>
                        )}

                        {node.status === "available" && (
                          <div className="w-5 h-5 rounded-full border border-border-primary bg-bg-app flex items-center justify-center hover:border-text-muted transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                          </div>
                        )}

                        {node.status === "locked" && (
                          <div className="w-5 h-5 rounded-full border border-border-primary bg-bg-app flex items-center justify-center">
                            <Lock className="w-2.5 h-2.5 text-text-muted" />
                          </div>
                        )}
                      </div>

                      {/* Right: Label text & Meta details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-left font-sans">
                        <span className={`text-xs font-bold truncate leading-tight ${
                          node.status === "locked" ? "text-text-muted" : "text-text-primary"
                        }`}>
                          {node.label}
                        </span>
                        <div className="flex items-center space-x-1.5 mt-1 text-[8px] font-mono text-text-muted">
                          <span className={`uppercase tracking-wider px-1.5 py-0.2 rounded text-[7px] border font-bold ${
                            node.status === "mastered" ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400" :
                            node.status === "active" ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400" :
                            node.status === "missing" ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400" :
                            node.status === "available" ? "bg-bg-sidebar border-border-primary text-text-secondary" :
                            "bg-bg-app border-border-primary text-text-muted"
                          }`}>
                            {node.status}
                          </span>
                          <span>•</span>
                          <span>{node.estimatedHours} hrs</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* Destination Marker Pin - Amber/Pink high-contrast map-pin node */}
              {(() => {
                if (!knowledgeGraph.nodes || knowledgeGraph.nodes.length === 0) return null;
                const finalNode = knowledgeGraph.nodes[knowledgeGraph.nodes.length - 1];
                if (!finalNode) return null;
                
                const finalCoord = getNodeCoordinates(finalNode.id);
                const destX = finalCoord.x + 260;
                const destY = finalCoord.y;
                
                const isSelected = selectedNodeId === "destination_marker";
                const isRelated = selectedNodeId === null || selectedNodeId === "destination_marker" || selectedNodeId === finalNode.id;
                const focusOpacity = isRelated ? 1.0 : 0.28;

                return (
                  <div
                    className="absolute pointer-events-auto font-sans transition-all duration-300"
                    style={{
                      left: destX - 110,
                      top: destY - 27,
                      width: "220px",
                      height: "54px",
                      opacity: focusOpacity,
                      transform: isSelected ? "scale(1.04)" : "scale(1)"
                    }}
                    onClick={() => selectNode("destination_marker")}
                  >
                    <div className={`w-full h-full rounded-xl border border-dashed border-indigo-500/80 bg-gradient-to-r from-indigo-950/90 to-blue-950/90 backdrop-blur-md flex items-center px-3.5 py-2.5 shadow-lg shadow-indigo-500/15 hover:-translate-y-0.5 cursor-pointer transition-all duration-200 ${
                      isSelected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-bg-app" : ""
                    }`}>
                      {/* Left Map Pin Icon with glowing bouncing motion */}
                      <div className="relative flex items-center justify-center shrink-0 w-8 h-8 mr-3 bg-indigo-500/20 rounded-full border border-indigo-500/40">
                        <MapPin className="w-4.5 h-4.5 text-indigo-400 animate-bounce" />
                      </div>
                      
                      {/* Right Goal Text */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-left">
                        <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-widest leading-none">
                          DESTINATION
                        </span>
                        <span className="text-[11px] font-extrabold text-white truncate mt-1 leading-tight">
                          {studyGPS.learner_goal || goal || "Become a Quantum Engineer"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Cognitive Route Transition Overlay */}
        <AnimatePresence>
          {isRerouting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-bg-app/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 select-none font-sans"
            >
              <div className="max-w-md w-full space-y-6 text-center">
                {/* Sonar Pulse Animation */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <motion.div
                    className="absolute w-24 h-24 rounded-full border border-blue-500/30 bg-blue-500/5"
                    animate={{ scale: [0.8, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                  />
                  <motion.div
                    className="absolute w-16 h-16 rounded-full border border-blue-400/40 bg-blue-500/10"
                    animate={{ scale: [0.9, 1.3], opacity: [1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                  />
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-500 flex items-center justify-center shadow-lg">
                    <Compass className="w-6 h-6 text-blue-500 animate-spin-slow" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block font-mono">
                    Guidely GPS Router
                  </span>
                  <h3 className="text-base font-extrabold text-text-primary tracking-tight">
                    Updating your route...
                  </h3>
                  <p className="text-xs text-text-secondary h-4 font-medium">
                    {reroutingStage}
                  </p>
                </div>

                {/* Calming progress Bar */}
                <div className="w-full bg-bg-surface border border-border-primary h-2 rounded-full overflow-hidden p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    style={{ width: `${reroutingProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NODE INSPECTOR DRAWER (DESKTOP) */}
        <AnimatePresence>
          {!isMobile && activeInspectorNode && (
            <motion.div
              id="node-inspector-drawer"
              initial={{ x: "100%", opacity: 0.95 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-bg-surface border-l border-border-primary shadow-2xl z-40 flex flex-col h-full font-sans overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-border-primary/60 flex items-center justify-between bg-bg-sidebar/80 shrink-0">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Concept Details
                  </span>
                </div>
                <button 
                  onClick={() => selectNode(null)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-app hover:bg-bg-sidebar border border-border-primary rounded-lg cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
                
                {/* Title & Status Block */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider font-bold ${
                      activeInspectorNode.status === "mastered" ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400" :
                      activeInspectorNode.status === "active" ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400" :
                      activeInspectorNode.status === "missing" ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400" :
                      "bg-bg-app border-border-primary text-text-secondary"
                    }`}>
                      Status: {activeInspectorNode.status}
                    </span>
                    <span className="bg-bg-app border border-border-primary px-2 py-0.5 rounded text-[9px] font-mono text-text-muted font-bold">
                      ~{activeInspectorNode.estimatedHours} Hours Required
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-extrabold text-text-primary tracking-tight leading-tight">
                    {activeInspectorNode.label}
                  </h2>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    {activeInspectorNode.description}
                  </p>
                </div>

                {/* WHY THIS MATTERS */}
                <div className="space-y-2 border-l-2 border-blue-500/40 pl-3 py-0.5">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Why This Matters
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed italic">
                    "{activeInspectorNode.whyMatters || "This concept represents a key milestone on your personalized learning route."}"
                  </p>
                </div>

                {/* STUDY GPS RECOMMENDATION REASON */}
                <div className="bg-bg-app border border-border-primary/80 p-4 rounded-xl space-y-1.5">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    Our Recommendation
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans">
                    {activeInspectorNode.whyRecommended || "Recommended based on your personalized learning goal."}
                  </p>
                </div>

                {/* CURATED LEARNING RESOURCES */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center">
                    <Layers className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                    Curated Learning Resources
                  </h4>
                  <div className="space-y-2.5">
                    {activeResources.length === 0 ? (
                      <span className="text-xs text-text-muted italic">See below for practice activities and projects.</span>
                    ) : (
                      activeResources.map((resource) => {
                        const preferenceBadge = getResourcePreferenceBadge(resource.type);
                        return (
                          <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onPointerDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="block p-3.5 bg-bg-app border border-border-primary/80 hover:border-blue-500/40 rounded-xl group transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                {resource.type === "video" ? (
                                  <Video className="w-4 h-4 text-pink-500 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                )}
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                                  {resource.title}
                                </span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-blue-500 transition-colors shrink-0 ml-1" />
                            </div>
                            <p className="text-[11px] text-text-muted mt-1 leading-snug font-sans">{resource.description}</p>
                            <div className="flex items-center justify-between text-[9px] font-mono text-text-muted mt-2.5 pt-2 border-t border-border-primary/30">
                              <span>Provider: {resource.provider}</span>
                              <div className="flex items-center space-x-1">
                                <span className="capitalize">{resource.type}</span>
                                {preferenceBadge && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-1.5 rounded font-bold">
                                      {preferenceBadge}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </a>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* PRACTICE TASK */}
                {activeInspectorNode.practiceTask && (
                  <div className="bg-bg-app border border-border-primary p-4 rounded-xl space-y-2">
                    <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center">
                      <Zap className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                      Practical Challenge
                    </h4>
                    <p className="text-xs text-text-secondary font-mono bg-bg-surface p-3.5 border border-border-primary rounded-lg select-text leading-relaxed">
                      {activeInspectorNode.practiceTask}
                    </p>
                  </div>
                )}

                {/* CONCEPT PROJECT RECOMMENDATION */}
                {activeInspectorNode.project && (
                  <div className="border border-border-primary bg-bg-app p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Project Match</span>
                      <span className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                        {activeInspectorNode.project.difficulty}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 leading-snug">
                        <Award className="w-4 h-4 text-yellow-500" />
                        {activeInspectorNode.project.title}
                      </h4>
                      <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed font-sans">
                        {activeInspectorNode.project.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {activeInspectorNode.project.skills.map((skill, index) => (
                        <span key={index} className="bg-bg-surface border border-border-primary text-text-muted text-[8px] font-mono px-1.5 py-0.2 rounded font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Actions Footer */}
              <div className="p-4 bg-bg-sidebar border-t border-border-primary/60 z-10 space-y-3 shrink-0">
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-sans flex flex-col gap-1">
                    <span className="font-bold font-mono text-[10px] uppercase tracking-wider">SYSTEM ERROR</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {activeInspectorNode.status === "mastered" ? (
                  <div className="w-full bg-emerald-50 dark:bg-[#06120e] border border-emerald-500/30 p-3 rounded-xl flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>CONCEPT MASTERED</span>
                  </div>
                ) : activeInspectorNode.status === "locked" ? (
                  <div className="w-full bg-bg-app border border-border-primary/60 p-3 rounded-xl flex items-center justify-center space-x-2 text-text-muted text-xs">
                    <Lock className="w-4 h-4 text-text-muted opacity-50" />
                    <span>Locked: Complete prerequisites first</span>
                  </div>
                ) : (
                  <button
                    id="btn-mark-complete"
                    onClick={() => handleCompleteNode(activeInspectorNode.id)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Mark Concept Complete</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONCEPT DETAILS MOBILE BOTTOM SHEET */}
        <AnimatePresence>
          {isMobile && activeInspectorNode && typeof document !== "undefined" && createPortal(
            <motion.div
              key="mobile-concept-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 w-full max-w-full h-[62dvh] max-h-[85dvh] bg-bg-surface border-t border-border-primary shadow-2xl z-[100] flex flex-col font-sans rounded-t-3xl overflow-hidden pointer-events-auto"
            >
              {/* Premium Mobile Bottom Sheet Drag Handle */}
              <div className="w-12 h-1 bg-text-muted/30 rounded-full mx-auto my-2.5 shrink-0" />

              {/* Drawer Header */}
              <div className="p-4 pt-1.5 border-b border-border-primary/60 flex items-center justify-between bg-bg-sidebar/80 shrink-0">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">
                    Concept Details
                  </span>
                </div>
                <button 
                  onClick={() => selectNode(null)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="p-1.5 text-text-secondary hover:text-text-primary bg-bg-app hover:bg-bg-sidebar border border-border-primary rounded-lg cursor-pointer transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 pb-8 space-y-5 text-left min-w-0 break-words">
                
                {/* Title & Status Block */}
                <div className="space-y-3 min-w-0 break-words">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded border text-[9px] font-mono uppercase tracking-wider font-bold ${
                      activeInspectorNode.status === "mastered" ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400" :
                      activeInspectorNode.status === "active" ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400" :
                      activeInspectorNode.status === "missing" ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400" :
                      "bg-bg-app border-border-primary text-text-secondary"
                    }`}>
                      Status: {activeInspectorNode.status}
                    </span>
                    <span className="bg-bg-app border border-border-primary px-2 py-0.5 rounded text-[9px] font-mono text-text-muted font-bold">
                      ~{activeInspectorNode.estimatedHours} Hours Required
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-text-primary tracking-tight leading-tight min-w-0 break-words">
                    {activeInspectorNode.label}
                  </h2>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans min-w-0 break-words">
                    {activeInspectorNode.description}
                  </p>
                </div>

                {/* WHY THIS MATTERS */}
                <div className="space-y-2 border-l-2 border-blue-500/40 pl-3 py-0.5 min-w-0 break-words">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Why This Matters
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed italic min-w-0 break-words">
                    "{activeInspectorNode.whyMatters || "This concept represents a key milestone on your personalized learning route."}"
                  </p>
                </div>

                {/* STUDY GPS RECOMMENDATION REASON */}
                <div className="bg-bg-app border border-border-primary/80 p-4 rounded-xl space-y-1.5 min-w-0 break-words">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                    Our Recommendation
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-sans min-w-0 break-words">
                    {activeInspectorNode.whyRecommended || "Recommended based on your personalized learning goal."}
                  </p>
                </div>

                {/* CURATED LEARNING RESOURCES */}
                <div className="space-y-3 min-w-0 break-words">
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center">
                    <Layers className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                    Curated Learning Resources
                  </h4>
                  <div className="space-y-2.5">
                    {activeResources.length === 0 ? (
                      <span className="text-xs text-text-muted italic">See below for practice activities and projects.</span>
                    ) : (
                      activeResources.map((resource) => {
                        const preferenceBadge = getResourcePreferenceBadge(resource.type);
                        return (
                          <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onPointerDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            className="block p-3.5 bg-bg-app border border-border-primary/80 hover:border-blue-500/40 rounded-xl group transition-all"
                          >
                            <div className="flex items-start justify-between min-w-0 gap-2">
                              <div className="flex items-center space-x-2 min-w-0">
                                {resource.type === "video" ? (
                                  <Video className="w-4 h-4 text-pink-500 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                )}
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug truncate">
                                  {resource.title}
                                </span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-text-muted group-hover:text-blue-500 transition-colors shrink-0 shrink-0 ml-1" />
                            </div>
                            <p className="text-[11px] text-text-muted mt-1 leading-snug font-sans min-w-0 break-words">{resource.description}</p>
                            <div className="flex items-center justify-between text-[9px] font-mono text-text-muted mt-2.5 pt-2 border-t border-border-primary/30">
                              <span>Provider: {resource.provider}</span>
                              <div className="flex items-center space-x-1">
                                <span className="capitalize">{resource.type}</span>
                                {preferenceBadge && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-1.5 rounded font-bold">
                                      {preferenceBadge}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </a>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* PRACTICE TASK */}
                {activeInspectorNode.practiceTask && (
                  <div className="bg-bg-app border border-border-primary p-4 rounded-xl space-y-2 min-w-0 break-words">
                    <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center">
                      <Zap className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                      Practical Challenge
                    </h4>
                    <p className="text-xs text-text-secondary font-mono bg-bg-surface p-3.5 border border-border-primary rounded-lg select-text leading-relaxed">
                      {activeInspectorNode.practiceTask}
                    </p>
                  </div>
                )}

                {/* CONCEPT PROJECT RECOMMENDATION */}
                {activeInspectorNode.project && (
                  <div className="border border-border-primary bg-bg-app p-4 rounded-xl space-y-3 min-w-0 break-words">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Project Match</span>
                      <span className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                        {activeInspectorNode.project.difficulty}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5 leading-snug min-w-0 break-words">
                        <Award className="w-4 h-4 text-yellow-500" />
                        {activeInspectorNode.project.title}
                      </h4>
                      <p className="text-[11px] text-text-secondary mt-1.5 leading-relaxed font-sans min-w-0 break-words">
                        {activeInspectorNode.project.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {activeInspectorNode.project.skills.map((skill, index) => (
                        <span key={index} className="bg-bg-surface border border-border-primary text-text-muted text-[8px] font-mono px-1.5 py-0.2 rounded font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Actions Footer */}
              <div className="p-4 bg-bg-sidebar border-t border-border-primary/60 z-10 space-y-3 shrink-0">
                {errorMsg && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-sans flex flex-col gap-1">
                    <span className="font-bold font-mono text-[10px] uppercase tracking-wider">SYSTEM ERROR</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {activeInspectorNode.status === "mastered" ? (
                  <div className="w-full bg-emerald-50 dark:bg-[#06120e] border border-emerald-500/30 p-3 rounded-xl flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>CONCEPT MASTERED</span>
                  </div>
                ) : activeInspectorNode.status === "locked" ? (
                  <div className="w-full bg-bg-app border border-border-primary/60 p-3 rounded-xl flex items-center justify-center space-x-2 text-text-muted text-xs">
                    <Lock className="w-4 h-4 text-text-muted opacity-50" />
                    <span>Locked: Complete prerequisites first</span>
                  </div>
                ) : (
                  <button
                    id="btn-mark-complete-mobile"
                    onClick={() => handleCompleteNode(activeInspectorNode.id)}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer transition-all uppercase tracking-wider flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Mark Concept Complete</span>
                  </button>
                )}
              </div>
            </motion.div>,
            document.body
          )}
        </AnimatePresence>

        {/* MOBILE LEGEND MODAL OVERLAY */}
        <AnimatePresence>
          {showLegendModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowLegendModal(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-bg-surface border border-border-primary rounded-2xl p-5 shadow-2xl max-w-xs w-full font-sans text-left space-y-4"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-blue-500 animate-spin-slow" />
                    <span>Map Legend</span>
                  </span>
                  <button 
                    onClick={() => setShowLegendModal(false)}
                    className="p-1 text-text-muted hover:text-text-primary hover:bg-bg-sidebar border border-border-primary/80 rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs font-mono text-text-secondary pt-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-400 shrink-0" />
                    <span className="font-semibold text-text-primary">Mastered</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight font-sans pl-6">
                    Concepts you have already acquired and proven skill mastery.
                  </p>

                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-blue-400 animate-pulse shrink-0" />
                    <span className="font-semibold text-text-primary">Active Step</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight font-sans pl-6">
                    Your current targeted learning objective. Study this next!
                  </p>

                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-bg-sidebar border border-border-primary shrink-0" />
                    <span className="font-semibold text-text-primary">Available</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight font-sans pl-6">
                    Unlocked concepts. You have mastered all of their pre-requisites.
                  </p>

                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-400 shrink-0" />
                    <span className="font-semibold text-text-primary">Missing Gap</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight font-sans pl-6">
                    Skill gaps detected from onboarding quiz answers.
                  </p>

                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-bg-app border border-border-primary/80 flex items-center justify-center shrink-0">
                      <Lock className="w-2 h-2 text-text-muted" />
                    </span>
                    <span className="font-semibold text-text-primary">Locked</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-tight font-sans pl-6">
                    Prerequisites are not met yet. Master previous steps to unlock.
                  </p>
                </div>

                <button
                  onClick={() => setShowLegendModal(false)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* GUIDELY LOGO — LEAVE WORKSPACE CONFIRMATION MODAL */}
        <AnimatePresence>
          {showLogoConfirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowLogoConfirmModal(false)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-bg-surface border border-border-primary rounded-2xl p-5 shadow-2xl max-w-sm w-full font-sans text-left space-y-4"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <div>
                  <h3 className="text-sm font-bold text-text-primary tracking-tight">
                    Leave your learning route?
                  </h3>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                    Your learning progress is saved. You can return to this route later.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row-reverse items-stretch sm:items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowLogoConfirmModal(false)}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Stay Here
                  </button>
                  <button
                    onClick={leaveWorkspaceToHome}
                    className="flex-1 py-2.5 px-4 bg-bg-app border border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-sidebar font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                  >
                    Go to Home
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>

  </div>
);
};
