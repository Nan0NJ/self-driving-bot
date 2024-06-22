// lerp - to derive a value between two values
function lerp(A, B, t) {
    return A + (B - A) * t; // to perform linear interpolation
    // used to get a point between to points
}

// check if two lines intersect, used for ray casting
function getIntersection(A, B, C, D) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y)
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y)

    if (bottom != 0) {
        const t = tTop / bottom
        const u = uTop / bottom

        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return {
                x: lerp(A.x, B.x, t),
                y: lerp(A.y, B.y, t),
                offset: t
            }
        }
    }
    return null
}

// Check if two polygons intersect, used for collision detection
function polysIntersection(poly1: any[], poly2: any) {
    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            const touch = getIntersection(
                poly1[i],
                poly1[(i + 1) % poly1.length],
                poly2[j],
                poly2[(j + 1) % poly2.length],
            )
            if(touch){
                return true
            }
        }
    }
    return false
}

export { 
    lerp, 
    getIntersection,
    polysIntersection
};