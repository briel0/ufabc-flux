import ReactFlow, {Background, Controls} from 'reactflow';
import 'reactflow/dist/style.css'
import materias from './data/materiasbcc.json';
import {Disciplina} from './types';

import {calcLevels} from './utils/graph/curriculum-logic';

import {useState, useMemo} from 'react';

import {getRequisiteIds} from './utils/graph/curriculum-logic';

import {createNode, createEdges} from './utils/graph/graph-factory';

import './styles/graph.css'

import './styles/index.css'

const containerStyle = {width: '100%', height: '100vh'};

function App() {

    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const courseMap = useMemo(() => new Map<string, Disciplina>(materias.map(m => [m.id, m])), []);

    const selectedPath = useMemo(() =>
    selectedCourseId ? getRequisiteIds(selectedCourseId, courseMap) : null,
    [selectedCourseId, courseMap]);

    const onNodeClick = 
        function(event: React.MouseEvent, node: any){
            setSelectedCourseId(node.id);
        };

    const onPaneClick =
        function(){
            setSelectedCourseId(null);
        };

    const levelMap = useMemo(() => calcLevels(materias as Disciplina[]), []);

    const maxPerRow = window.innerWidth < 768 ? 3 : 5;

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
                    return createNode(materia, index, selectedCourseId, selectedPath);
                }
            );

            const initialEdges = materias.flatMap(
                function(materia){
                    return createEdges(materia, courseMap, selectedPath);
                }
            );

            return {nodes: initialNodes, edges: initialEdges};

        },
        [materias, levelMap, selectedPath, selectedCourseId, courseMap] 
    );

    const initialViewport = useMemo(() => {
        const zoom = 1.1;
        const MAX_PER_ROW = 5;
        const NODE_WIDTH = 210;
        
        const graphWidth = MAX_PER_ROW * NODE_WIDTH;
        
        const centerX = (window.innerWidth / 2) - (graphWidth * zoom / 2);
        
        return { x: centerX, y: 50, zoom };
    }, []);

    //é o que fiz por ultimo
    const translateExtent = useMemo(
        function() {
            const ROW_HEIGHT = 95; 
            const NODE_WIDTH = 220;
            const totalRows = Math.ceil(materias.length / maxPerRow);

            const minX = -200;
            const minY = -100;
            const maxX = (maxPerRow * NODE_WIDTH) + 200;
            const maxY = (totalRows * ROW_HEIGHT) + 200;

            // Forçamos o tipo para a tupla que o React Flow exige
            return [[minX, minY], [maxX, maxY]] as [[number, number], [number, number]];
        }, 
        [materias.length, maxPerRow]
    );

    return(
        <div style = {containerStyle}>
            <ReactFlow 
            nodes = {nodes} 
            edges = {edges}
            nodesConnectable = {false}
            nodesDraggable={true}
            deleteKeyCode={null}

            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            
            defaultViewport={initialViewport}
            translateExtent={translateExtent}

            maxZoom={1.4}
            minZoom={0.8}

            style={{backgroundColor: '#1e293b'}}
            
            proOptions={{ hideAttribution: true }}>

                <Background color="#888282ff" gap={20}/>
                <Controls/>
            </ReactFlow >
        </div>
    )
    
}
export default App;