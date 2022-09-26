class Box {
    constructor(x, y, width, height, number){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        let topLeft = {x: this.x - this.width/2, y: this.y - this.height/2}
        let topRight = {x: this.x + this.width/2, y: this.y - this.height/2}
        let bottomLeft = {x: this.x - this.width/2, y: this.y + this.height/2}
        let bottomRight = {x: this.x + this.width/2, y: this.y + this.height/2}

        this.points = [topLeft, bottomLeft, bottomRight, topRight]
        this.number = number
    }

    draw(ctx, covered, text){
        const fontsize = 36
        ctx.fillStyle = "black"
        if(covered){
            // if(covered.number == this.number){
                ctx.fillStyle = "green"
            // }
        }
        ctx.beginPath()
        ctx.moveTo(this.points[0].x, this.points[0].y)
        for(let i = 1; i < this.points.length; i++){
            ctx.lineTo(this.points[i].x, this.points[i].y)
        }
        ctx.fill()
        // ctx.stroke()
        if(text){
            ctx.font = `${fontsize}px monospace`;
            ctx.fillStyle = "white"
            ctx.fillText(`${this.number}`, this.number<10?this.x-9:this.x - 18, this.y + 12)
        }
    }
}