import {Disciplina} from '../../types'

import {GRAPH_CONFIG} from './constants';

//import { MarkerType } from 'reactflow';

export function createNode(
    materia: Disciplina,
    globalIndex: number,
    selectedCourseId: string | null,
    selectedPath: Set<string> | null
){

    selectedCourseId;

    const xPos = (globalIndex % GRAPH_CONFIG.MAX_PER_ROW) * GRAPH_CONFIG.NODE_WIDTH;
    const yPos = Math.floor(globalIndex / GRAPH_CONFIG.MAX_PER_ROW) * GRAPH_CONFIG.ROW_HEIGHT;

    let classes = ['node'];

    if(selectedPath){
        if(!selectedPath.has(materia.id)){
            classes.push('muted');
        }
        else{
            classes.push('highlighted');
        }
    }

    return{
        id: materia.id,
        data: { 
            label: (
                <div className="node-label">
                    <span className = "node-id">{materia.id}</span>
                    <div className = "node-name">{materia.nome}</div>
                </div>
            )
        },
        className: classes.join(' '),
        position: { x: xPos, y: yPos },
    };
}

export function createEdges(
    materia: Disciplina,
    courseMap: Map<string, Disciplina>,
    selectedPath: Set<string> | null
){

    const filteredRecomendacoes = materia.recomendacoes.filter(
        function(idRecomendada){
            const isRedundant = materia.recomendacoes.some(
                function(outroId){
                    if(outroId === idRecomendada){
                        return false;
                    }
                    const outraMateria = courseMap.get(outroId);
                    return outraMateria && outraMateria.recomendacoes.includes(idRecomendada);

                }
            );
            return !isRedundant;
        }
    );

    return filteredRecomendacoes.map(
        function(idRecomendada){

            const isHighlighted = !!(selectedPath && selectedPath.has(materia.id) && selectedPath.has(idRecomendada));

            let edgeClasses = ['edge'];
            edgeClasses.push(isHighlighted ? 'highlighted' : 'muted');

            return{
                id: `e-${idRecomendada}-${materia.id}`,
                source: idRecomendada,
                target: materia.id,
                animated: isHighlighted,
                className: edgeClasses.join(' ')
            };
        }
    );
}