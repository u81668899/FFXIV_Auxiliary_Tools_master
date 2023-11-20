// P5连线指引JS版本  By Errer  
// 当前版本 V2.2
// 更新github：https://github.com/Errerer/TOP 
//-----------------------------------------------------------------
//   功能介绍
//  P5 一运 绿线拉线提醒
//  P5 一运 一传指路路
//  P5 二运 前半激光分散指路
//  P5 二运 前半击退塔连线
//  P5 二运 后半初始激光跑位点
//  P5 二运 后半二传指路连线，优化顺逆 只有一种连线结果
//  P5 三运 前半男女连续技指路 标1→→2 
//  P5 三运 三传指路安全点
//  P5 三运 四传指路安全点
//-----------------------------分割线-----------------------------------
//  bug修复: 修复bug
// 有问题请在 https://pd.qq.com/s/6qvplk1a4 频道 进行 反馈。

const 欧米茄M = ["欧米茄M", "Omega-M", "オメガM"];
const 欧米茄F = ["欧米茄F", "Omega-F", "オメガF"];
const 眼睛 = ["オプチカルユニット", "Optical Unit", "视觉组"];

//函数
Array.prototype.交集 = function (array) {
  return this.filter((value) => array.includes(value));
};
Array.prototype.差集 = function (array) {
  return this.filter((x) => !array.includes(x));
};
Array.prototype.补集 = function (array) {
  let parent = [...array];
  let child = [...this];
  return parent.filter((x) => !child.includes(x));
};
Array.prototype.并集 = function (array) {
  return [...new Set([...this, ...array])];
};
Array.prototype.重复元素 = function () {
  let array = [...this];
  return array.filter((item, index) => array.indexOf(item) !== index);
};
Array.prototype.过滤重复元素 = function () {
  return [...new Set([...this])];
};
/**
 * 将一个子数组根据它父集数组的顺序排序,返回排序后的数组
 *
 * （如果子数组中含有父集数组没有的元素，则剔除该元素）
 * @param {array} array
 * @returns
 */
Array.prototype.映射排序 = function (array) {
  let parent = [...array];
  let child = [];
  this.forEach((i) => {
    if (parent.includes(i)) child.push(i);
  });
  child.sort((a, b) => parent.indexOf(a) - parent.indexOf(b));
  return child;
};

//计算差集,(大，小)
function subSet(arr1, arr2) {
  arr2 = typeof arr2 != "object" ? [arr2] : arr2;
  let collectionD = arr1.filter((c) => !arr2.some((d) => d === c));
  collectionD = collectionD.length === 1 ? collectionD[0] : collectionD;
  return collectionD;
}

var math = {
  /**
   *
   * @param {number} deg
   */
  角度转弧度: function (deg) {
    return (deg * Math.PI) / 180;
  },
  /**
   *
   * @param {number} rad
   */
  弧度转角度: function (rad) {
    return rad * (180 / Math.PI);
  },
  /**
   * 求两点之间的距离：
   * @param {[x1,y1]} pos1 点1 [x1,y1]
   * @param {[x2,y2]} pos2 点2 [x2,y2]
   */
  两点距离: function (pos1, pos2) {
    let x1 = pos1[0];
    let y1 = pos1[1];
    let x2 = pos2[0];
    let y2 = pos2[1];
    let dis = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    return dis;
  },
  /**
   * 求两向量的夹角：
   *
   * 从主向量->比较向量，顺时针转为正角度，逆时针为负角度
   * @param {[number,number]} mainVector 主向量 [x1,y1]
   * @param {[number,number]} minorVector 比较向量 [x2,y2]
   * @param {0|1} type 0或者不填采用FF14的(100,100)的坐标体系，1采用数学(0,0)的坐标体系
   */
  向量夹角: function (mainVector, minorVector, type) {
    if (type != 1) {
      var x1 = mainVector[0] - 100;
      var y1 = -(mainVector[1] - 100);
      var x2 = minorVector[0] - 100;
      var y2 = -(minorVector[1] - 100);
    } else {
      var x1 = mainVector[0];
      var y1 = mainVector[1];
      var x2 = minorVector[0];
      var y2 = minorVector[1];
    }
    let angle = Math.acos(
      (x1 * x2 + y1 * y2) /
      (Math.sqrt(x1 * x1 + y1 * y1) * Math.sqrt(x2 * x2 + y2 * y2))
    );
    let direction = x1 * y2 - x2 * y1 > 0 ? -1 : 1;
    return ((angle * direction) / Math.PI) * 180;
  },
  /**
   * 现已知坐标原点，向量A坐标、目标向量B和向量A的夹角(带正负方向)、目标向量B的模长，求向量B的具体坐标
   *
   * （结果取小数点后两位，坐标系采用FF14的：即y轴上为负，下为正）
   * @param {number} angle    目标向量B和已知向量A的夹角(正为顺时针，负为逆时针)
   * @param {number} length    目标点到原点的长度
   * @param {[xA,yA]} posA 向量A坐标，默认[100,90]：即y轴向上部分
   * @param {[x0,y0]} pos0 原点坐标，默认[100,100]：即FF14地图中心点
   * @return {[x,y]}
   */
  向量求点: function (angle, length, posA, pos0) {
    if (posA === undefined) posA = [100, 90];
    if (pos0 === undefined) pos0 = [100, 100];
    posA = [posA[0] - pos0[0], pos0[1] - posA[1]];
    //求向量A的角度
    let angleA = math.向量夹角([0, 1], posA, 1);
    let angleB = angleA + angle;
    let radB = math.角度转弧度(angleB);
    let y = Math.cos(radB) * length;
    let x = Math.sin(radB) * length;
    let re = [
      Number((pos0[0] + x).toFixed(2)),
      Number((pos0[1] - y).toFixed(2)),
    ];
    return re;
  },
};

const headmarkers = {
  // vfx/lockon/eff/lockon5_t0h.avfx
  spread: "0017",
  // vfx/lockon/eff/tank_lockonae_5m_5s_01k1.avfx
  buster: "0157",
  // vfx/lockon/eff/z3oz_firechain_01c.avfx through 04c
  firechainCircle: "01A0",
  firechainTriangle: "01A1",
  firechainSquare: "01A2",
  firechainX: "01A3",
  // vfx/lockon/eff/com_share2i.avfx
  stack: "0064",
  // vfx/lockon/eff/all_at8s_0v.avfx
  meteor: "015A",
  P5二运红点名: "00F4",
};

const firstMarker = parseInt("0017", 16);
const getHeadmarkerId = (data, matches) => {
  if (data.decOffset === undefined)
    data.decOffset = parseInt(matches.id, 16) - firstMarker;
  // The leading zeroes are stripped when converting back to string, so we re-add them here.
  // Fortunately, we don't have to worry about whether or not this is robust,
  // since we know all the IDs that will be present in the encounter.
  return (parseInt(matches.id, 16) - data.decOffset)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
};

