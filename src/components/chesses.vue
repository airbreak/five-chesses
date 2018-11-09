<template>
  <div class="canvas-box">
    <canvas id="my-canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      gridNum: 10,
      perGridWidth: 100
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.init()
    })
  },
  methods: {
    init () {
      let canvas = document.getElementById('my-canvas')
      canvas.width = canvas.height = this.gridNum * this.perGridWidth
      this.ctx = canvas.getContext('2d')
      // 外框线
      this.ctx.lineWidth = 6
      this.ctx.strokeColor = 'rgba(0,0,0,.8)'
      this.ctx.rect(0, 0, this.gridNum * this.perGridWidth, this.gridNum * this.perGridWidth)
      this.ctx.stroke()

      // 内框线
      this.drawInserBorder()
      // initChess
      this.initChess()
      canvas.addEventListener('click', this.clickGridToAddChess, false)
    },
    drawInserBorder () {
      // 内框线
      this.ctx.beginPath()
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = 'rgba(0,0,0,.5)'
      for (let i = 1; i < this.gridNum; i++) {
        this.ctx.beginPath()
        this.ctx.moveTo(i * this.perGridWidth, 0)
        this.ctx.lineTo(i * this.perGridWidth, this.gridNum * this.perGridWidth)
        this.ctx.stroke()
      }
      for (let i = 1; i < this.gridNum; i++) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, i * this.perGridWidth)
        this.ctx.lineTo(this.gridNum * this.perGridWidth, i * this.perGridWidth)
        this.ctx.stroke()
      }
    },
    /**
     * 初始化两个棋子
     */
    initChess () {
      let x = this.gridNum * this.perGridWidth / 2
      this.drawChess(x, x)
      this.drawChess(x, x + this.perGridWidth, 1)
    },
    /**
     * 画棋子
     * @param {type} int  0:白棋，1：黑棋
     */
    drawChess (x, y, type = 0) {
      this.ctx.strokeStyle = ['white', 'black'][type]
      this.ctx.fillStyle = this.ctx.strokeStyle
      this.ctx.beginPath()
      this.ctx.arc(x, y, 30, 0, 2 * Math.PI)
      this.ctx.stroke()
      this.ctx.fill()
    },
    /**
     * 点击方格落棋
     */
    clickGridToAddChess (e) {
      console.log(e)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.canvas-box{
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  #my-canvas {
    background-color:rgba(0, 0, 0, .2);
  }
}
</style>
