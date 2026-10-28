/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  Network, 
  Activity, 
  Radio, 
  Zap, 
  RotateCcw, 
  Play, 
  Pause, 
  Wifi, 
  WifiOff, 
  Cpu, 
  Sparkles,
  Maximize2,
  Filter,
  ShieldAlert,
  Layers,
  Crosshair
} from 'lucide-react';

export interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  role: 'c2' | 'relay' | 'gateway' | 'beacon' | 'sensor' | 'firewall';
  ip: string;
  status: 'online' | 'degraded' | 'syncing' | 'isolated';
  latency: number; // ms
  throughput: number; // Mbps
  loss: number; // %
  cipher: string;
  uptime: string;
  packetsReceived: number;
  packetsSent: number;
  description: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  bandwidth: string;
  latency: number;
  quality: number; // 0 - 100%
  protocol: 'PQC/KYBER' | 'AES-256-GCM' | 'TLS-1.3' | 'SIGINT-ECHO';
}

interface Packet {
  id: number;
  sourceId: string;
  targetId: string;
  progress: number; // 0 to 1
  speed: number;
  type: 'telemetry' | 'command' | 'crypto' | 'alert' | 'echo';
  sizeBytes: number;
}

interface NetworkTopologyGraphProps {
  addLog?: (msg: string, type?: any) => void;
  onSelectNode?: (node: NetworkNode | null) => void;
}

const INITIAL_NODES: NetworkNode[] = [
  {
    id: 'c2-apex',
    label: 'C2 APEX TERMINAL',
    role: 'c2',
    ip: '10.0.0.1 (CORE)',
    status: 'online',
    latency: 1,
    throughput: 12500,
    loss: 0.0,
    cipher: 'Kyber-1024 / Dilithium-3',
    uptime: '142h 19m',
    packetsReceived: 894210,
    packetsSent: 948210,
    description: 'Central Tactical Command & Vector Beam Orchestration Root'
  },
  {
    id: 'crystal-alpha',
    label: 'CRYSTAL-GATEWAY-ALPHA',
    role: 'gateway',
    ip: '172.16.88.4',
    status: 'online',
    latency: 22,
    throughput: 2400,
    loss: 0.01,
    cipher: 'Emerald Phase Lattice [1420.44 MHz]',
    uptime: '96h 44m',
    packetsReceived: 241904,
    packetsSent: 231190,
    description: 'Trans-Orbital Resonance Cell & Quantum State Synchronizer'
  },
  {
    id: 'sat-nord-6',
    label: 'SAT-ORBITAL // NORD-6',
    role: 'relay',
    ip: '198.51.100.42',
    status: 'online',
    latency: 350,
    throughput: 850,
    loss: 0.12,
    cipher: 'AES-256-GCM / Ephemeral DH',
    uptime: '720h 12m',
    packetsReceived: 452102,
    packetsSent: 489110,
    description: 'Polar Orbital Micro-Satellite Relay Cluster #06'
  },
  {
    id: 'canary-sigint',
    label: 'CANARY-SENSOR // SIGINT',
    role: 'sensor',
    ip: '10.24.110.9',
    status: 'online',
    latency: 38,
    throughput: 420,
    loss: 0.04,
    cipher: 'ChaCha20-Poly1305',
    uptime: '38h 12m',
    packetsReceived: 104291,
    packetsSent: 198024,
    description: 'Passive RF Reconnaissance & Trans-Carrier Interceptor'
  },
  {
    id: 'field-echo-4',
    label: 'FIELD-BEACON // ECHO-4',
    role: 'beacon',
    ip: '10.88.14.77',
    status: 'degraded',
    latency: 184,
    throughput: 95,
    loss: 2.14,
    cipher: 'Kyber-768 Hybrid',
    uptime: '14h 03m',
    packetsReceived: 48210,
    packetsSent: 46104,
    description: 'Forward Tactical Recon Unit under Crys-Acoustic Jitter'
  },
  {
    id: 'proxy-vector-9',
    label: 'TRANS-VECTOR // PROXY-9',
    role: 'gateway',
    ip: '2001:db8::apex:99',
    status: 'online',
    latency: 45,
    throughput: 4800,
    loss: 0.02,
    cipher: 'TLS 1.3 / Post-Quantum ECDHE',
    uptime: '180h 50m',
    packetsReceived: 671290,
    packetsSent: 659800,
    description: 'IPv6 BGP Secure Edge Anycast Router'
  },
  {
    id: 'black-ice-fw',
    label: 'BLACK-ICE // APEX-FW',
    role: 'firewall',
    ip: '10.0.0.254',
    status: 'online',
    latency: 4,
    throughput: 9800,
    loss: 0.0,
    cipher: 'Hardware HSM Root-of-Trust',
    uptime: '142h 19m',
    packetsReceived: 1420914,
    packetsSent: 30120,
    description: 'Intrusion Countermeasure Electronics & Zero-Trust Gate'
  },
  {
    id: 'deep-telemetry',
    label: 'TELEMETRY-INGEST // NODE-8',
    role: 'sensor',
    ip: '10.55.99.12',
    status: 'syncing',
    latency: 68,
    throughput: 620,
    loss: 0.08,
    cipher: 'AES-256-GCM',
    uptime: '28h 45m',
    packetsReceived: 190412,
    packetsSent: 184200,
    description: 'Kernel Syslog & Kernel Ring Buffer Stream Telemetry Consumer'
  }
];

