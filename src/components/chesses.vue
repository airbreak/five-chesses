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
      perGridWidth: 100,
      gridPointsArr: [],
      attacker: 0 // 出击方，初始默认白棋
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initGridPointsArr()
      this.initCanvasGrid()
    })
  },
  methods: {
    initCanvasGrid () {
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
      let x = Math.round(this.gridNum / 2)
      this.drawChess(x, x, false)
      this.drawChess(x, x + 1, false)
    },
    /**
     * 初始化二维数组，记录是否放有棋子
     */
    initGridPointsArr () {
      let arr = []
      for (let i = 0; i < this.gridNum; i++) {
        arr.push([])
        for (let j = 0; j < this.gridNum; j++) {
          arr[i].push({attacker: -1, drawed: 0})
        }
      }
      this.gridPointsArr = arr
    },
    /**
     * 画棋子
     * @param {x} int  格子下标
     * @param {y} int  格子下标
     */
    drawChess (x, y, checkWin = true) {
      this.execDrawChess(x, y)
      this.gridPointsArr[x][y].drawed = 1
      this.gridPointsArr[x][y].attacker = this.attacker
      if (checkWin) {
        if (this.checkIsWin(x, y)) {
          alert('win')
          return
        }
      }
      this.attacker = this.attacker ? 0 : 1
    },
    /**
     * 画棋子
     * @param {x} int  格子下标
     * @param {y} int  格子下标
     */
    execDrawChess (x, y) {
      this.ctx.strokeStyle = ['white', 'black'][this.attacker]
      this.ctx.fillStyle = this.ctx.strokeStyle
      this.ctx.beginPath()
      this.ctx.arc(x * this.perGridWidth, y * this.perGridWidth, 30, 0, 2 * Math.PI)
      this.ctx.stroke()
      this.ctx.fill()
    },
    /**
     * 点击方格落棋
     * 获取点击的坐标，落到取到最近的交点处
     */
    clickGridToAddChess (e) {
      let [x, y] = this.getMousePos(document.getElementById('my-canvas'), e)
      if (x > this.gridNum * this.perGridWidth || y > this.gridNum * this.perGridWidth) {
        return
      }
      let diffX = x / this.perGridWidth
      let diffY = y / this.perGridWidth
      diffX = Math.round(diffX)
      diffY = Math.round(diffY)
      if (!this.checkIsDrawedChess(diffX, diffY)) {
        this.drawChess(diffX, diffY, 1)
      }
    },
    /**
     * 获取点击的位置
     */
    getMousePos (canvas, event) {
      var rect = canvas.getBoundingClientRect()
      var x = event.clientX - rect.left * (canvas.width / rect.width)
      var y = event.clientY - rect.top * (canvas.height / rect.height)
      return [x, y]
    },
    /**
     * 是否已经放有棋子
     */
    checkIsDrawedChess (x, y) {
      return this.gridPointsArr[x][y].drawed === 1
    },
    /**
     * 检验某方是否胜利
     * 具体做法：以当前点为中心，确定8个方向 →、←、↑、↓，东北、东南、西南、东北。是否有颜色一致并且个数连续累加为5
     */
    checkIsWin (x, y, num = 1) {
      let isWin = false
      let nextPoint = this.gridPointsArr[x + 1][y]
      let drawed = nextPoint.drawed
      if (drawed) {
        if (nextPoint.attacker === this.attacker) {
          num++
          if (num === 5) {
            isWin = true
          } else {
            if (x < this.gridNum) {
              this.checkIsWin(x + 1, y, num)
            }
          }
        }
      }
      return isWin
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
