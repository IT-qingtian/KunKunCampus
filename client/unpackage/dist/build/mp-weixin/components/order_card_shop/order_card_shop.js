(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["components/order_card_shop/order_card_shop"],{2145:function(e,t,r){"use strict";(function(e){var a=r("4ea4");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var n=a(r("2eee")),o=a(r("c973")),c=a(r("9523")),s=r("26cb"),u=r("b6a4");function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}var d={name:"order_card_shop",props:{data:{}},data:function(){return{order_time:"",serverAddress:u.serverAddress,order_state:"",goods_data:[],goods_data_ls:[],show_all:null}},computed:function(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){(0,c.default)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}({},(0,s.mapState)("store_user",["token"])),methods:{reminder:function(t){var r=this;return(0,o.default)(n.default.mark((function a(){var o,c;return n.default.wrap((function(a){while(1)switch(a.prev=a.next){case 0:return console.log("申请催单"),a.next=3,e.$httpRequest({url:"orders/orderUreg",method:"post",header:{Authorization:"bearer ".concat(r.token)},data:{out_trade_no:t}});case 3:o=a.sent,o.code,c=o.data,o.msg,console.log(c);case 8:case"end":return a.stop()}}),a)})))()},order_pay:function(t){return(0,o.default)(n.default.mark((function r(){return n.default.wrap((function(r){while(1)switch(r.prev=r.next){case 0:e.navigateTo({url:"/pages/fun_chaoshi/comfirm/index?out_trade_no=".concat(t)});case 1:case"end":return r.stop()}}),r)})))()},order_cancel:function(t){var r=this;e.showModal({content:"确定取消订单？",showCancel:!0,success:function(){var a=(0,o.default)(n.default.mark((function a(o){var c,s,u,i;return n.default.wrap((function(a){while(1)switch(a.prev=a.next){case 0:if(o.confirm){a.next=2;break}return a.abrupt("return");case 2:return a.next=4,e.$httpRequest({url:"orders/orderCanel",method:"post",header:{Authorization:"bearer ".concat(r.token)},data:{out_trade_no:t}});case 4:if(c=a.sent,s=c.data,u=s.code,i=s.msg,s.data,u){a.next=11;break}return a.abrupt("return",e.$showMsg(i));case 11:r.$emit("refresh_list");case 12:case"end":return a.stop()}}),a)})));return function(e){return a.apply(this,arguments)}}()})},order_confirm:function(t){return(0,o.default)(n.default.mark((function r(){return n.default.wrap((function(r){while(1)switch(r.prev=r.next){case 0:e.navigateTo({url:"/pages/appraise/index?out_trade_no=".concat(t,"&pass=true")});case 1:case"end":return r.stop()}}),r)})))()},order_appraise:function(t){return(0,o.default)(n.default.mark((function r(){return n.default.wrap((function(r){while(1)switch(r.prev=r.next){case 0:e.navigateTo({url:"/pages/appraise/index?out_trade_no=".concat(t)});case 1:case"end":return r.stop()}}),r)})))()}},created:function(){var e=this;console.log(this.data,"拿到的数据");var t=new Date(this.data.time_pay_order);switch(this.order_time="".concat(t.getFullYear(),"-").concat(t.getMonth()+1,"-").concat(t.getDate()," ").concat(t.getHours(),":").concat(t.getMinutes()),this.data.overStatus){case-1:this.order_state="已退款";break;case 0:this.order_state="等待接单";break;case 1:this.order_state="商家处理中";break;case 2:this.order_state="等待配送中";break;case 3:this.order_state="骑手配送中";break;case 4:if(1===this.data.data.take_goods_mode)this.order_state="请前往店铺自提";else var r=this.data.receving_order_info,a=r.auto_end_order_limited_time,n=r.delivery_info,o=new Date(n.dispatch_time),c="",s=setInterval((function(){var t=new Date,r=o-t+a;if(r>0){var n=Math.floor(r/36e5),u=Math.floor(r%36e5/6e4),i=Math.floor(r%6e4/1e3);c="\n            ".concat(n&&"".concat(n,":")).concat(u&&"".concat(u,":")).concat(i&&"".concat(i),"后自动确认订单"),e.order_state="配送已到达"+c}else e.data.overStatus=5,e.order_state="订单已完结",clearInterval(s)}),1e3);break;case 5:this.order_state="订单已完结";break}var u=this.data.data,i=u.goods;u.take_goods_mode;this.goods_data=i,this.show_all=!(i.length>4)},watch:{show_all:function(e,t){this.goods_data_ls=e?this.goods_data:this.goods_data.slice(0,4)}}};t.default=d}).call(this,r("543d")["default"])},3021:function(e,t,r){},"37ce":function(e,t,r){"use strict";r.r(t);var a=r("2145"),n=r.n(a);for(var o in a)["default"].indexOf(o)<0&&function(e){r.d(t,e,(function(){return a[e]}))}(o);t["default"]=n.a},"6bd2":function(e,t,r){"use strict";r.r(t);var a=r("89a2"),n=r("37ce");for(var o in n)["default"].indexOf(o)<0&&function(e){r.d(t,e,(function(){return n[e]}))}(o);r("a7b2");var c=r("f0c5"),s=Object(c["a"])(n["default"],a["b"],a["c"],!1,null,"4c2ccdec",null,!1,a["a"],void 0);t["default"]=s.exports},"89a2":function(e,t,r){"use strict";r.d(t,"b",(function(){return n})),r.d(t,"c",(function(){return o})),r.d(t,"a",(function(){return a}));var a={uText:function(){return Promise.all([r.e("common/vendor"),r.e("node-modules/uview-ui/components/u-text/u-text")]).then(r.bind(null,"76b3"))}},n=function(){var e=this.$createElement;this._self._c},o=[]},a7b2:function(e,t,r){"use strict";var a=r("3021"),n=r.n(a);n.a}}]);
;(global["webpackJsonp"] = global["webpackJsonp"] || []).push([
    'components/order_card_shop/order_card_shop-create-component',
    {
        'components/order_card_shop/order_card_shop-create-component':(function(module, exports, __webpack_require__){
            __webpack_require__('543d')['createComponent'](__webpack_require__("6bd2"))
        })
    },
    [['components/order_card_shop/order_card_shop-create-component']]
]);