const INITIAL_LINKS: NetworkLink[] = [
  { id: 'l1', source: 'c2-apex', target: 'crystal-alpha', bandwidth: '2.4 Gbps', latency: 22, quality: 99, protocol: 'PQC/KYBER' },
  { id: 'l2', source: 'c2-apex', target: 'sat-nord-6', bandwidth: '850 Mbps', latency: 350, quality: 92, protocol: 'AES-256-GCM' },
  { id: 'l3', source: 'c2-apex', target: 'black-ice-fw', bandwidth: '10 Gbps', latency: 4, quality: 100, protocol: 'TLS-1.3' },
  { id: 'l4', source: 'c2-apex', target: 'proxy-vector-9', bandwidth: '4.8 Gbps', latency: 45, quality: 98, protocol: 'TLS-1.3' },
  { id: 'l5', source: 'c2-apex', target: 'deep-telemetry', bandwidth: '1 Gbps', latency: 68, quality: 96, protocol: 'AES-256-GCM' },
  { id: 'l6', source: 'crystal-alpha', target: 'field-echo-4', bandwidth: '100 Mbps', latency: 184, quality: 84, protocol: 'SIGINT-ECHO' },
  { id: 'l7', source: 'sat-nord-6', target: 'canary-sigint', bandwidth: '420 Mbps', latency: 98, quality: 94, protocol: 'SIGINT-ECHO' },
  { id: 'l8', source: 'proxy-vector-9', target: 'canary-sigint', bandwidth: '1.2 Gbps', latency: 42, quality: 97, protocol: 'PQC/KYBER' },
  { id: 'l9', source: 'black-ice-fw', target: 'proxy-vector-9', bandwidth: '8 Gbps', latency: 6, quality: 99, protocol: 'TLS-1.3' }
];

