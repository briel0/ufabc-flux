import {Disciplina} from "../types";

/*
Recursively finds all prerequisite IDs.
Complexity: O(V + E)
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
