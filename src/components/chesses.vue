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
      attacker: 0, // 出击方，初始默认白棋
      attackerChessCounts: 1, // 出击方累积连续值
      // 当前落棋点 方便判断是否赢
      currentPoint: {
        x: -1,
        y: -1
      },
      isRedirection: false // 是否已经反向查找了
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
      this.drawChess(x, x)
      this.swithAttacker()

      this.drawChess(x, x + 1)
      this.swithAttacker()
    },
    /**
     * 初始化二维数组，记录是否放有棋子
     * 默认都为落棋，进攻方为 -1
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
    // 进攻方对换
    swithAttacker () {
      this.attacker = this.attacker ? 0 : 1 // 进攻方对换
    },
    /**
     * 画棋子
     * @param {x} int  格子下标
     * @param {y} int  格子下标
     */
    drawChess (x, y) {
      this.execDrawChess(x, y) // 画布绘制棋子
      this.gridPointsArr[x][y].drawed = 1 // 已落棋
      this.gridPointsArr[x][y].attacker = this.attacker // 记录进攻方，也就是棋子颜色
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
        // 记录单前的落棋点，方便判断是否赢
        this.currentPoint.x = x
        this.currentPoint.y = y
        this.attackerChessCounts = 1 // 累计同颜色棋子个数
        this.isRedirection = false // 回复未反向查找
        this.drawChess(diffX, diffY, true)
        // 检测是否赢
        let flag = this.checkIsWin(diffX, diffY, 4) // 先检测正西方是否有连续5个同色棋子
        if (flag) {
          alert('win')
          return
        }
      }
      this.swithAttacker() // 进攻方对换
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
     * 具体做法：以当前点为中心，确定8个方向 →、东北、↑、西北、←、西南、↓、东南，逆时针判断。是否有颜色一致并且个数连续累加为5
     * 某个方向数量不够时，则查找反方向，数值继续累积，
     */
    checkIsWin (x, y, direction) {
      let isWin = false
      let nextPoint = this.getNextPoint(x, y, direction)
      // 判断是否反向查找
      if (!this.isRedirection && !nextPoint.continue) {
        nextPoint = this.redirectToFindPoint(direction) // 反向查找统计
      }
      let nextPointInfo = this.gridPointsArr[nextPoint.x][nextPoint.y]
      let drawed = nextPointInfo.drawed
      if (drawed) {
        if (nextPointInfo.attacker === this.attacker) {
          this.attackerChessCounts++
          if (this.attackerChessCounts === 5) {
            isWin = true
            return isWin
          } else {
            return this.checkIsWin(nextPoint.x, nextPoint.y, direction)
          }
        }
      }
      // 反向查找
      nextPoint = this.redirectToFindPoint(direction) // 反向查找统计
      return this.checkIsWin(nextPoint.x, nextPoint.y, direction)
      // return isWin
    },
    /**
     * 反向查找统计
     */
    redirectToFindPoint (direction) {
      this.isRedirection = !this.isRedirection // 标识已反向查找
      direction += 4
      return this.getNextPoint(this.currentPoint.x, this.currentPoint.y, direction)
    },
    /**
     * 获取下一点下标
     * @param {x} int 当前判断点坐标
     * @param {y} int 当前判断点坐标
     * @param {direction} int 当前判断方向，已正东开始 逆时针 0~7
     * */
    getNextPoint (x, y, direction) {
      let fn = null
      switch (direction % 8) {
        case 0:
          fn = this.getEastNextPoint
          break
        case 1:
          fn = this.getEastNorthNextPoint
          break
        case 2:
          fn = this.getNorthNextPoint
          break
        case 3:
          fn = this.getWestNorthNextPoint
          break
        case 4:
          fn = this.getWestNextPoint
          break
        case 5:
          fn = this.getWestSouthNextPoint
          break
        case 6:
          fn = this.getSouthNextPoint
          break
        default:
          fn = this.getEastSouthNextPoint
          break
      }
      return fn(x, y)
    },
    // 正东方向查找下一点
    getEastNextPoint (x, y) {
      if (x < this.gridNum) {
        x++
        return {
          x,
          y,
          continue: true
        }
      } else {
        return {
          continue: false
        }
      }
    },
    // 正西方向查找下一点
    getWestNextPoint (x, y) {
      if (x > 0) {
        x--
        return {
          x,
          y,
          continue: true
        }
      } else {
        return {
          continue: false
        }
      }
    },
    // 正北方向查找下一点
    getNorthNextPoint (x, y) {
      if (y > 0) {
        y--
        return {
          x, y, continue: true
        }
      } else {
        return {
          continue: false
        }
      }
    },
    // 正南方向查找下一点
    getSouthNextPoint (x, y) {
      if (y > 0) {
        y++
        return {
          x, y, continue: true
        }
      } else {
        return {
          continue: false
        }
      }
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
