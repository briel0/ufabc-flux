import ReactFlow, {Background, Controls, Node, ReactFlowInstance} from 'reactflow';
import 'reactflow/dist/style.css'

import materias from './data/materiasbcc.json';

import {Disciplina} from './types';

import {calcLevels} from './utils/graph/curriculum-logic';

import {useState, useMemo, useEffect} from 'react';

import {createNode, createEdges} from './utils/graph/graph-factory';

import './styles/graph.css'

import './styles/index.css'

import { useGraphViewport } from './utils/graph/viewport-config';

import { Sidebar } from './components/Sidebar';

function App() {

    const [currentCourse, setCurrentCourse] = useState<string>('bcc');

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

    const courseMap = useMemo(
        function(){
            return new Map<string, Disciplina>(materias.map(
                function(m){
                    return [m.id, m];
                }
            ));
        },
        []
    ); 
    
    const [selectedIds, setSelectedCourseIds] = useState<Set<string>>(new Set());
    
    const {maxPerRow, initialViewport, translateExtent} = useGraphViewport(materias.length);

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
        if (rfInstance) {
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

                    maxZoom={1.4}
                    minZoom={1.1}

                    style={{backgroundColor: '#1e293b'}}
                    proOptions={{hideAttribution: true}}

                    onInit={setRfInstance}

                >
                    <Background color="#888282ff" gap={20}/>
                    <Controls/>
                </ReactFlow>
            </main>
        </div>
    )
    
}
export default App;