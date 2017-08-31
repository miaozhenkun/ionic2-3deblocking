import {Component, Input, Output, EventEmitter} from '@angular/core';
import { IonicPage} from 'ionic-angular';
/**
 * @name 自定义九宫格解锁组件
 * @description  miaochen
 * @example   <deb-locking [currheight]="canvas 距离顶部的高度" (pwdResult)="getResult($event)"></deb-locking>
 * deblocking
 */
@IonicPage()
@Component({
  selector: 'deb-locking',
  templateUrl: 'deblocking.html',
})
export class Deblocking {
  R = 26;canvasWidth = 400;canvasHeight = 320;OffsetX = 25; OffsetY = 25;
  canvas:any;
  context:any;
  circleArr = [];
  @Input()
  currheight:number;//此高度为 canvas距离顶部的高度
  @Input()
  color:string='primary';//主题颜色,此处为拓展项，以后添加
  @Output() pwdResult = new EventEmitter<any>();

  constructor() {
  }
  ngAfterContentInit() {
    console.log(this.currheight);
    this.canvas = document.getElementById("lockCanvass");
    this.canvasWidth = document.body.offsetWidth;//网页可见区域宽
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    var cxt = this.canvas.getContext("2d");
    /**
     * 每行3个圆
     * OffsetX为canvas x方向内边距
     * */
    var X = (this.canvasWidth - 2 * this.OffsetX -this. R * 2 * 3) / 2;
    var Y = (this.canvasHeight - 2 *this. OffsetY - this.R * 2 * 3) / 2;
    this.createCirclePoint(X, Y);
    this.bindEvent(this.canvas, cxt);
    //CW=2*offsetX+R*2*3+2*X
    this.Draw(cxt, this.circleArr, [],null);
  }

  createCirclePoint(diffX, diffY) {
    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 3; col++) {
        // 计算圆心坐标
        var Point = {
          X: (this.OffsetX + col * diffX + ( col * 2 + 1) *this. R),
          Y: (this.OffsetY + row * diffY + (row * 2 + 1) * this.R)
        };
        this.circleArr.push(Point);
      }
    }
  }
  /**
   * 计算选中的密码
   */
  public getSelectPwd(touches,pwdArr){
    for (let i = 0; i < this.circleArr.length; i++) {
      let currentPoint = this.circleArr[i];
      let xdiff = Math.abs(currentPoint.X - touches.pageX);
      //      //此处应加上 九宫格解锁的实际高度   解决BUG
      let ydiff = Math.abs(currentPoint.Y - touches.pageY+this.currheight);

      let dir = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
      if(dir > this.R || pwdArr.indexOf(i) >= 0)
        continue;
      pwdArr.push(i);
      break;
    }
  }
  private getUserSelectPwd(touches,pwdArr){
    for (let i = 0; i < this.circleArr.length; i++) {
      let currentPoint = this.circleArr[i];
      let xdiff = Math.abs(currentPoint.X - touches.pageX);
      let ydiff = Math.abs(currentPoint.Y - touches.pageY);
      let dir = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
      if(dir > this.R || pwdArr.indexOf(i) >= 0)
        continue;
      pwdArr.push(i);
      break;
    }
  }
  private Draw(cxt, circleArr, pwdArr,touchPoint) {
    if (pwdArr.length > 0) {
      cxt.beginPath();
      for (var i = 0; i < pwdArr.length; i++) {
        var pointIndex = pwdArr[i];

        cxt.lineTo(circleArr[pointIndex].X, circleArr[pointIndex].Y);
      }
      cxt.lineWidth = 10;
       cxt.strokeStyle = "#627eed";
     // cxt.strokeStyle = "#00ffdd";
      cxt.stroke();
      cxt.closePath();
      if(touchPoint!=null){
        var lastPointIndex=pwdArr[pwdArr.length-1];
        var lastPoint=circleArr[lastPointIndex];
        cxt.beginPath();

        //划线的高度处理
        cxt.moveTo(lastPoint.X,lastPoint.Y);
        cxt.lineTo(touchPoint.X,touchPoint.Y);
        cxt.stroke();
        cxt.closePath();
      }
    }
    for (var i = 0; i < circleArr.length; i++) {
      var Point = circleArr[i];
      cxt.fillStyle = "#627eed";
      cxt.beginPath();
      cxt.arc(Point.X, Point.Y, this.R, 0, Math.PI * 2, true);
      cxt.closePath();
      cxt.fill();
      cxt.fillStyle = "#ffffff";
      cxt.beginPath();
      cxt.arc(Point.X, Point.Y, this.R - 3, 0, Math.PI * 2, true);
      cxt.closePath();
      cxt.fill();
      if(pwdArr.indexOf(i)>=0){
        cxt.fillStyle = "#627eed";
        cxt.beginPath();
        cxt.arc(Point.X, Point.Y, this.R -16, 0, Math.PI * 2, true);
        cxt.closePath();
        cxt.fill();
      }

    }
  }



  /**
   * 给画布绑定事件
   */
  private bindEvent(canvas, cxt) {
    let _this=this;
    var pwdArr = [];
    canvas.addEventListener("touchstart", function (e) {
      _this.getSelectPwd(e.touches[0],pwdArr);
    },function (error) {
      console.log(error);
    });
    canvas.addEventListener("touchmove", function (e) {
      e.preventDefault();
      var touches = e.touches[0];
      _this.getSelectPwd(touches,pwdArr);
      cxt.clearRect(0,0,_this.canvasWidth,_this.canvasHeight);
      //此处应减去  九宫格解锁的实际高度
      _this.Draw(cxt,_this.circleArr,pwdArr,{X:touches.pageX,Y:touches.pageY-_this.currheight});
    }, false);
    canvas.addEventListener("touchend", function (e) {
      cxt.clearRect(0,0,_this.canvasWidth,_this.canvasHeight);
      _this.Draw(cxt,_this.circleArr,pwdArr,null);
      _this.pwdResult.emit(pwdArr);
      pwdArr=[];
    }, false);
  }

}