function PostNamazu测试(text) {
  callOverlayHandler({
    call: "PostNamazu",
    c: "command",
    p: `/e ${text}`,
  });
}

//POST
function Splatoon(namespace, time, data) {
  const portOfSplatoon = 47774; //底裤系带的位置
  fetch(
    `http://127.0.0.1:${portOfSplatoon}/?namespace=${namespace}&destroyAt=${time}`,
    {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    }
  );
}

Options.Triggers.push({
  zoneId: 1122,
  initData: () => {
    return {
      P5: false,
      P5一运: false,
      P5二运: false,
      P5一运科技初始化: false,
      P5二运科技初始化: false,
      P5三运科技初始化: false,
    };
  },
  triggers: [
    {
      id: "P5一运初始化",
      type: "StartsUsing",
      netRegex: NetRegexes.startsUsing({ id: "7B88", capture: false }),
      run: (data) => {
        data.P5一运科技初始化 = true;
       
        data.P5一运我的标记 = [];
      },

      //alarmText: "一运初始化成功",
    },
    {
      //一传标记检测
      id: "一传标记检测",
      netRegex:
        /^(?<type>29)\|(?<timestamp>[^|]*)\|(?<operation>[^|]*)\|(?<waymark>[^|]*)\|(?<id>[^|]*)\|(?<name>[^|]*)\|(?<targetId>[^|]*)\|(?<targetName>[^|]*)\|/,
      suppressSeconds: 5,
      condition: (data, matches) => {
        return (
          matches.operation === "Add" &&
          data.P5一运科技初始化 &&
          matches.targetName === data.me
        );
      },
      run: (data, matches, output) => {
        //PostNamazu测试(
        //  `P5一运 ID:${matches.targetName}+标记:${matches.waymark}`
        //);
        let mark = matches.waymark;
        data.P5一运我的标记 = mark;
        console.log("P5一运我的标记", data.P5一运我的标记);
      },
    },
    {
      //P5一传站位指引
      id: "P5一运蟑螂左右刀判断+ 一传连线指引",
      type: "StartsUsing",
      netRegex: {
        id: ["7B94", "7B95"],
        capture: true,
      },
      delaySeconds: 0.5,
      condition: (data) => data.P5一运科技初始化,
      run: (data, matches) => {
        let P5一运蟑螂左右 = matches.id === "7B95" ? "右" : "左";
        const P5左刀站位点 = {
          攻击1:
            '{"Name":"绿线站位2","type":1,"offX":-2.98,"offY":1.82,"radius":0.0,"thicc":5.0,"overlayText":"攻击1","refActorNPCID":7695,"refActorComparisonType":4,"includeOwnHitbox":true,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
          攻击2:
            '{"Name":"绿线站位1","type":1,"offX":-10.32,"offY":35.74,"radius":0.0,"thicc":5.0,"overlayText":"攻击2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
          攻击3:
            '{"Name":"HW近传递1","type":1,"offX":-8.58,"offY":9.2,"radius":0.0,"overlayTextColor":3355508725,"thicc":5.0,"overlayText":"攻击3","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
          攻击4:
            '{"Name":"HW近传递2","type":1,"offX":-13.44,"offY":7.02,"radius":0.0,"overlayTextColor":3355508725,"thicc":5.0,"overlayText":"攻击4","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
          锁链1:
            '{"Name":"HW远","type":1,"offX":-18.76,"offY":19.68,"radius":0.0,"overlayTextColor":3355508725,"thicc":5.0,"overlayText":"锁链1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
          锁链2:
            '{"Name":"HW近","type":1,"offX":-6.72,"offY":20.06,"radius":0.0,"overlayTextColor":3355508725,"thicc":5.0,"overlayText":"锁链2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
          无点名:
            '{"Name":"闲人组","type":1,"offX":-15.34,"offY":30.48,"radius":0.0,"thicc":5.0,"overlayText":"闲人组","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
        };
        const P5右刀站位点 = {
          攻击1:
            '{"Name":"绿线站位2","type":1,"offX":1.86,"offY":1.04,"radius":0.0,"thicc":5.0,"overlayText":"攻击1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
          攻击2:
            '{"Name":"绿线站位1","type":1,"offX":10.42,"offY":35.28,"radius":0.0,"thicc":5.0,"overlayText":"攻击2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击3:
            '{"Name":"HW近传递1","type":1,"offX":8.78,"offY":10.34,"radius":0.0,"overlayTextColor":3355508725,"thicc":5.0,"overlayText":"攻击3","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击4:
            '{"Name":"HW近传递2","type":1,"offX":15.66,"offY":8.94,"radius":0.0,"overlayTextColor":3355508725,"thicc":5.0,"overlayText":"攻击4","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"Filled":true,"tether":true}',
          锁链1:
            '{"Name":"HW远","type":1,"offX":18.04,"offY":19.42,"radius":0.0,"overlayTextColor":3355508725,"thicc":5.0,"overlayText":"锁链1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链2:
            '{"Name":"HW近","type":1,"offX":6.72,"offY":20.06,"radius":0.0,"overlayTextColor":3355508725,"thicc":5.0,"overlayText":"锁链2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          无点名:
            '{"Name":"闲人组","type":1,"offX":15.78,"offY":30.48,"radius":0.0,"thicc":5.0,"overlayText":"闲人组","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
        };
        let namespace = "P5一运站位指引";
        let time = "7000";
        let json = "";
        let 一传标记 = data.P5一运我的标记;
        if (data.P5一运我的标记.length === 0) 一传标记 = "无点名";
        if (P5一运蟑螂左右 === "左") {
          if (一传标记 === "0") json = P5左刀站位点.攻击1;
          if (一传标记 === "1") json = P5左刀站位点.攻击2;
          if (一传标记 === "2") json = P5左刀站位点.攻击3;
          if (一传标记 === "3") json = P5左刀站位点.攻击4;
          if (一传标记 === "5") json = P5左刀站位点.锁链1;
          if (一传标记 === "6") json = P5左刀站位点.锁链2;
          if (一传标记 === "无点名") json = P5左刀站位点.无点名;
        }
        if (P5一运蟑螂左右 === "右") {
          if (一传标记 === "0") json = P5右刀站位点.攻击1;
          if (一传标记 === "1") json = P5右刀站位点.攻击2;
          if (一传标记 === "2") json = P5右刀站位点.攻击3;
          if (一传标记 === "3") json = P5右刀站位点.攻击4;
          if (一传标记 === "5") json = P5右刀站位点.锁链1;
          if (一传标记 === "6") json = P5右刀站位点.锁链2;
          if (一传标记 === "无点名") json = P5右刀站位点.无点名;
        }
        Splatoon(namespace, time, json);
        console.log("P5一运我的点名", 一传标记, "指路成功！", json);
      },
    },
    {
      //P5二运初始化

      id: "P5二运初始化",
      type: "StartsUsing",
      netRegex: NetRegexes.startsUsing({ id: "8014", capture: false }),
      run: (data) => {
        data.P5一运科技初始化 = false;
        data.P5二运科技初始化 = true;
        data.p5二传前半 = true;
        data.P5二运前半我的标记 = [];
        data.p5二运后半 = false;
        data.p5二运后半我的标记 = [];
        data.P5二运后半转手 = {};
        //PostNamazu测试(`P5二运斜米无脑连线塔初始化成功!<se.2>`);
        console.log(`P5二运斜米无脑连线塔初始化成功!`);
      },
      //alarmText: "P5二运指引初始化成功!",
    },
    {
      //P5 二运开场男人画图
      id: "P5 二运开场男人画图",
      type: "Ability",
      netRegex: NetRegexes.ability({ id: "8014" }),
      delaySeconds: 6,
      suppressSeconds: 10,
      run: () => {
        //画图
        let namespace = "P5二运男人位置";
        let time = "35000";
        let json = `{
                "Name": "二运男人位置",
                "type": 1,
                "radius": 5.52,
                "color": 1677721855,
                "overlayFScale": 1.5,
                "thicc": 3.9,
                "overlayText": "正北12点",
                "refActorNPCNameID": 12257,
                "refActorComparisonType": 6,
                "onlyVisible": true,
                "Filled": true
            }`;
        Splatoon(namespace, time, json);
      },
    },
    {
      //二传前半标记检测
      id: "二传前半标记检测",
      netRegex:
        /^(?<type>29)\|(?<timestamp>[^|]*)\|(?<operation>[^|]*)\|(?<waymark>[^|]*)\|(?<id>[^|]*)\|(?<name>[^|]*)\|(?<targetId>[^|]*)\|(?<targetName>[^|]*)\|/,
      suppressSeconds: 10,
      condition: (data, matches) => {
        return (
          matches.operation === "Add" &&
          data.P5二运科技初始化 &&
          data.p5二传前半 &&
          matches.targetName === data.me
        );
      },
      run: (data, matches, output) => {
        //(
        //  `P5前半半标记 ID:${matches.targetName}+标记:${matches.waymark}`
        //),
          console.log("二传", matches.targetName, matches.waymark);
        let mark = matches.waymark;
        console.log(mark);
        data.P5二运前半我的标记 = mark;
        console.log("P5前半我的标记", data.P5二运前半我的标记);
      },
    },
    {
      //近远判断
      id: "近远判断Errer.JS",
      type: "GainsEffect",
      // D63 = Mid Glitch
      // D64 = Remote Glitch
      netRegex: {
        effectId: ["D63", "D64"],
      },
      suppressSeconds: 10,
      run: (data, matches) => {
        (data.glitch = matches.effectId === "D63" ? "靠近" : "远离"),
          console.log("近远判断", data.glitch);
      },
    },
    {
      //P5 二运分散连线指路

      id: "P5 二运分散连线指路",
      type: "Ability",
      netRegex: NetRegexes.ability({ id: "8014" }),
      delaySeconds: 15,
      suppressSeconds: 10,
      run: (data, matches) => {
        const P5eyjg = {
          攻击1近:
            '{"Name":"","type":1,"offX":-4.88,"offY":31.2,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"攻击1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击1远:
            '{"Name":"","type":1,"offX":-7.8,"offY":37.08,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"攻击1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击2近:
            '{"Name":"","type":1,"offX":-10.14,"offY":24.4,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"攻击2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击2远:
            '{"Name":"","type":1,"offX":-16.18,"offY":26.86,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"攻击2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击3近:
            '{"Name":"","type":1,"offX":-10.3,"offY":15.78,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"攻击3","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击3远:
            '{"Name":"","type":1,"offX":-17.18,"offY":13.02,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"攻击3","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击4近:
            '{"Name":"","type":1,"offX":-4.5,"offY":9.9,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"攻击4","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击4远:
            '{"Name":"","type":1,"offX":-8.0,"offY":3.08,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"攻击4","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链1近:
            '{"Name":"","type":1,"offX":5.1,"offY":31.26,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"锁链1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链1远:
            '{"Name":"","type":1,"offX":7.7,"offY":36.8,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"锁链1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链2近:
            '{"Name":"","type":1,"offX":10.18,"offY":24.3,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"锁链2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链2远:
            '{"Name":"","type":1,"offX":16.12,"offY":27.7,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"锁链2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链3近:
            '{"Name":"","type":1,"offX":10.28,"offY":15.68,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"锁链3","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链3远:
            '{"Name":"","type":1,"offX":17.04,"offY":12.52,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"锁链3","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链4近:
            '{"Name":"","type":1,"offX":4.44,"offY":9.7,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"圆圈（锁链4）","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链4远:
            '{"Name":"","type":1,"offX":7.84,"offY":2.8,"radius":1.0,"overlayTextColor":3355508725,"overlayVOffset":2.0,"thicc":5.0,"overlayText":"圆圈（锁链4）","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
        };
        let namespace = "P5二运前半激光连线";
        console.log("前半标记测试", data.P5二运前半我的标记);
        let time = "6000";
        let json = "";
        if (data.glitch === "靠近") {
          if (data.P5二运前半我的标记 === "0") json = P5eyjg.攻击1近;
          if (data.P5二运前半我的标记 === "1") json = P5eyjg.攻击2近;
          if (data.P5二运前半我的标记 === "2") json = P5eyjg.攻击3近;
          if (data.P5二运前半我的标记 === "3") json = P5eyjg.攻击4近;
          if (data.P5二运前半我的标记 === "5") json = P5eyjg.锁链1近;
          if (data.P5二运前半我的标记 === "6") json = P5eyjg.锁链2近;
          if (data.P5二运前半我的标记 === "7") json = P5eyjg.锁链3近;
          if (data.P5二运前半我的标记 === "10") json = P5eyjg.锁链4近;
          if (data.P5二运前半我的标记 === "11") json = P5eyjg.锁链4近;
        }
        if (data.glitch === "远离") {
          if (data.P5二运前半我的标记 === "0") json = P5eyjg.攻击1远;
          if (data.P5二运前半我的标记 === "1") json = P5eyjg.攻击2远;
          if (data.P5二运前半我的标记 === "2") json = P5eyjg.攻击3远;
          if (data.P5二运前半我的标记 === "3") json = P5eyjg.攻击4远;
          if (data.P5二运前半我的标记 === "5") json = P5eyjg.锁链1远;
          if (data.P5二运前半我的标记 === "6") json = P5eyjg.锁链2远;
          if (data.P5二运前半我的标记 === "7") json = P5eyjg.锁链3远;
          if (data.P5二运前半我的标记 === "10") json = P5eyjg.锁链4远;
          if (data.P5二运前半我的标记 === "11") json = P5eyjg.锁链4远;
        }
        Splatoon(namespace, time, json);
        console.log(
          "我的点名",
          data.P5二运前半我的标记,
          "我的线是",
          data.glitch
        );
        console.log("画线", namespace, "成功！");
      },
    },
    {
      //P5 二运塔连线画图

      id: "P5 二运塔连线画图",
      type: "Ability",
      netRegex: NetRegexes.ability({ id: "8014" }),
      delaySeconds: 26,
      suppressSeconds: 10,
      promise: async (data) => {
        //收集塔和欧米茄位置
        let all = await callOverlayHandler({
          call: "getCombatants",
        });
        all = all.combatants;
        data.P5二运塔 = [];
        data.P5人 = [];
        for (const i in all) {
          if (all[i].BNpcID === 2013246 || all[i].BNpcID === 2013245) {
            data.P5二运塔.push([all[i].PosX, all[i].PosY]);
          }
          if (欧米茄M.includes(all[i].Name)) {
            data.P5人.push([all[i].PosX, all[i].PosY]);
          }
        }
        data.P5二运塔方向 = {
          上: [100, 100],
          下: [100, 100],
          右: [100, 100],
          左: [100, 100],
          右上: [100, 100],
          左上: [100, 100],
          右下: [100, 100],
          左下: [100, 100],
        };
        for (let i = 0; i < data.P5二运塔.length; i++) {
          let pos = data.P5二运塔[i];
          let angle = math.向量夹角(data.P5人[0], pos);

          if (-5 < angle && angle < 5) data.P5二运塔方向.上 = pos;
          if (angle > 175 || angle < -175) data.P5二运塔方向.下 = pos;
          if (60 < angle && angle < 120) data.P5二运塔方向.右 = pos;
          if (-60 > angle && angle > -120) data.P5二运塔方向.左 = pos;

          if (15 < angle && angle < 50) data.P5二运塔方向.右上 = pos;
          if (-15 > angle && angle > -50) data.P5二运塔方向.左上 = pos;
          if (133 < angle && angle < 165) data.P5二运塔方向.右下 = pos;
          if (-133 > angle && angle > -165) data.P5二运塔方向.左下 = pos;
          console.log("P5二运塔：", data.P5二运塔方向);
        }
      },
      alertText: (data) => {
        let 塔数量 = data.P5二运塔.length;
        let type = "";
        var x = 0;
        var y = 0;
        for (let i = 0; i < 塔数量; i++) {
          x = x + data.P5二运塔[i][0];
          y = y + data.P5二运塔[i][1];
        }
        let pos = [x / 塔数量, y / 塔数量];
        let myPath = data.P5二运前半我的标记;
        console.log("mypath", myPath);

        if (塔数量 === 5) {
          //5塔远线
          type = math.两点距离(pos, data.P5人[0]) < 20 ? "倒" : "正";
          if (type === "正") {
            if (myPath === "0" || myPath === "5") data.P5二运我的塔 = "上";
            if (myPath === "2" || myPath === "3") data.P5二运我的塔 = "左下";
            if (myPath === "10" || myPath === "11" || myPath === "7") data.P5二运我的塔 = "右下";
            if (myPath === "1") data.P5二运我的塔 = "左";
            if (myPath === "6") data.P5二运我的塔 = "右";
          } else {
            if (myPath === "10" || myPath === "11" || myPath === "3") data.P5二运我的塔 = "下";
            if (myPath === "0" || myPath === "1") data.P5二运我的塔 = "左上";
            if (myPath === "5" || myPath === "6") data.P5二运我的塔 = "右上";
            if (myPath === "2") data.P5二运我的塔 = "左";
            if (myPath === "7") data.P5二运我的塔 = "右";
          }
        } else {
          //6塔近线
          type = math.两点距离(pos, data.P5人[0]) < 20 ? "倒" : "正";
          if (type === "正") {
            if (myPath === "5") data.P5二运我的塔 = "左上";
            if (myPath === "0") data.P5二运我的塔 = "右上";
            if (myPath === "2") data.P5二运我的塔 = "左下";
            if (myPath === "7") data.P5二运我的塔 = "右下";
            if (myPath === "1" || myPath === "3") data.P5二运我的塔 = "左";
            if (myPath === "6" || myPath === "11"|| myPath === "10") data.P5二运我的塔 = "右";
          } else {
            if (myPath === "1") data.P5二运我的塔 = "左上";
            if (myPath === "6") data.P5二运我的塔 = "右上";
            if (myPath === "11" || myPath === "10") data.P5二运我的塔 = "左下";
            if (myPath === "3") data.P5二运我的塔 = "右下";
            if (myPath === "0" || myPath === "2") data.P5二运我的塔 = "左";
            if (myPath === "5" || myPath === "7") data.P5二运我的塔 = "右";
          }
          console.log("我的塔方向", data.P5二运我的塔);
        }
      },
      run: (data) => {
        //画图
        let x = data.P5二运塔方向[data.P5二运我的塔][0];
        let y = data.P5二运塔方向[data.P5二运我的塔][1];
        console.log("画塔", [x, y]);
        if (x === 100 && y === 100) return;
        console.log("画塔", [x, y], "成功");
        let namespace = "P5二运击退塔";
        let time = "7000";
        let json = `{
              "Name": "连线塔",
               "refX": ${x},
               "refY": ${y},
               "radius": 3.0,
                "color": 4289265408,
                "thicc": 6.3,
                "overlayText": "击退进塔",
                "tether": true
                            }`;
        Splatoon(namespace, time, json);
      },
    },
    {
      //P5 二运后半初始化

      id: "P5 二运后半初始化",
      type: "Ability",
      netRegex: NetRegexes.ability({
        id: "8014",
        capture: false,
      }),
      delaySeconds: 30,
      suppressSeconds: 10,
      run: (data) => {
        data.p5二传前半 = false;
        data.p5二运后半 = true;
      },
    },
    {
      //P5 二传后半标记检测
      id: "二传后半标记检测",
      netRegex:
        /^(?<type>29)\|(?<timestamp>[^|]*)\|(?<operation>[^|]*)\|(?<waymark>[^|]*)\|(?<id>[^|]*)\|(?<name>[^|]*)\|(?<targetId>[^|]*)\|(?<targetName>[^|]*)\|/,
      suppressSeconds: 10,
      condition: (data, matches) => {
        return (
          matches.operation === "Add" &&
          data.P5二运科技初始化 &&
          data.p5二运后半 &&
          matches.targetName === data.me
        );
      },
      run: (data, matches, output) => {
        //PostNamazu测试(
        //  `/e P5二运后半标记 ID:${matches.targetName}+标记:${matches.waymark}`
        //),
          console.log("二传后半", matches.targetName, matches.waymark);
        let mark = matches.waymark;
        console.log(mark);
        data.p5二运后半我的标记 = mark;
        console.log("P5后半我的标记", data.p5二运后半我的标记);
      },
    },
    {
      //P5 二运后半判断转转手顺逆时针

      id: "P5 二运后半判断转转手顺逆时针",
      type: "HeadMarker",
      netRegex: {},
      condition: (data) => data.P5二运科技初始化,
      suppressSeconds: 5,
      alertText: (data) => { },
      run: (data, matches) => {
        const id = getHeadmarkerId(data, matches);
        if (id === "009C") data.P5二运后半转手 = "顺时针";
        if (id === "009D") data.P5二运后半转手 = "逆时针";
        if (id === "0-ED") data.P5二运后半转手 = "顺时针";
        if (id === "0-EC") data.P5二运后半转手 = "逆时针";
       
        console.log(data.P5二运后半转手);
      },
    },
    {
      //P5 二运后半起始激光站位点指路

      id: "P5 二运后半起始激光站位点指路",
      type: "Ability",
      netRegex: NetRegexes.ability({
        id: "8014",
      }),
      delaySeconds: 40,
      suppressSeconds: 10,

      run: (data) => {
        const p5二运激光起跑点 = {
          顺时针左上:
            '{"Name":"左上","type":1,"offX":7.42,"offY":-7.14,"radius":2.0,"color":3370581760,"thicc":5.0,"refActorDataID":15720,"refActorComparisonType":3,"includeRotation":true,"tether":true}',
          顺时针右下:
            '{"Name":"右下","type":1,"offX":-7.26,"offY":26.66,"radius":2.0,"color":3370581760,"thicc":5.0,"refActorDataID":15720,"refActorComparisonType":3,"includeRotation":true,"tether":true}',
          逆时针右上:
            '{"Name":"右上","type":1,"offX":-7.26,"offY":-7.0,"radius":2.0,"color":3370581760,"thicc":5.0,"refActorDataID":15720,"refActorComparisonType":3,"includeRotation":true,"tether":true}',
          逆时针左下:
            '{"Name":"左下","type":1,"offX":7.42,"offY":26.68,"radius":2.0,"color":3370581760,"thicc":5.0,"refActorDataID":15720,"refActorComparisonType":3,"includeRotation":true,"tether":true}',
        };
        let gorun = {};
        gorun = data.p5二运后半我的标记;
        let namespace = "P5二运后半激光起始跑点";
        let time = "6000";
        let json = "";
        if (data.P5二运后半转手 === "顺时针") {
          if (gorun === "0" || gorun === "8" || gorun === "9")
            (json = p5二运激光起跑点.顺时针左上),
              (data.P5testshunni = "顺时针左上");
          if (
            gorun === "1" ||
            gorun === "2" ||
            gorun === "3" ||
            gorun === "5" ||
            gorun === "6"
          )
            (json = p5二运激光起跑点.顺时针右下),
              (data.P5testshunni = "顺时针右下");
        }
        if (data.P5二运后半转手 === "逆时针") {
          if (gorun === "0" || gorun === "8" || gorun === "9")
            (json = p5二运激光起跑点.逆时针右上),
              (data.P5testshunni = "逆时针右上");

          if (
            gorun === "1" ||
            gorun === "2" ||
            gorun === "3" ||
            gorun === "5" ||
            gorun === "6"
          )
            (json = p5二运激光起跑点.逆时针左下),
              (data.P5testshunni = "逆时针左下");
        }

        Splatoon(namespace, time, json);
        console.log("我的起跑点", data.P5testshunni, "我的点名", gorun);
      },
    },
    {
      //P5二传指路
      id: "P5 二传指路",
      type: "Ability",
      netRegex: NetRegexes.ability({
        id: "8014",
      }),
      delaySeconds: 46,
      suppressSeconds: 10,

      run: (data) => {
        const p52c = {
          HW近: `{
            "Name": "HW近",
            "type": 1,
            "offX": 5.0,
            "offY": 26.82,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "HW近",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
        }`,
          近传递右: `{
            "Name": "HW近传1",
            "type": 1,
            "offX": -3.8,
            "offY": 20.38,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "HW近传1",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
        }`,
          近传递左: `{
            "Name": "HW近传2",
            "type": 1,
            "offX": -5.46,
            "offY": 27.22,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "HW近传2",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
        }`,
          HW远1: `{
            "Name": "HW远2",
            "type": 1,
            "offX": 10.26,
            "offY": 9.88,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "HW远左",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
          }`,
          HW远2: `{
            "Name": "HW远1",
            "type": 1,
            "offX": -9.4,
            "offY": 9.82,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "HW远右",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
          }`,
          远传递左: `{
            "Name": "HW远传2",
            "type": 1,
            "offX": 18.44,
            "offY": 9.82,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "HW远传左",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
          }`,
          远传递右: `{
            "Name": "HW远传1",
            "type": 1,
            "offX": -18.48,
            "offY": 9.82,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "HW远传右",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
          }`,
          手引导1: `{
            "Name": "手引导1",
            "type": 1,
            "offX": 11.02,
            "offY": -5.36,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "引导点1",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
          }`,
          手引导2: `{
            "Name": "手引导2",
            "type": 1,
            "offX": -10.92,
            "offY": -5.36,
            "radius": 1.5,
            "thicc": 5.0,
            "overlayText": "引导点2",
            "refActorNPCID": 12258,
            "refActorComparisonType": 4,
            "includeRotation": true,
            "onlyVisible": true,
            "tether": true
          }`,
        };
        let mark = data.p5二运后半我的标记;
        let namespace = "P5二运后半连线";
        let time = "12000";
        let json = "";
        if (mark === "6") json = p52c.HW近;
        if (mark === "2") json = p52c.近传递右;
        if (mark === "3") json = p52c.近传递左;
        if (mark === "8") json = p52c.手引导1;
        if (mark === "9") json = p52c.手引导2;
        if (data.P5二运后半转手 === "顺时针") {
          if (mark === "0") json = p52c.远传递右;
          if (mark === "1") json = p52c.远传递左;
          if (mark === "5") json = p52c.HW远1;
        }
        if (data.P5二运后半转手 === "逆时针") {
          if (mark === "0") json = p52c.远传递左;
          if (mark === "1") json = p52c.远传递右;
          if (mark === "5") json = p52c.HW远2;
        }
        Splatoon(namespace, time, json);
      },
    },
    {
      //三运初始化

      id: "P5三运科技初始化",
      type: "StartsUsing",
      netRegex: NetRegexes.startsUsing({ id: "8015", capture: false }),
      //alarmText: "三运科技初始化成功！",
      run: (data) => {
        data.P5二运科技初始化 = false;
        data.p5二传前半 = false;
        data.P5二运前半我的标记 = undefined;
        data.p5二运后半 = false;
        data.p5二运后半我的标记 = undefined;
        data.P5二运后半转手 = undefined;
        data.P5二运塔方向 = undefined;
        data.P5二运我的塔 = undefined;
        data.P5三运科技初始化 = true;
        data.p5三运前半开关 = true;
        data.p5三运后半开关 = false;
        data.P5三传我的标记 = [];
        data.P5四传我的标记 = [];
        data.P5三运男女1 = {
          one: {},
          two: {}
      };
      data.P5三运安全点1 = {
          one: {},
          two: {}
      };

      },
    },
    //三运男女组合技
    {
      id: 'P5 三运变身boss 魔改版 原作者：yoyo',
      type: 'Object',
      netRegex: /] ChatLog 00:0:106:(?<sourceId>(?:[^:]*)):(?<sourceName>(?:[^:]*)):0031:.{4}:.{4}0031:/,
      condition: (data) =>  data.P5三运科技初始化,
      run: (data, matches) => {
        let id = parseInt(matches.sourceId, 16);
        if (data.P5变身Boss1 === undefined) data.P5变身Boss1 = [];
        data.P5变身Boss1.push(id);
      },
    },
    {
      id: 'P5 三运男女组合技 魔改版 原作者：yoyo',
      type: 'Object',
      netRegex: /] ChatLog 00:0:106:(?<id>[0-9A-F]{8}):[^:]*(?<sex>F|M):0197:0000:00001E43:/,
      condition: (data) =>  data.P5三运科技初始化 && Object.keys(data.P5三运男女1.two).length < 2,
      preRun: (data, matches) => {
        let id = parseInt(matches.id, 16);
        let count = (Object.keys(data.P5三运男女1.one).length >= 2) ? 'two' : 'one';
        data.P5三运男女1[count][id] = {};
        data.P5三运男女1[count][id].sex = matches.sex;
        data.P5三运男女1[count][id].type = (data.P5变身Boss1.includes(id)) ? 1 : 0;
        if (matches.sex === 'F') {
          //女人
          data.P5三运男女1[count][id].type = (data.P5三运男女1[count][id].type === 0) ? '十字' : '辣翅';
        } else {
          //男人
          data.P5三运男女1[count][id].type = (data.P5三运男女1[count][id].type === 0) ? '钢铁' : '月环';
        }
      },
      promise: async (data) => {
        if (Object.keys(data.P5三运男女1.one).length === 1 || Object.keys(data.P5三运男女1.two).length === 1) return
        var count = (Object.keys(data.P5三运男女1.two).length >= 2) ? 'two' : 'one';

        let list = [Number(Object.keys(data.P5三运男女1[count])[0]), Number(Object.keys(data.P5三运男女1[count])[1])];
        let boss = await callOverlayHandler({
          call: 'getCombatants',
          ids: list
        });
        boss = boss.combatants;
        for (const i of boss) {
          data.P5三运男女1[count][i.ID].pos = [i.PosX, i.PosY];
        }
      },
      alertText: (data) => {
        if (Object.keys(data.P5三运男女1.one).length === 1 || Object.keys(data.P5三运男女1.two).length === 1) return
        var count = (Object.keys(data.P5三运男女1.two).length >= 2) ? 'two' : 'one';

        //确认方位
        for (const i in data.P5三运男女1[count]) {
          let x = Math.round(data.P5三运男女1[count][i].pos[0]);
          let y = Math.round(data.P5三运男女1[count][i].pos[1]);
          if (x === 93 && y === 93) data.P5三运男女1[count][i].位置 = 4;
          if (x === 107 && y === 93) data.P5三运男女1[count][i].位置 = 1;
          if (x === 107 && y === 107) data.P5三运男女1[count][i].位置 = 2;
          if (x === 93 && y === 107) data.P5三运男女1[count][i].位置 = 3;
        }


        //安全点 1男2女
        let type1, type2, pos1, pos2;
        if (data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[0]].sex === 'M') {
          type1 = data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[0]].type;
          type2 = data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[1]].type;
          pos1 = data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[0]].位置;
          pos2 = data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[1]].位置;
        } else {
          type1 = data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[1]].type;
          type2 = data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[0]].type;
          pos1 = data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[1]].位置;
          pos2 = data.P5三运男女1[count][Object.keys(data.P5三运男女1[count])[0]].位置;
        }

        let a = {};
        if (pos1 === 1 && pos2 === 3) {
          if (type1 === '钢铁' && type2 === '十字') {
            a['A'] = '远';
            a['B'] = '远';
          }
          if (type1 === '钢铁' && type2 === '辣翅') {
            a['C'] = '近';
            a['D'] = '近';
          }
          if (type1 === '月环' && type2 === '十字') {
            a['A'] = '中';
            a['B'] = '中';
          }
          if (type1 === '月环' && type2 === '辣翅') {
            a['A'] = '近';
            a['B'] = '近';
          }
        }
        if (pos1 === 3 && pos2 === 1) {
          if (type1 === '钢铁' && type2 === '十字') {
            a['C'] = '远';
            a['D'] = '远';
          }
          if (type1 === '钢铁' && type2 === '辣翅') {
            a['A'] = '近';
            a['B'] = '近';
          }
          if (type1 === '月环' && type2 === '十字') {
            a['C'] = '中';
            a['D'] = '中';
          }
          if (type1 === '月环' && type2 === '辣翅') {
            a['C'] = '近';
            a['D'] = '近';
          }
        }
        if (pos1 === 2 && pos2 === 4) {
          if (type1 === '钢铁' && type2 === '十字') {
            a['B'] = '远';
            a['C'] = '远';
          }
          if (type1 === '钢铁' && type2 === '辣翅') {
            a['A'] = '近';
            a['D'] = '近';
          }
          if (type1 === '月环' && type2 === '十字') {
            a['B'] = '中';
            a['C'] = '中';
          }
          if (type1 === '月环' && type2 === '辣翅') {
            a['B'] = '近';
            a['C'] = '近';
          }
        }
        if (pos1 === 4 && pos2 === 2) {
          if (type1 === '钢铁' && type2 === '十字') {
            a['A'] = '远';
            a['D'] = '远';
          }
          if (type1 === '钢铁' && type2 === '辣翅') {
            a['B'] = '近';
            a['C'] = '近';
          }
          if (type1 === '月环' && type2 === '十字') {
            a['A'] = '中';
            a['D'] = '中';
          }
          if (type1 === '月环' && type2 === '辣翅') {
            a['A'] = '近';
            a['D'] = '近';
          }
        }
        data.P5三运安全点1[count] = a;

        if (count === 'one') {
          return `找 ${Object.keys(data.P5三运安全点1.one)[0]} ${Object.keys(data.P5三运安全点1.one)[1]} 点`
        }
      }
    },
    //7B9C AC安全
    {
      id: 'P5 三运BOSS扇形 tts+鲶鱼精+spl 魔改版 原作者：yoyo',
      type: 'StartsUsing',
      netRegex: {
        id: ['7B9C', '7B9B'],
      },
      condition: (data) =>  data.P5三运科技初始化,
      delaySeconds: 0.2,
      suppressSeconds: 20,
      durationSeconds: 10,
      alertText: (data, matches) => {
        let 第一次 = (matches.id === '7B9C') ? ['A', 'C'] : ['B', 'D'];
        let 第二次 = (matches.id === '7B9B') ? ['A', 'C'] : ['B', 'D'];
        let temp1 = Object.keys(data.P5三运安全点1.one);
        let temp2 = Object.keys(data.P5三运安全点1.two);
        第一次 = 第一次.filter(item => temp1.indexOf(item) > -1);
        第二次 = 第二次.filter(item => temp2.indexOf(item) > -1);

        data.P5三运点位temp1 = [第一次, data.P5三运安全点1.one[第一次], 第二次, data.P5三运安全点1.two[第二次]];
        let re = `先 ${第一次} ${data.P5三运安全点1.one[第一次]}，后 ${第二次} ${data.P5三运安全点1.two[第二次]}`;
        console.log('第一次',第一次,data.P5三运安全点1.one[第一次],'第二次',第二次,data.P5三运安全点1.two[第二次]);
      },
      run: (data) => {
        //画图
        const pos = {
          A远: [100, 84],
          A中: [100, 90],
          A近: [100, 96.5],
          B远: [116, 100],
          B中: [110, 100],
          B近: [103.5, 100],
          C远: [100, 116],
          C中: [100, 110],
          C近: [100, 103.5],
          D远: [84, 100],
          D中: [90, 100],
          D近: [96.5, 100],
        };

        let pos1 = pos[data.P5三运点位temp1[0] + data.P5三运点位temp1[1]];
        let pos2 = pos[data.P5三运点位temp1[2] + data.P5三运点位temp1[3]];

        const json1 = `{
    "Name": "1",
    "refX": ${pos1[0]},
    "refY": ${pos1[1]},
    "refZ": -1.907354E-06,
    "radius": 0.9,
    "color": 4293459712,
    "overlayBGColor": 3355443200,
    "overlayTextColor": 3355508480,
    "overlayVOffset": 1.5,
    "overlayFScale": 2.0,
    "thicc": 5.0,
    "overlayText": ">> 1 <<",
    "includeRotation": true
  }`;
        const json2 = `{
    "Name": "2",
    "refX": ${pos2[0]},
    "refY": ${pos2[1]},
    "refZ": -5.456968E-12,
    "radius": 0.9,
    "color": 4293459712,
    "overlayBGColor": 3355443200,
    "overlayTextColor": 3355479807,
    "overlayVOffset": 1.5,
    "overlayFScale": 2.0,
    "thicc": 5.0,
    "overlayText": ">> 2 <<",
    "includeRotation": true
  }`;
        const json3 = `{
    "Name": "",
    "type": 2,
    "refX": ${pos1[0]},
    "refY": ${pos1[1]},
    "refZ": -5.456968E-12,
    "offX": ${pos2[0]},
    "offY": ${pos2[1]},
    "offZ": -9.536798E-07,
    "radius": 0.0,
    "color": 4293459712,
    "thicc": 5.0
  }`;

        let time = '13000';
        Splatoon('P5三运前半1', time, json1);
        Splatoon('P5三运前半2', time, json2);
        Splatoon('P5三运前半3', time, json3);
        console.log(json1,json2,json3);
      }
    },
    {
      //P5 三传标记检测

      id: "三传标记检测",
      netRegex:
        /^(?<type>29)\|(?<timestamp>[^|]*)\|(?<operation>[^|]*)\|(?<waymark>[^|]*)\|(?<id>[^|]*)\|(?<name>[^|]*)\|(?<targetId>[^|]*)\|(?<targetName>[^|]*)\|/,
      suppressSeconds: 10,
      condition: (data, matches) => {
        return (
          matches.operation === "Add" &&
          data.P5三运科技初始化 &&
          data.p5三运前半开关 &&
          matches.targetName === data.me
        );
      },
      run: (data, matches, output) => {
        //PostNamazu测试(
        //  `/e P5三传标记 ID:${matches.targetName}+标记:${matches.waymark}`
        //),
          console.log("三传标记", matches.targetName, matches.waymark);
        let mark = matches.waymark;
        data.P5三传我的标记 = mark;
        console.log("P5三传我的标记", data.P5三传我的标记);
      },
    },
    {
      //P5 三传站位指引
      id: "P5 三传站位指引",
      type: "StartsUsing",
      netRegex: {
        id: ["7B97", "7B96"],
        capture: true,
      },
      condition: (data) => data.P5三运科技初始化 && data.p5三运前半开关,
      run: (data, matches) => {
        const 左刀小电视 = {
          禁止1:
            '{"Name":"禁止1z","type":1,"offX":-9.24,"offY":-9.26,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"禁止1","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          禁止2:
            '{"Name":"禁止2z","type":1,"offX":-9.24,"offY":9.02,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"禁止2","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          攻击1:
            '{"Name":"攻击1z","type":1,"offX":2.6,"offY":-18.4,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击1","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          攻击2:
            '{"Name":"攻击2z","type":1,"offX":2.66,"offY":18.14,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击2","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          攻击3:
            '{"Name":"攻击3z","type":1,"offX":11.76,"offY":2.88,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击3","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          攻击4:
            '{"Name":"攻击4z","type":1,"offX":17.7,"offY":4.68,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击4","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          锁链1:
            '{"Name":"锁链1z","type":1,"offX":2.6,"offY":-8.7,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"锁链1","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          锁链2:
            '{"Name":"锁链2z","type":1,"offX":17.28,"offY":-5.6,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"锁链2","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
        };
        const 右刀小电视 = {
          禁止1:
            '{"Name":"禁止1y","type":1,"offX":8.96,"offY":9.3,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"禁止1","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          禁止2:
            '{"Name":"禁止2y","type":1,"offX":9.46,"offY":-9.26,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"禁止2","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          攻击1:
            '{"Name":"攻击1y","type":1,"offX":-2.58,"offY":18.08,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击1","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          攻击2:
            '{"Name":"攻击2y","type":1,"offX":-2.4,"offY":-18.34,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击2","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          攻击3:
            '{"Name":"攻击3y","type":1,"offX":-10.66,"offY":-1.76,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击3","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          攻击4:
            '{"Name":"攻击4y","type":1,"offX":-17.44,"offY":-3.7,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击4","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          锁链1:
            '{"Name":"锁链1y","type":1,"offX":-2.14,"offY":8.84,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"锁链1","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
          锁链2:
            '{"Name":"锁链2y","type":1,"offX":-16.88,"offY":6.06,"radius":2.0,"color":4278190335,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"锁链2","refActorNPCID":7636,"FillStep":0.1,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true,"LimitDistance":true,"DistanceSourceX":100.0,"DistanceSourceY":100.0,"DistanceMax":2.0}',
        };
        let P5三运小电视左右 = matches.id === "7B96" ? "右" : "左";
        console.log("P5三运什么刀:", P5三运小电视左右);
        let time = "10000";
        let namespace = "P5三传安全点";
        let json = "";
        let 三传标记 = data.P5三传我的标记;
        console.log("三传指路测试点名", 三传标记);
        if (P5三运小电视左右 === "左") {
          if (三传标记 === "0") json = 左刀小电视.攻击1;
          if (三传标记 === "1") json = 左刀小电视.攻击2;
          if (三传标记 === "2") json = 左刀小电视.攻击3;
          if (三传标记 === "3") json = 左刀小电视.攻击4;
          if (三传标记 === "5") json = 左刀小电视.锁链1;
          if (三传标记 === "6") json = 左刀小电视.锁链2;
          if (三传标记 === "8") json = 左刀小电视.禁止1;
          if (三传标记 === "9") json = 左刀小电视.禁止2;
        }
        if (P5三运小电视左右 === "右") {
          if (三传标记 === "0") json = 右刀小电视.攻击1;
          if (三传标记 === "1") json = 右刀小电视.攻击2;
          if (三传标记 === "2") json = 右刀小电视.攻击3;
          if (三传标记 === "3") json = 右刀小电视.攻击4;
          if (三传标记 === "5") json = 右刀小电视.锁链1;
          if (三传标记 === "6") json = 右刀小电视.锁链2;
          if (三传标记 === "8") json = 右刀小电视.禁止1;
          if (三传标记 === "9") json = 右刀小电视.禁止2;
        }
        Splatoon(namespace, time, json);
        console.log("P5三传我的标记", 三传标记, "指路成功", json);
      },
    },
    {
      //P5 三运后半初始化

      id: "P5 三运后半初始化",
      type: "Ability",
      netRegex: NetRegexes.ability({
        id: "8015",
        capture: false,
      }),
      delaySeconds: 35,
      suppressSeconds: 10,
      run: (data) => {
        data.p5三运前半开关 = false;
        data.p5三运后半开关 = true;
      },
    },
    {
      //P5 四传标记检测

      id: "四传标记检测",
      netRegex:
        /^(?<type>29)\|(?<timestamp>[^|]*)\|(?<operation>[^|]*)\|(?<waymark>[^|]*)\|(?<id>[^|]*)\|(?<name>[^|]*)\|(?<targetId>[^|]*)\|(?<targetName>[^|]*)\|/,
      suppressSeconds: 10,
      condition: (data, matches) => {
        return (
          matches.operation === "Add" &&
          data.P5三运科技初始化 &&
          data.p5三运后半开关 &&
          matches.targetName === data.me
        );
      },
      run: (data, matches, output) => {
        //(
        //  `/e P5四传标记 ID:${matches.targetName}+标记:${matches.waymark}`
        //),
          console.log("四传标记", matches.targetName, matches.waymark);
        let mark = matches.waymark;
        data.P5四传我的标记 = mark;
        console.log("P5四传我的标记", data.P5四传我的标记);
      },
    },
    {
      //四传连线指引

      id: "P5 四传连线指引",
      type: "StartsUsing",
      netRegex: NetRegexes.startsUsing({ id: "7E76", capture: false }),
      condition: (data) => data.P5三运科技初始化 && data.p5三运后半开关,
      delaySeconds: 2,
      run: (data, matches) => {
        const 四传指路 = {
          禁止1:
            '{"Name":"引导连线点1","type":1,"offX":10.42,"offY":4.12,"radius":1.0,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"禁止1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          禁止2:
            '{"Name":"引导连线点2","type":1,"offX":-10.7,"offY":4.42,"radius":1.0,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"禁止2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链1:
            '{"Name":"HW远","type":1,"offX":9.86,"offY":21.68,"radius":1.0,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"锁链1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          锁链2:
            '{"Name":"HW近","type":1,"offX":5.98,"offY":37.24,"radius":1.0,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"锁链2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击1:
            '{"Name":"HW远传1","type":1,"offX":18.9,"offY":21.5,"radius":1.0,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击1","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击2:
            '{"Name":"HW远传2","type":1,"offX":-18.98,"offY":20.54,"radius":1.0,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击2","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击3:
            '{"Name":"HW近传1","type":1,"offX":-2.74,"offY":31.5,"radius":1.0,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击3","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
          攻击4:
            '{"Name":"HW近传2","type":1,"offX":-5.22,"offY":37.66,"radius":1.0,"overlayTextColor":4278255614,"thicc":5.0,"overlayText":"攻击4","refActorNPCID":7695,"refActorComparisonType":4,"includeRotation":true,"onlyVisible":true,"tether":true}',
        };
        let 四传标记 = data.P5四传我的标记;
        let time = "8000";
        let namespace = "P5四传安全点指路";
        let json = "";
        if (四传标记 === "0") json = 四传指路.攻击1;
        if (四传标记 === "1") json = 四传指路.攻击2;
        if (四传标记 === "2") json = 四传指路.攻击3;
        if (四传标记 === "3") json = 四传指路.攻击4;
        if (四传标记 === "5") json = 四传指路.锁链1;
        if (四传标记 === "6") json = 四传指路.锁链2;
        if (四传标记 === "8") json = 四传指路.禁止1;
        if (四传标记 === "9") json = 四传指路.禁止2;
        console.log("四传标记指引测试，我的标记:", 四传标记, "连线成功", json);
        Splatoon(namespace, time, json);
      },
    },
    {
      id: "P5 狂暴科技清除变量",
      type: "StartsUsing",
      netRegex: NetRegexes.startsUsing({ id: "7B87", capture: false }),
      condition: (data) => data.P5三运科技初始化,
      run: (data) => {
        data.P5二运后半转手 = undefined;
        data.P5三运科技初始化 = false;
        data.P5三运男女1 = undefined;
        data.P5三运安全点1 = undefined;
        data.P5变身Boss1 = undefined;
        data.P5三运点位temp1 = undefined;
        
      },
    },
  ],
});
console.log("==========");
console.log("绝欧米茄触发器已经正常加载");
console.log("==========");

