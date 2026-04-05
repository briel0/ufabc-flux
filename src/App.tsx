import ReactFlow, {Background, Controls} from 'reactflow';
import 'reactflow/dist/style.css'
import materias from './data/materias.json';
import {Disciplina} from './types';

import {calcLevels} from './utils/layout';

const containerStyle = {width: '100vw', height: '100vh'};

function App() {

    const levelMap = calcLevels(materias as Disciplina[]);

    console.log("Mapa de Níveis:", levelMap);

    const yCounter: Record<number, number> = {};

    function createNode(materia: Disciplina){

        const columnX = levelMap[materia.id]

        yCounter[columnX] = yCounter[columnX] === undefined ? 0 : yCounter[columnX] + 1;

        console.log(`Materia: ${materia.id} | X: ${yCounter[columnX]} | Y: ${columnX}`);

        return{
            id: materia.id,
            data: {label: materia.nome},

            //Horizontal spacing (X) based on level, Vertical (Y) based on occupancy

            position: {x: yCounter[columnX] * 350, y: columnX * 120},
        };
    }

    function createEdges(materia: Disciplina){
        return materia.recomendacoes.map(
            function(idRecomendada){
                return{
                    id: `e-${idRecomendada}-${materia.id}`,
                    source: idRecomendada,
                    target: materia.id,
                    animated: true,
                    style: {stroke: '#555'}
                };
            }
        );
    }

    const initialNodes = materias.map(createNode);
    const initialEdges = materias.flatMap(createEdges);

    return(
        <div style = {containerStyle}>
            <ReactFlow 
            nodes = {initialNodes} 
            edges = {initialEdges}
            nodesConnectable = {false}
            nodesDraggable={true}
            deleteKeyCode={null}
            >
                <Background color="#ccc" gap={20}/>
                <Controls/>
            </ReactFlow>
        </div>
    )
    
}
export default App;