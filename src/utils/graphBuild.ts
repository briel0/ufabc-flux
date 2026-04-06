import {Disciplina} from '../types'

export function createNode(
    materia: Disciplina,
    level: number,
    indexInLevel: number,
    selectedCourseId: string | null,
    selectedPath: Set<string> | null
){

    /*
    talvez fosse mais fácil só ir inserindo e colapsando ao invés
    de inventar essa moda toda o_O
    */

    const MAX_PER_ROW = 5; // O limite que você sugeriu
    const NODE_WIDTH = 210; //espaço horizontal entre os nós
    const ROW_HEIGHT = 100; // Largura da sub-coluna
    const LEVEL_SPACING = 280; // Espaço entre os grandes blocos de níveis

    const xPos = (indexInLevel % MAX_PER_ROW) * NODE_WIDTH;

    const yPos = (level * LEVEL_SPACING) + (Math.floor(indexInLevel / MAX_PER_ROW) * ROW_HEIGHT);

    let opacity = 1.0;
    let border = '1px solid #777'
    let background = '#fff';

    if(selectedPath){
        if(!selectedPath.has(materia.id)){
            opacity = 0.2;
        }
        else{
            if(materia.id === selectedCourseId){
                background = '#a6cfff';
                border = '2px solid #00056b3';
            }
            else{
                background = '#fff'
                border = '2px solid #0056b3'                    
            }
        }
    }

    return{
        id: materia.id,
        data: {label: materia.nome},
        style: {opacity, 
                border, 
                background,
                borderRadius: '8px',
                },

        //Horizontal spacing (X) based on level, Vertical (Y) based on occupancy
        position: {x: xPos, y: yPos},
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

            return{
                id: `e-${idRecomendada}-${materia.id}`,
                source: idRecomendada,
                target: materia.id,
                animated: isHighlighted,
                style: {stroke: isHighlighted ? '#0056b3' : '#bbb',
                        strokeWidth: isHighlighted ? 2 : 1,
                        opacity: selectedPath && !isHighlighted ? 0.1 : 1
                }
            };
        }
    );
}