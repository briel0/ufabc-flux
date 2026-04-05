import { Disciplina } from "../types";

/*
Calculates the topological depth (level) for each course in a DAG.
Uses DFS with memoization for O(V + E) complexity.
*/

/*
eu acho mais valido mesclar essa logica com o quadrimestre que
é tipicamente feita a materia

materias que sao feitas meio na frente, mas que tem poucas recomendacoes
ficariam muito juntas, formando uma bagunça
*/

export function calcLevels(courses: Disciplina[]){

    const levels: Record<string, number> = {}

    const courseMap = new Map<string, Disciplina>();

    for(let i = 0; i < courses.length; i++){
        courseMap.set(courses[i].id, courses[i]);
    }
 
    function getDepth(id: string): number {
        if(levels[id] !== undefined){
            return levels[id];
        }

        const course = courseMap.get(id);

        if(!course || course.recomendacoes.length === 0){
            levels[id] = 0;
            return 0;
        }

        let maxDistance = 0;

        for(let i = 0; i < course.recomendacoes.length; i++){
            const distance = getDepth(course.recomendacoes[i]);
            if(distance > maxDistance){
                maxDistance = distance;
            }
        }

        levels[id] = 1 + maxDistance;
        return levels[id];        

    }
    
    for(let i = 0; i < courses.length; i++){
        getDepth(courses[i].id);
    }

    return levels;

}