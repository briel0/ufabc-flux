import ReactFlow, {Background, Controls, Node, ReactFlowInstance} from 'reactflow';
import 'reactflow/dist/style.css'

import materias from './data/materias-bcc.json';

import {Disciplina} from './types';

import {calcLevels} from './utils/graph/curriculum-logic';

import {useState, useMemo, useEffect} from 'react';

import {createNode, createEdges} from './utils/graph/graph-factory';

import './styles/graph.css'

import './styles/index.css'

import { useGraphViewport } from './utils/graph/viewport-config';

import { Sidebar } from './components/Sidebar';

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
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

    const [materias, setMaterias] = useState<Disciplina[]>([]);

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
    
    const [selectedIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
    
    const {maxPerRow, initialViewport, translateExtent} = useGraphViewport(materias.length);

    console.log()

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
        function(event: React.MouseEvent, node: Node<Disciplina>){
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

    const levelMap = useMemo(
        function(){
            return calcLevels(materias as Disciplina[]);
        }, 
        []
    );

    const {nodes, edges} = useMemo(
        function(){
            const sortedMaterias = [...materias].sort(
                function(a, b){

                    const pesoA = a.isConclusiva ? 1 : 0;
                    const pesoB = b.isConclusiva ? 1 : 0;

                    // Se uma for conclusiva e a outra não, a conclusiva SEMPRE vai para o final
                    if (pesoA !== pesoB) {
                        return pesoA - pesoB;
                    }

                    return levelMap[a.id] - levelMap[b.id];
                }
            );

            const initialNodes = sortedMaterias.map(
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
        [materias, levelMap, selectedIds, highlightedIds, courseMap, maxPerRow] 
    );

    useEffect(() => {
        if (rfInstance && materias.length > 0) {
            // Timer sintonizado com a transição do CSS (300ms)
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
            </main>
        </div>
    )
    
}
export default App;