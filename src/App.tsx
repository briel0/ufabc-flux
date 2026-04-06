import ReactFlow, {Background, Controls} from 'reactflow';
import 'reactflow/dist/style.css'
import materias from './data/materiasbcc.json';
import {Disciplina} from './types';

import {calcLevels} from './utils/layout';

import {useState, useMemo} from 'react';

import {getRequisiteIds} from './utils/graph';

import {createNode, createEdges} from './utils/graphBuild';

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

    const {nodes, edges} = useMemo(
        function(){
            const yCounter: Record<number, number> = {};
            const initialNodes = materias.map(
                function(materia){
                    const level = levelMap[materia.id];
                    if(yCounter[level] == undefined){
                        yCounter[level] = 0;
                    }
                    const index = yCounter[level]++;

                    return createNode(materia, level, index, selectedCourseId, selectedPath);

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
            
            >
                <Background color="#888282ff" gap={20}/>
                <Controls/>
            </ReactFlow>
        </div>
    )
    
}
export default App;