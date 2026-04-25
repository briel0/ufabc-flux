import ReactFlow, {Background, Node, ReactFlowInstance} from 'reactflow';
import 'reactflow/dist/style.css'

import {Disciplina} from './types';

import {useState, useMemo, useEffect} from 'react';

import {createNode, createEdges} from './utils/graph/graph-factory';

import './styles/graph.css'

import './styles/index.css'

import { useGraphViewport } from './utils/graph/viewport-config';

import { Sidebar } from './components/Sidebar';

import { AboutModal } from './components/Aboutmodal';

const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD") 
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/\s+/g, "-") 
        .replace(/[^\w-]+/g, "") 
        .replace(/--+/g, "-") 
        .trim();
};

function App() {

    const [currentCourse, setCurrentCourse] = useState<string>('bacharelado-em-ciencia-e-tecnologia');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
    const [materias, setMaterias] = useState<Disciplina[]>([]);
    const {maxPerRow, initialViewport, translateExtent} = useGraphViewport(materias.length);
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    const courseMap = useMemo(
        function(){
            return new Map<string, Disciplina>(materias.map(
                function(m){
                    return [m.id, m];
                }
            ));
        },
        [materias]
    ); 

    useEffect(() => {
        async function loadCourseData() {
            if (!currentCourse) return;
            try {
                const fileName = slugify(currentCourse);
                const module = await import(`./data/${fileName}.json`);
                const loadedMaterias = module.default || module;
                setMaterias(loadedMaterias);
                setSelectedCourseIds(new Set());
                if (rfInstance) {
                    setTimeout(() => rfInstance.fitView({ duration: 800, padding: 0.1 }), 100);
                }

            } catch (error) {
                console.error(`Erro ao carregar o arquivo: ${currentCourse}`, error);
                setMaterias([]);
            } 
        }

        loadCourseData();
    }, [currentCourse, rfInstance]);

    const highlightedIds = useMemo(
        function(){
            const allHighlights = new Set<string>();
            selectedIds.forEach(
                function(id){
                    const materia = courseMap.get(id);
                    if(materia && materia.recomendacoes){
                        materia.recomendacoes.forEach(
                            function(reqId){
                                allHighlights.add(reqId);
                            }
                        );
                    }
                }
            );
            return allHighlights;
        },
        [selectedIds, courseMap]
    );

    const onNodeClick = 
        function(_event: React.MouseEvent, node: Node<Disciplina>){
            setSelectedCourseIds(
                function(prevSet){
                    const nextSet = new Set(prevSet);
                    if(nextSet.has(node.id)){
                        nextSet.delete(node.id);
                    }
                    else{
                        nextSet.add(node.id);
                 
                    }
                    return nextSet;
                }
            );
        };

    const onPaneClick =
        function(){
            setSelectedCourseIds(new Set());
        };

    const {nodes, edges} = useMemo(
        function(){

            const initialNodes = materias.map(
                function(materia, index){
                    return createNode(materia, index, selectedIds, highlightedIds, maxPerRow);
                }
            );

            const initialEdges = materias.flatMap(
                function(materia){
                    return createEdges(materia, selectedIds);
                }
            );

            return {nodes: initialNodes, edges: initialEdges};

        },
        [materias, selectedIds, highlightedIds, courseMap, maxPerRow] 
    );

    useEffect(() => {
        if (rfInstance && materias.length > 0) {
            const timeout = setTimeout(() => {
                rfInstance.fitView({ 
                    duration: 600, 
                    padding: 0.1 
                });
            }, 350); 

            return () => clearTimeout(timeout);
        }
    }, [isSidebarCollapsed, rfInstance]);

    const isMobile = window.innerWidth <= 768;

    const dynamicMinZoom = isMobile ? 0.4 : 1.1;
    const dynamicMaxZoom = isMobile ? 1.0 : 1.4;

    return(
        <div className="app-layout">
            
            <Sidebar 
                selectedCourse={currentCourse} 
                onSelectCourse={setCurrentCourse} 
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
            
            <main className="flow-container">
                <ReactFlow 
                    nodes={nodes} 
                    edges={edges}
                    nodesConnectable={false}
                    nodesDraggable={false}
                    deleteKeyCode={null}
                    
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    
                    defaultViewport={initialViewport}
                    translateExtent={translateExtent}

                    maxZoom={dynamicMaxZoom}
                    minZoom={dynamicMinZoom}

                    style={{backgroundColor: '#1e293b'}}
                    proOptions={{hideAttribution: true}}

                    onInit={setRfInstance}

                >
                    <Background color="#888282ff" gap={20}/>
                </ReactFlow>

                <button 
                    className="about-btn" 
                    onClick={() => setIsAboutOpen(true)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 16v-4"></path>
                        <path d="M12 8h.01"></path>
                    </svg>
                </button>

                <AboutModal 
                    isOpen={isAboutOpen} 
                    onClose={() => setIsAboutOpen(false)} 
                />            
            </main>

        </div>
    )
    
}
export default App;