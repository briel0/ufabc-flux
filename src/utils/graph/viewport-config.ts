import { useState, useMemo, useEffect } from 'react';

import { GRAPH_CONFIG } from './constants';

function getColumns() {
    return window.innerWidth < 768 ? 3 : 5;
}

export function useGraphViewport(materiasLength: number) {
    const [maxPerRow, setMaxPerRow] = useState(
        function(){
            return getColumns();
        }
    );

    const [windowWidth, setWindowWidth] = useState(
        function(){
            return window.innerWidth;
        }
    );

    useEffect(
        function() {
            function handleResize(){
                setMaxPerRow(getColumns());
                setWindowWidth(window.innerWidth);
            }

        window.addEventListener('resize', handleResize);
        return function(){
            window.removeEventListener('resize', handleResize);
        };
    }, 
    []);

    const translateExtent = useMemo(
        function(){
            const totalRows = Math.ceil(materiasLength / maxPerRow);

            const minX = -200;
            const minY = -100;
            const maxX = (maxPerRow * GRAPH_CONFIG.NODE_WIDTH) + 200;
            const maxY = (totalRows * GRAPH_CONFIG.ROW_HEIGHT) + 200;

            return [[minX, minY], [maxX, maxY]] as [[number, number], [number, number]];
        }, 
    [materiasLength, maxPerRow]);

    const initialViewport = useMemo(
        function(){
            const zoom = 1.1;
            const graphWidth = maxPerRow * GRAPH_CONFIG.NODE_WIDTH;
            const centerX = (windowWidth / 2) - (graphWidth * zoom / 2);
            return { x: centerX, y: 50, zoom };
        }, 
    [maxPerRow, windowWidth]);

    return { maxPerRow, initialViewport, translateExtent };
}