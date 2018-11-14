<template>
  <div class="canvas-box">
    <input type="button" value="开始" @click="start()">
    <canvas id="my-canvas"></canvas>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  inject: ['App'],
  data () {
    return {
      canvas: null,
      ctx: null,
      gridNum: 20,
      perGridWidth: 50,
      gridPointsArr: [],
      attacker: 1 // 出击方，初始默认白棋
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
      this.canvas = canvas
      this.ctx = canvas.getContext('2d')
    },
    initCanvasGrid () {
      this.drawOuterBorder()
      this.drawInserBorder()
    },

    // 外框线
    drawOuterBorder () {
      // this.ctx.beginPath()
      this.ctx.lineWidth = 6
      this.ctx.strokeColor = 'rgba(0,0,0,.8)'
      this.ctx.rect(0, 0, this.gridNum * this.perGridWidth, this.gridNum * this.perGridWidth)
      this.ctx.stroke()
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
    start () {
      this.canvas.addEventListener('click', this.clickGridToAddChess, false)
      this.clearCtx()
      this.attacker = 1 // 出击方，初始默认白棋
      this.initGridPointsArr()
      this.initCanvasGrid()
      this.initChess()
    },
    /**
     * 清理画布
     */
    clearCtx () {
      let width = this.gridNum * this.perGridWidth
      this.canvas.width = this.canvas.height = width // 重新设置高和宽，可以去除上次的残留行为
      this.ctx.clearRect(0, 0, width, width)
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
          arr[i].push({attacker: 0, drawed: 0})
        }
      }
      this.gridPointsArr = arr
    },
    // 进攻方对换
    swithAttacker () {
      this.attacker = this.attacker > 1 ? 1 : 2 // 进攻方对换
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
      this.ctx.strokeStyle = ['white', 'black'][this.attacker - 1]
      this.ctx.fillStyle = this.ctx.strokeStyle
      this.ctx.beginPath()
      this.ctx.arc(x * this.perGridWidth, y * this.perGridWidth, Math.round(this.perGridWidth / 3), 0, 2 * Math.PI)
      this.ctx.stroke()
      this.ctx.fill()
      this.ctx.closePath()
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
        this.drawChess(diffX, diffY, true)
        // 检测是否赢
        let flag = this.checkIsWin(diffX, diffY, 4) // 先检测正西方是否有连续5个同色棋子
        if (flag) {
          let winerArr = ['白棋', '黑棋']
          window.setTimeout(() => {
            this.canvas.removeEventListener('click', this.clickGridToAddChess)
            window.alert(winerArr[this.attacker - 1] + '胜出，请重新开始')
          }, 100)
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
      let reg = this.attacker > 1 ? /22222/ : /11111/ // 根据进攻方来选择判断条件
      // 使用正则表达式进行匹配
      let lines1 = this.getEastWestLine(x, y).join('')
      if (reg.test(lines1)) {
        return true
      }
      let lines2 = this.getSouthNorthLine(x, y).join('')
      if (reg.test(lines2)) {
        return true
      }
      let line3 = this.getOtherLine(x, y, 1).join('')
      if (reg.test(line3)) {
        return true
      }
      let line4 = this.getOtherLine(x, y, -1).join('')
      if (reg.test(line4)) {
        return true
      }
      return false
    },
    /**
     * 获取东西走向的线。当前的点往东取5个(不出边界)，往西取5个(不出边界)
     * 获取到线上的点，然后把对应点上的绘制信息放到数组中
     */
    getEastWestLine (x, y) {
      let min = Math.min(this.gridNum - 1, x + 4) // 当前点西边的点
      let max = Math.max(1, x - 4) // 当前点东边的点
      let arr = []
      for (let i = max; i <= min; i++) {
        let item = this.gridPointsArr[i][y]
        arr.push(item.attacker)
      }
      return arr
    },
    /**
     * 获取南北走向的线。当前的点往南取5个(不出边界)，往北取5个(不出边界)
     * 获取到线上的点，然后把对应点上的绘制信息放到数组中
     */
    getSouthNorthLine (x, y) {
      let min = Math.min(this.gridNum - 1, y + 4) // 当前点西边的点
      let max = Math.max(1, y - 4) // 当前点东边的点
      let arr = []
      for (let i = max; i <= min; i++) {
        let item = this.gridPointsArr[x][i]
        arr.push(item.attacker)
      }
      return arr
    },
    /**
     * 获取斜线上的值
     * 假设 点为 （2, 3）
     * 则斜率为 -1 的 点一次为：（1,2）（2,3）（3,4）（5,6）（7,8）
     * 则斜率为 1 的 点一次为：（1,4）（2,3）（3,2）（1,4）
     */
    getOtherLine (x, y, gradient = 1) {
      let diff = gradient > 0 ? x + y : x - y
      let min = Math.min(this.gridNum - 1, x + 4) // 当前点西边的点
      let max = Math.max(1, x - 4) // 当前点东边的点
      let arr = []
      for (let i = max; i <= min; i++) {
        let item = null
        if (gradient > 0) {
          item = this.gridPointsArr[i][diff - i]
        } else {
          item = this.gridPointsArr[i][i - diff]
        }
        if (item) {
          arr.push(item.attacker)
        }
      }
      return arr
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
