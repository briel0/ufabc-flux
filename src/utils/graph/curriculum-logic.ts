import {Disciplina} from "../../types";

/*
Calculates the topological depth (level) for each course in a DAG.
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

/*
Recursively finds all prerequisite IDs.
*/

export function getRequisiteIds(id: string, courseMap: Map<string, Disciplina>, path: Set<string> = new Set()): Set<string>{
    if(path.has(id)){
        return path;
    }

    path.add(id);

    const course = courseMap.get(id);

    if(course){
        course.recomendacoes.forEach(
            function(prereqId){
                getRequisiteIds(prereqId, courseMap, path);
            }
        );
    }
    
    return path;

}