export default function NetworkTopologyGraph({ addLog, onSelectNode }: NetworkTopologyGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [nodes, setNodes] = useState<NetworkNode[]>(() => JSON.parse(JSON.stringify(INITIAL_NODES)));
  const [links] = useState<NetworkLink[]>(() => JSON.parse(JSON.stringify(INITIAL_LINKS)));
  const [selectedNodeId, setSelectedNodeId] = useState<string>('c2-apex');
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [flowRate, setFlowRate] = useState<'normal' | 'burst' | 'stealth'>('normal');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [packetBurstCount, setPacketBurstCount] = useState<number>(0);
  const [livePacketsTransferred, setLivePacketsTransferred] = useState<number>(1420);

  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const packetsRef = useRef<Packet[]>([]);
  const packetIdGenRef = useRef<number>(1);
  const animFrameRef = useRef<number | null>(null);
  const nodesStateRef = useRef<NetworkNode[]>(nodes);

  // Keep nodesStateRef in sync with nodes for animation loop
  useEffect(() => {
    nodesStateRef.current = nodes;
  }, [nodes]);

  const selectedNode = useMemo(() => {
    return nodes.find(n => n.id === selectedNodeId) || nodes[0];
  }, [nodes, selectedNodeId]);

  // Notify parent of selected node
  useEffect(() => {
    if (onSelectNode && selectedNode) {
      onSelectNode(selectedNode);
    }
  }, [selectedNode, onSelectNode]);

  // D3 Force Simulation setup
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 560;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Setup defs (Glow filters, gradients, markers)
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'neon-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Subtle line glow
    const lineFilter = defs.append('filter')
      .attr('id', 'line-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    lineFilter.append('feGaussianBlur')
      .attr('stdDeviation', '2')
      .attr('result', 'blur');
    const lineMerge = lineFilter.append('feMerge');
    lineMerge.append('feMergeNode').attr('in', 'blur');
    lineMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Root group for pan/zoom
    const g = svg.append('g').attr('class', 'network-root');
    gRef.current = g;

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 3.5])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial simulation data
    const simNodes = nodes.map(n => ({ ...n }));
    const simLinks = links.map(l => ({ ...l }));

    const sim = d3.forceSimulation<NetworkNode, NetworkLink>(simNodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(simLinks).id(d => d.id).distance(140).strength(0.7))
      .force('charge', d3.forceManyBody().strength(-480))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(45).iterations(2));

    simulationRef.current = sim;

    // Pin C2 initially near center
    const c2 = simNodes.find(n => n.id === 'c2-apex');
    if (c2) {
      c2.fx = width / 2;
      c2.fy = height / 2;
    }

    // Draw background grid lines inside zoom group
    const grid = g.append('g').attr('class', 'grid-layer').attr('opacity', 0.12);
    for (let x = -width; x < width * 2; x += 60) {
      grid.append('line').attr('x1', x).attr('y1', -height).attr('x2', x).attr('y2', height * 2).attr('stroke', '#00ff41').attr('stroke-width', 0.5);
    }
    for (let y = -height; y < height * 2; y += 60) {
      grid.append('line').attr('x1', -width).attr('y1', y).attr('x2', width * 2).attr('y2', y).attr('stroke', '#00ff41').attr('stroke-width', 0.5);
    }

    // Links container
    const linkGroup = g.append('g').attr('class', 'links-layer');
    const linkLines = linkGroup.selectAll<SVGLineElement, NetworkLink>('.link-line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('class', 'link-line')
      .attr('stroke', d => {
        if (d.protocol === 'PQC/KYBER') return '#00ff41';
        if (d.protocol === 'SIGINT-ECHO') return '#06b6d4';
        if (d.protocol === 'TLS-1.3') return '#3b82f6';
        return '#10b981';
      })
      .attr('stroke-width', d => Math.max(1.2, (d.quality / 100) * 2.2))
      .attr('stroke-opacity', 0.45)
      .attr('stroke-dasharray', d => d.quality < 90 ? '4 3' : 'none');

    // Link label
    const linkLabels = linkGroup.selectAll<SVGTextElement, NetworkLink>('.link-label')
      .data(simLinks)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('fill', '#6b7280')
      .attr('text-anchor', 'middle')
      .text(d => `${d.latency}ms`);

    // Packets layer
    const packetGroup = g.append('g').attr('class', 'packets-layer');

    // Nodes container
    const nodeGroup = g.append('g').attr('class', 'nodes-layer');

    // Drag behavior
    const drag = d3.drag<SVGGElement, NetworkNode>()
      .on('start', (event, d) => {
        if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0);
        if (d.id !== 'c2-apex') {
          d.fx = null;
          d.fy = null;
        }
      });

    // Create node group items
    const nodeItems = nodeGroup.selectAll<SVGGElement, NetworkNode>('.node-item')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(drag)
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNodeId(d.id);
        if (addLog) {
          addLog(`[TOPOLOGY] Selected node ${d.label} (${d.ip}) - Latency: ${d.latency}ms`, 'info');
        }
      });

    // Outer pulsing radar circle for C2
    nodeItems.filter(d => d.role === 'c2')
      .append('circle')
      .attr('r', 32)
      .attr('fill', 'none')
      .attr('stroke', '#00ff41')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.25)
      .attr('stroke-dasharray', '3 3')
      .append('animateTransform')
      .attr('attributeName', 'transform')
      .attr('type', 'rotate')
      .attr('from', '0')
      .attr('to', '360')
      .attr('dur', '14s')
      .attr('repeatCount', 'indefinite');

    // Node outer boundary (circle)
    nodeItems.append('circle')
      .attr('class', 'node-outer-circle')
      .attr('r', d => d.role === 'c2' ? 24 : d.role === 'gateway' ? 18 : 15)
      .attr('fill', d => {
        if (d.id === selectedNodeId) return '#052e16';
        if (d.status === 'degraded') return '#2a1a05';
        if (d.status === 'syncing') return '#042f2e';
        if (d.status === 'isolated') return '#260606';
        return '#020617';
      })
      .attr('stroke', d => {
        if (d.id === selectedNodeId) return '#00ff41';
        if (d.status === 'degraded') return '#eab308';
        if (d.status === 'syncing') return '#06b6d4';
        if (d.status === 'isolated') return '#ef4444';
        if (d.role === 'c2') return '#00ff41';
        if (d.role === 'firewall') return '#ef4444';
        return '#22c55e';
      })
      .attr('stroke-width', d => d.id === selectedNodeId ? 2.5 : 1.5)
      .attr('filter', d => d.id === selectedNodeId ? 'url(#neon-glow)' : 'none');

    // Node inner icon/dot
    nodeItems.append('circle')
      .attr('class', 'node-inner-dot')
      .attr('r', d => d.role === 'c2' ? 6 : 4)
      .attr('fill', d => {
        if (d.status === 'isolated') return '#ef4444';
        if (d.status === 'degraded') return '#eab308';
        if (d.status === 'syncing') return '#06b6d4';
        if (d.role === 'firewall') return '#ef4444';
        return '#00ff41';
      });

    // Node Label
    nodeItems.append('text')
      .attr('class', 'node-title-text')
      .attr('y', d => d.role === 'c2' ? 36 : 28)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '0.5px')
      .attr('fill', d => d.id === selectedNodeId ? '#00ff41' : '#e5e7eb')
      .text(d => d.label.split(' // ')[0].replace('-TERMINAL', ''));

    // Node IP subtitle
    nodeItems.append('text')
      .attr('class', 'node-ip-text')
      .attr('y', d => d.role === 'c2' ? 46 : 37)
      .attr('text-anchor', 'middle')
      .attr('font-size', '7.5px')
      .attr('font-family', 'monospace')
      .attr('fill', '#6b7280')
      .text(d => d.ip);

    // Ticking force simulation
    sim.on('tick', () => {
      linkLines
        .attr('x1', d => ((d.source as NetworkNode).x || 0))
        .attr('y1', d => ((d.source as NetworkNode).y || 0))
        .attr('x2', d => ((d.target as NetworkNode).x || 0))
        .attr('y2', d => ((d.target as NetworkNode).y || 0));

      linkLabels
        .attr('x', d => (((d.source as NetworkNode).x || 0) + ((d.target as NetworkNode).x || 0)) / 2)
        .attr('y', d => (((d.source as NetworkNode).y || 0) + ((d.target as NetworkNode).y || 0)) / 2 - 4);

      nodeItems.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Seed initial packet queue
    const seedPackets = () => {
      const generated: Packet[] = [];
      simLinks.forEach((link, idx) => {
        const srcId = typeof link.source === 'string' ? link.source : link.source.id;
        const tgtId = typeof link.target === 'string' ? link.target : link.target.id;
        generated.push({
          id: packetIdGenRef.current++,
          sourceId: srcId,
          targetId: tgtId,
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          type: idx % 2 === 0 ? 'telemetry' : 'crypto',
          sizeBytes: Math.floor(Math.random() * 1024) + 128
        });
      });
      packetsRef.current = generated;
    };
    seedPackets();

    // Continuous packet flow animation loop
    const animatePackets = () => {
      const speedMultiplier = flowRate === 'burst' ? 2.2 : flowRate === 'stealth' ? 0.5 : 1.0;
      const currentLiveNodes = nodesStateRef.current;
      
      // Update packet positions
      const updatedPackets = packetsRef.current.map(pkt => {
        const sNode = currentLiveNodes.find(n => n.id === pkt.sourceId);
        const tNode = currentLiveNodes.find(n => n.id === pkt.targetId);

        // If either endpoint is isolated, freeze packet movement
        if (sNode?.status === 'isolated' || tNode?.status === 'isolated') {
          return {
            ...pkt,
            type: 'alert' as const,
            progress: 0.5
          };
        }

        let nextProg = pkt.progress + pkt.speed * speedMultiplier;
        if (nextProg >= 1) {
          nextProg = 0;
          setLivePacketsTransferred(c => c + 1);
        }
        return {
          ...pkt,
          progress: nextProg
        };
      });

      packetsRef.current = updatedPackets;

      // Render packet particles in SVG
      const packetSelection = packetGroup.selectAll<SVGCircleElement, Packet>('.packet-particle')
        .data(updatedPackets, d => d.id.toString());

      packetSelection.enter()
        .append('circle')
        .attr('class', 'packet-particle pointer-events-none')
        .attr('r', d => d.type === 'crypto' ? 2.5 : 2.0)
        .attr('filter', 'url(#line-glow)')
        .merge(packetSelection)
        .attr('fill', d => {
          if (d.type === 'crypto') return '#00ff41';
          if (d.type === 'alert') return '#ef4444';
          if (d.type === 'echo') return '#06b6d4';
          return '#38bdf8';
        })
        .attr('cx', d => {
          const sNode = simNodes.find(n => n.id === d.sourceId);
          const tNode = simNodes.find(n => n.id === d.targetId);
          if (!sNode || !tNode || sNode.x === undefined || tNode.x === undefined) return 0;
          return sNode.x + (tNode.x - sNode.x) * d.progress;
        })
        .attr('cy', d => {
          const sNode = simNodes.find(n => n.id === d.sourceId);
          const tNode = simNodes.find(n => n.id === d.targetId);
          if (!sNode || !tNode || sNode.y === undefined || tNode.y === undefined) return 0;
          return sNode.y + (tNode.y - sNode.y) * d.progress;
        });

      packetSelection.exit().remove();

      animFrameRef.current = requestAnimationFrame(animatePackets);
    };

    animFrameRef.current = requestAnimationFrame(animatePackets);

    // Responsive container resize observer
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && simulationRef.current) {
          simulationRef.current.force('center', d3.forceCenter(newW / 2, newH / 2));
          const apex = simNodes.find(n => n.id === 'c2-apex');
          if (apex) {
            apex.fx = newW / 2;
            apex.fy = newH / 2;
          }
          simulationRef.current.alpha(0.15).restart();
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (simulationRef.current) simulationRef.current.stop();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [flowRate, packetBurstCount]);

  // Reactive node styling sync: updates SVG visuals when selectedNodeId, nodes, or filterRole changes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Update node outer circles
    svg.selectAll<SVGCircleElement, NetworkNode>('.node-outer-circle')
      .transition()
      .duration(200)
      .attr('fill', d => {
        const live = nodes.find(n => n.id === d.id) || d;
        if (d.id === selectedNodeId) return '#052e16';
        if (live.status === 'isolated') return '#260606';
        if (live.status === 'degraded') return '#2a1a05';
        if (live.status === 'syncing') return '#042f2e';
        return '#020617';
      })
      .attr('stroke', d => {
        const live = nodes.find(n => n.id === d.id) || d;
        if (d.id === selectedNodeId) return '#00ff41';
        if (live.status === 'isolated') return '#ef4444';
        if (live.status === 'degraded') return '#eab308';
        if (live.status === 'syncing') return '#06b6d4';
        if (d.role === 'c2') return '#00ff41';
        if (d.role === 'firewall') return '#ef4444';
        return '#22c55e';
      })
      .attr('stroke-width', d => d.id === selectedNodeId ? 2.5 : 1.5)
      .attr('filter', d => d.id === selectedNodeId ? 'url(#neon-glow)' : 'none')
      .attr('opacity', d => {
        if (filterRole === 'all') return 1;
        return d.role === filterRole ? 1 : 0.35;
      });

    // Update node inner dots
    svg.selectAll<SVGCircleElement, NetworkNode>('.node-inner-dot')
      .transition()
      .duration(200)
      .attr('fill', d => {
        const live = nodes.find(n => n.id === d.id) || d;
        if (live.status === 'isolated') return '#ef4444';
        if (live.status === 'degraded') return '#eab308';
        if (live.status === 'syncing') return '#06b6d4';
        if (d.role === 'firewall') return '#ef4444';
        return '#00ff41';
      });

    // Update node text labels
    svg.selectAll<SVGTextElement, NetworkNode>('.node-title-text')
      .attr('fill', d => d.id === selectedNodeId ? '#00ff41' : '#e5e7eb')
      .attr('opacity', d => {
        if (filterRole === 'all') return 1;
        return d.role === filterRole ? 1 : 0.35;
      });

    // Update links connected to isolated nodes
    svg.selectAll<SVGLineElement, NetworkLink>('.link-line')
      .transition()
      .duration(200)
      .attr('stroke-opacity', d => {
        const srcId = typeof d.source === 'string' ? d.source : (d.source as NetworkNode).id;
        const tgtId = typeof d.target === 'string' ? d.target : (d.target as NetworkNode).id;
        const srcNode = nodes.find(n => n.id === srcId);
        const tgtNode = nodes.find(n => n.id === tgtId);
        if (srcNode?.status === 'isolated' || tgtNode?.status === 'isolated') {
          return 0.15;
        }
        return 0.45;
      })
      .attr('stroke-dasharray', d => {
        const srcId = typeof d.source === 'string' ? d.source : (d.source as NetworkNode).id;
        const tgtId = typeof d.target === 'string' ? d.target : (d.target as NetworkNode).id;
        const srcNode = nodes.find(n => n.id === srcId);
        const tgtNode = nodes.find(n => n.id === tgtId);
        if (srcNode?.status === 'isolated' || tgtNode?.status === 'isolated') {
          return '2 4';
        }
        return d.quality < 90 ? '4 3' : 'none';
      });
  }, [selectedNodeId, nodes, filterRole]);

  // Handle Burst Packets
  const triggerPacketBurst = () => {
    if (addLog) {
      addLog(`[TACTICAL] Injecting high-frequency packet burst across all ${links.length} active links`, 'info');
    }
    const newPackets: Packet[] = [];
    links.forEach(link => {
      const srcId = typeof link.source === 'string' ? link.source : (link.source as NetworkNode).id;
      const tgtId = typeof link.target === 'string' ? link.target : (link.target as NetworkNode).id;
      for (let i = 0; i < 3; i++) {
        newPackets.push({
          id: packetIdGenRef.current++,
          sourceId: Math.random() > 0.5 ? srcId : tgtId,
          targetId: Math.random() > 0.5 ? tgtId : srcId,
          progress: Math.random() * 0.2,
          speed: 0.008 + Math.random() * 0.008,
          type: Math.random() > 0.5 ? 'crypto' : 'echo',
          sizeBytes: 2048
        });
      }
    });
    packetsRef.current = [...packetsRef.current, ...newPackets].slice(-50);
    setPacketBurstCount(c => c + 1);
  };

  // Reheat physics
  const restartSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.8).restart();
      if (addLog) addLog('[D3] Re-heating force layout physics & relaxing constraints', 'info');
    }
  };

  // Reset zoom & center camera on C2
  const resetCamera = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(600).call(
      zoomBehaviorRef.current.transform,
      d3.zoomIdentity
    );
    if (addLog) addLog('[D3 CAMERA] Viewport reset to origin (1.0x scale)', 'info');
  }, [addLog]);

  // Toggle play/pause simulation physics
  const toggleSimulation = () => {
    if (!simulationRef.current) return;
    if (simulationRunning) {
      simulationRef.current.stop();
      setSimulationRunning(false);
      if (addLog) addLog('[D3] Simulation physics frozen', 'warning');
    } else {
      simulationRef.current.restart();
      setSimulationRunning(true);
      if (addLog) addLog('[D3] Simulation physics resumed', 'info');
    }
  };

  // Ping Selected Node
  const handlePingNode = () => {
    if (!selectedNode) return;
    const roundTrip = Math.round(selectedNode.latency * (0.9 + Math.random() * 0.2));
    if (addLog) {
      addLog(`[ICMP ECHO] PING ${selectedNode.label} (${selectedNode.ip}): 64 bytes, seq=1, time=${roundTrip}ms, ttl=64`, 'info');
    }
    triggerPacketBurst();
  };

  // Toggle Isolate Node
  const handleToggleIsolate = () => {
    if (!selectedNode || selectedNode.id === 'c2-apex') return;
    setNodes(prev => prev.map(n => {
      if (n.id === selectedNode.id) {
        const nextStatus = n.status === 'isolated' ? 'online' : 'isolated';
        if (addLog) {
          addLog(`[STATE TRANSITION] Node ${n.label} set to ${nextStatus.toUpperCase()}`, nextStatus === 'isolated' ? 'error' : 'info');
        }
        return { ...n, status: nextStatus };
      }
      return n;
    }));
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Tactical Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-ghost-surface border border-ghost-border p-3 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-ghost-green animate-pulse" />
            <span className="font-bold text-white tracking-widest uppercase">C2 TACTICAL TOPOLOGY</span>
          </div>
          <span className="text-ghost-border">|</span>
          <span className="text-text-dim text-[11px]">ACTIVE NODES: <span className="text-ghost-green font-bold">{nodes.filter(n => n.status !== 'isolated').length}/{nodes.length}</span></span>
          <span className="text-ghost-border hidden sm:inline">|</span>
          <span className="text-text-dim text-[11px] hidden sm:inline">FLOWS: <span className="text-white font-bold">{links.length} LINKS</span></span>
          <span className="text-ghost-border hidden md:inline">|</span>
          <span className="text-text-dim text-[11px] hidden md:inline">PKT COUNTER: <span className="text-ghost-green font-mono">{livePacketsTransferred.toLocaleString()}</span></span>
        </div>

        {/* Graph Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Rate Selector */}
          <div className="flex items-center bg-ghost-dark border border-ghost-border text-[10px]">
            <button 
              onClick={() => setFlowRate('stealth')} 
              className={`px-2 py-1 ${flowRate === 'stealth' ? 'bg-cyan-950 text-cyan-400 font-bold' : 'text-text-dim hover:text-white'}`}
              title="Stealth Packet Flow Rate"
            >
              STEALTH
            </button>
            <button 
              onClick={() => setFlowRate('normal')} 
              className={`px-2 py-1 ${flowRate === 'normal' ? 'bg-ghost-green/20 text-ghost-green font-bold' : 'text-text-dim hover:text-white'}`}
              title="Standard Continuous Flow"
            >
              NORM
            </button>
            <button 
              onClick={() => setFlowRate('burst')} 
              className={`px-2 py-1 ${flowRate === 'burst' ? 'bg-amber-950 text-ghost-warning font-bold' : 'text-text-dim hover:text-white'}`}
              title="High Velocity Packet Influx"
            >
              BURST
            </button>
          </div>

          <button
            onClick={triggerPacketBurst}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-ghost-green/10 hover:bg-ghost-green/20 border border-ghost-green/40 text-ghost-green text-[10px] uppercase font-bold tracking-wider transition-all"
            title="Inject real-time packet pulses into the graph"
          >
            <Sparkles className="w-3 h-3" />
            <span>Burst</span>
          </button>

          <button
            onClick={resetCamera}
            className="p-1.5 bg-ghost-dark hover:bg-zinc-800 border border-ghost-border text-text-dim hover:text-white transition-colors"
            title="Center C2 & Reset View"
          >
            <Crosshair className="w-3.5 h-3.5 text-ghost-green" />
          </button>

          <button
            onClick={toggleSimulation}
            className="p-1.5 bg-ghost-dark hover:bg-zinc-800 border border-ghost-border text-text-dim hover:text-white transition-colors"
            title={simulationRunning ? "Freeze physics" : "Resume physics"}
          >
            {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-ghost-green" />}
          </button>

          <button
            onClick={restartSimulation}
            className="p-1.5 bg-ghost-dark hover:bg-zinc-800 border border-ghost-border text-text-dim hover:text-white transition-colors"
            title="Reheat layout force balance"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Role Filter Chips Bar */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-2 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-zinc-500 uppercase flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['all', 'c2', 'gateway', 'relay', 'sensor', 'beacon', 'firewall'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-2.5 py-0.5 uppercase transition-all border ${
                filterRole === role
                  ? 'bg-ghost-green/20 border-ghost-green text-ghost-green font-bold'
                  : 'bg-ghost-dark border-ghost-border text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="text-[9px] text-zinc-600 hidden sm:block">
          FORCE SIMULATION: {simulationRunning ? 'ACTIVE' : 'FROZEN'} &bull; D3 v7.9.0
        </div>
      </div>

      {/* Main Dual Area: D3 Canvas on Left (3 cols), Node Telemetry on Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[520px]">
        {/* D3 Graph Viewport */}
        <div 
          ref={containerRef} 
          className="lg:col-span-3 bg-zinc-950 border border-ghost-border relative overflow-hidden flex flex-col group min-h-[460px]"
        >
          {/* Top HUD overlay on graph */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none flex flex-col gap-1 font-mono text-[9px] text-text-dim">
            <div className="flex items-center gap-2 bg-ghost-dark/80 backdrop-blur-sm px-2.5 py-1 border border-ghost-border">
              <span className="w-2 h-2 rounded-full bg-ghost-green animate-ping" />
              <span className="text-white font-bold">D3 FORCE DIRECTED // PACKET TRACER</span>
              <span className="text-zinc-600">|</span>
              <span>DRAG TO REPOSITION // SCROLL TO ZOOM</span>
            </div>
          </div>

          {/* Protocol Legend Overlay */}
          <div className="absolute bottom-3 left-3 z-10 bg-ghost-dark/85 backdrop-blur-sm border border-ghost-border p-2.5 font-mono text-[9px] flex flex-wrap gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-[#00ff41]" />
              <span className="text-text-dim">PQC / Kyber</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-[#06b6d4]" />
              <span className="text-text-dim">SIGINT Echo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-[#3b82f6]" />
              <span className="text-text-dim">TLS 1.3</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 bg-[#10b981]" />
              <span className="text-text-dim">AES-256</span>
            </div>
          </div>

          {/* D3 Render SVG */}
          <svg 
            ref={svgRef} 
            className="w-full h-full flex-1 block select-none"
            style={{ minHeight: '440px' }}
          />
        </div>

        {/* Selected Node Telemetry & Controls Panel */}
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {/* Node Profile Header Card */}
          <div className="bg-ghost-surface border border-ghost-border p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-mono text-text-dim uppercase tracking-widest block">NODE TELEMETRY</span>
                <h3 className="font-mono text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  {selectedNode.role === 'c2' ? (
                    <Cpu className="w-4 h-4 text-ghost-green" />
                  ) : (
                    <Radio className="w-4 h-4 text-cyan-400" />
                  )}
                  {selectedNode.label}
                </h3>
              </div>
              <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold border ${
                selectedNode.status === 'online' ? 'bg-ghost-green/10 border-ghost-green text-ghost-green' :
                selectedNode.status === 'degraded' ? 'bg-amber-950/40 border-ghost-warning text-ghost-warning' :
                selectedNode.status === 'syncing' ? 'bg-cyan-950/40 border-cyan-400 text-cyan-400' :
                'bg-red-950/40 border-red-500 text-red-500'
              }`}>
                {selectedNode.status}
              </span>
            </div>

            <p className="text-[10px] font-mono text-text-dim leading-relaxed border-t border-ghost-border/40 pt-2">
              {selectedNode.description}
            </p>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
              <div className="bg-ghost-dark p-2 border border-ghost-border">
                <span className="text-zinc-500 block text-[8px] uppercase">LATENCY</span>
                <span className={`text-xs font-bold ${selectedNode.latency > 100 ? 'text-ghost-warning' : 'text-ghost-green'}`}>
                  {selectedNode.latency} ms
                </span>
              </div>
              <div className="bg-ghost-dark p-2 border border-ghost-border">
                <span className="text-zinc-500 block text-[8px] uppercase">BANDWIDTH</span>
                <span className="text-xs font-bold text-white">
                  {selectedNode.throughput >= 1000 ? `${(selectedNode.throughput / 1000).toFixed(1)} Gbps` : `${selectedNode.throughput} Mbps`}
                </span>
              </div>
              <div className="bg-ghost-dark p-2 border border-ghost-border">
                <span className="text-zinc-500 block text-[8px] uppercase">PACKET LOSS</span>
                <span className={`text-xs font-bold ${selectedNode.loss > 1 ? 'text-red-400' : 'text-zinc-300'}`}>
                  {selectedNode.loss}%
                </span>
              </div>
              <div className="bg-ghost-dark p-2 border border-ghost-border">
                <span className="text-zinc-500 block text-[8px] uppercase">UPTIME</span>
                <span className="text-xs font-bold text-white">
                  {selectedNode.uptime}
                </span>
              </div>
            </div>

            {/* Cipher & Address Specs */}
            <div className="space-y-1.5 pt-2 border-t border-ghost-border/50 text-[10px] font-mono">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">IP ADDRESS:</span>
                <span className="text-zinc-200">{selectedNode.ip}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">CIPHER:</span>
                <span className="text-ghost-green text-[9px] font-bold truncate max-w-[170px]" title={selectedNode.cipher}>
                  {selectedNode.cipher}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">PACKETS TX/RX:</span>
                <span className="text-zinc-300 text-[9px]">
                  {selectedNode.packetsSent.toLocaleString()} / {selectedNode.packetsReceived.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons for Selected Node */}
            <div className="space-y-2 pt-2 border-t border-ghost-border/50">
              <button
                onClick={handlePingNode}
                className="w-full flex items-center justify-center gap-2 py-1.5 bg-ghost-green/10 hover:bg-ghost-green/20 border border-ghost-green/50 text-ghost-green font-mono text-[10px] uppercase font-bold tracking-wider transition-all"
              >
                <Activity className="w-3 h-3" />
                <span>Transmit ICMP Ping</span>
              </button>

              {selectedNode.id !== 'c2-apex' && (
                <button
                  onClick={handleToggleIsolate}
                  className={`w-full flex items-center justify-center gap-2 py-1.5 border font-mono text-[10px] uppercase font-bold tracking-wider transition-all ${
                    selectedNode.status === 'isolated'
                      ? 'bg-ghost-green/10 border-ghost-green text-ghost-green hover:bg-ghost-green/20'
                      : 'bg-red-950/20 border-red-500/40 text-red-400 hover:bg-red-950/40'
                  }`}
                >
                  {selectedNode.status === 'isolated' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  <span>{selectedNode.status === 'isolated' ? 'Reconnect Node' : 'Isolate Quarantine'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Node Directory */}
          <div className="bg-ghost-surface border border-ghost-border p-3 space-y-2">
            <span className="text-[9px] font-mono text-text-dim uppercase tracking-widest block mb-2">NETWORK NODES ({nodes.length})</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
              {nodes.map(n => (
                <button
                  key={n.id}
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`w-full flex items-center justify-between p-2 text-left font-mono text-[9px] border transition-all ${
                    n.id === selectedNodeId
                      ? 'bg-ghost-green/15 border-ghost-green text-ghost-green font-bold'
                      : 'bg-ghost-dark border-ghost-border text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      n.status === 'online' ? 'bg-ghost-green' :
                      n.status === 'degraded' ? 'bg-amber-400' :
                      n.status === 'syncing' ? 'bg-cyan-400' : 'bg-red-500'
                    }`} />
                    <span className="truncate">{n.label.replace(' // ', ' ')}</span>
                  </div>
                  <span className="text-zinc-500 text-[8px] ml-2 shrink-0">{n.latency}ms</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
