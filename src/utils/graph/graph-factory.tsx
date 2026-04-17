import {Disciplina} from '../../types'

import {GRAPH_CONFIG} from './constants';

export function createNode(
    materia: Disciplina,
    globalIndex: number,
    selectedIds: Set<string>,
    highlightedIds: Set<string>,
    maxPerRow: number
){

    const xPos = (globalIndex % maxPerRow) * GRAPH_CONFIG.NODE_WIDTH;
    const yPos = Math.floor(globalIndex / maxPerRow) * GRAPH_CONFIG.ROW_HEIGHT;

    let classes = ['node'];

    if(selectedIds.size > 0){
        if(selectedIds.has(materia.id)){
            classes.push('selected');
        }
        else if(highlightedIds.has(materia.id)){
            classes.push('highlighted');
        }
        else{
            classes.push('muted');
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
        position: {x: xPos, y: yPos},
    };
}

export function createEdges(
    materia: Disciplina,
    selectedIds: Set<string>,
){

    return materia.recomendacoes.map(
        function(idRecomendada){

            const isVisible = selectedIds.has(materia.id);

            return{
                id: `e-${idRecomendada}-${materia.id}`,
                source: idRecomendada,
                target: materia.id,
                animated: isVisible,
                className: isVisible ? 'edge highlighted' : 'edge muted'
            };
        }
    );
}