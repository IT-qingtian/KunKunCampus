(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/fun_chaoshi/comfirm/index"],{"1a27":function(e,t,r){"use strict";r.d(t,"b",(function(){return o})),r.d(t,"c",(function(){return a})),r.d(t,"a",(function(){return n}));var n={uNotify:function(){return Promise.all([r.e("common/vendor"),r.e("node-modules/uview-ui/components/u-notify/u-notify")]).then(r.bind(null,"8371"))},uniCard:function(){return r.e("uni_modules/uni-card/components/uni-card/uni-card").then(r.bind(null,"7231"))},uIcon:function(){return Promise.all([r.e("common/vendor"),r.e("node-modules/uview-ui/components/u-icon/u-icon")]).then(r.bind(null,"2513"))},uDivider:function(){return Promise.all([r.e("common/vendor"),r.e("node-modules/uview-ui/components/u-divider/u-divider")]).then(r.bind(null,"571c"))},"u-Textarea":function(){return Promise.all([r.e("common/vendor"),r.e("node-modules/uview-ui/components/u--textarea/u--textarea")]).then(r.bind(null,"b067"))}},o=function(){var e=this,t=e.$createElement,r=(e._self._c,e.orderInfo.status?null:e.userInfo.address.length);e._isMounted||(e.e0=function(t){e.orderInfo.take_goods_mode=0},e.e1=function(t){e.orderInfo.take_goods_mode=1}),e.$mp.data=Object.assign({},{$root:{g0:r}})},a=[]},"29a2":function(e,t,r){"use strict";r.r(t);var n=r("1a27"),o=r("9d63");for(var a in o)["default"].indexOf(a)<0&&function(e){r.d(t,e,(function(){return o[e]}))}(a);r("efb9");var u=r("f0c5"),s=Object(u["a"])(o["default"],n["b"],n["c"],!1,null,"350c2d63",null,!1,n["a"],void 0);t["default"]=s.exports},3854:function(e,t,r){"use strict";r.r(t);var n=r("ffe1"),o=r.n(n);for(var a in n)["default"].indexOf(a)<0&&function(e){r.d(t,e,(function(){return n[e]}))}(a);t["default"]=o.a},"5d84":function(e,t,r){"use strict";r.d(t,"b",(function(){return o})),r.d(t,"c",(function(){return a})),r.d(t,"a",(function(){return n}));var n={orderYes:function(){return r.e("components/orderYes/orderYes").then(r.bind(null,"8935"))},orderNo:function(){return r.e("components/orderNo/orderNo").then(r.bind(null,"3823"))}},o=function(){var e=this.$createElement,t=(this._self._c,this.orderList.length);this.$mp.data=Object.assign({},{$root:{g0:t}})},a=[]},"6cd1":function(e,t,r){},9673:function(e,t,r){},9796:function(e,t,r){"use strict";r.r(t);var n=r("5d84"),o=r("3854");for(var a in o)["default"].indexOf(a)<0&&function(e){r.d(t,e,(function(){return o[e]}))}(a);r("c927");var u=r("f0c5"),s=Object(u["a"])(o["default"],n["b"],n["c"],!1,null,"2495c504",null,!1,n["a"],void 0);t["default"]=s.exports},"9d63":function(e,t,r){"use strict";r.r(t);var n=r("bafe"),o=r.n(n);for(var a in n)["default"].indexOf(a)<0&&function(e){r.d(t,e,(function(){return n[e]}))}(a);t["default"]=o.a},bafe:function(e,t,r){"use strict";(function(e){var n=r("4ea4");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var o=n(r("2eee")),a=n(r("c973")),u=n(r("9523")),s=r("26cb"),c=n(r("9796")),i=r("b6a4");function d(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function f(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?d(Object(r),!0).forEach((function(t){(0,u.default)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):d(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var l={name:"index.vue",data:function(){return{payIng:!1,serverAddress:i.serverAddress,orderInfo:{service_fee:0,delivery_fee:0,take_goods_mode:0,shop_id:null,shop_title:"",notes:"",goods:[],address:null,shop_position:""}}},computed:f(f({order:function(){return c.default}},(0,s.mapState)("store_user",["token","userInfo","temp_data"])),{},{checkout:function(){var e=this.orderInfo.goods;return e.reduce((function(e,t){var r=t.price,n=t.number;return Number((e+r*n).toFixed(2))}),0)}}),methods:f(f({},(0,s.mapMutations)("store_user",["update_temp_data"])),{},{select_address:function(){e.navigateTo({url:"/pages/fun_kuaidi_use_user/index"})},pay:function(){var t=this;return(0,a.default)(o.default.mark((function r(){var n,u,s,c,i,d,l,p;return o.default.wrap((function(r){while(1)switch(r.prev=r.next){case 0:if(!t.payIng){r.next=2;break}return r.abrupt("return");case 2:if(t.payIng=!0,t.orderInfo.take_goods_mode||t.userInfo.address.length){r.next=6;break}return t.payIng=!1,r.abrupt("return",t.$refs.uNotify.error("尚未填写地址，请填写地址！"));case 6:return t.orderInfo.address=t.userInfo.address[0],r.next=9,e.$httpRequest({url:"shop/change",method:"post",header:{authorization:"bearer ".concat(t.token)},data:{out_trade_no:t.orderInfo.out_trade_no,take_goods_mode:t.orderInfo.take_goods_mode,address:t.orderInfo.address,notes:t.orderInfo.notes}});case 9:if(n=r.sent,u=n.data,s=u.code,c=u.data,i=u.msg,s){r.next=14;break}return t.payIng=!1,r.abrupt("return",t.$refs.uNotify.error(i));case 14:if(t.orderInfo.out_trade_no=c.out_trade_no,console.log(c,t.orderInfo.out_trade_no),d=t.temp_data.pay,d){r.next=26;break}return r.next=20,e.$httpRequest({url:"orders/orderPay",method:"post",header:{authorization:"bearer ".concat(t.token)},data:{out_trade_no:t.orderInfo.out_trade_no}});case 20:if(l=r.sent,p=l.data,p.code){r.next=25;break}return t.payIng=!1,r.abrupt("return",t.$refs.uNotify.error(p.msg));case 25:d=p.data.payInfo;case 26:e.requestPayment(f(f({provider:"wxpay"},d),{},{success:function(){var r=(0,a.default)(o.default.mark((function r(n){var a,u,s;return o.default.wrap((function(r){while(1)switch(r.prev=r.next){case 0:return console.log("支付成功",n),a={out_trade_no:d.out_trade_no,orderInfo:t.orderInfo},console.log("data:",a),r.next=5,e.$httpRequest({url:"shop/order_query",method:"post",header:{authorization:"bearer "+t.token},data:a});case 5:u=r.sent,s=u.data,e.showModal({content:s.msg,showCancel:!1,success:function(t){t.confirm&&e.switchTab({url:"/pages/index/index"})}}),console.log(s,"ok");case 9:case"end":return r.stop()}}),r)})));return function(e){return r.apply(this,arguments)}}(),fail:function(e){return console.log("支付失败",e),t.$refs.uNotify.error("支付失败啦。")},complete:function(){t.payIng=!1}}));case 27:case"end":return r.stop()}}),r)})))()}}),onLoad:function(t){var r=this;return(0,a.default)(o.default.mark((function n(){var a,u,s,c,i,d,f,l,p,h,_;return o.default.wrap((function(n){while(1)switch(n.prev=n.next){case 0:return a=t.out_trade_no,n.next=3,e.$httpRequest({url:"shop/get_order_status",method:"post",header:{authorization:"bearer "+r.token},data:{out_trade_no:a}});case 3:if(u=n.sent,s=u.data,c=s.code,i=s.msg,d=s.data,c){n.next=10;break}return n.abrupt("return",r.$refs.uNotify.error(i));case 10:if(console.log("查询到的订单数据。",d),f=d.orderInfo,l=f.data,p=f.order_over,h=f.status,_=l.goods,_&&l.shop_title){n.next=15;break}return n.abrupt("return",e.navigateBack());case 15:Object.assign(r.orderInfo,{goods:_,shop_title:l.shop_title,order_over:p,status:h,out_trade_no:a,shop_position:l.shop_position,service_fee:l.service_fee,delivery_fee:l.delivery_fee}),console.log(r.orderInfo);case 17:case"end":return n.stop()}}),n)})))()}};t.default=l}).call(this,r("543d")["default"])},c927:function(e,t,r){"use strict";var n=r("9673"),o=r.n(n);o.a},d028:function(e,t,r){"use strict";(function(e,t){var n=r("4ea4");r("b320");n(r("66fd"));var o=n(r("29a2"));e.__webpack_require_UNI_MP_PLUGIN__=r,t(o.default)}).call(this,r("bc2e")["default"],r("543d")["createPage"])},efb9:function(e,t,r){"use strict";var n=r("6cd1"),o=r.n(n);o.a},ffe1:function(e,t,r){"use strict";(function(e,n){var o=r("4ea4");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0;var a=o(r("2eee")),u=o(r("c973")),s=o(r("9523")),c=r("26cb");function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){(0,s.default)(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var f={data:function(){return{select:0,orderList:[]}},methods:d(d({},(0,c.mapMutations)("store_user",["updateToken"])),{},{select_order:function(t){this.select=t,e.startPullDownRefresh()},getOrderData:function(){var t=this;return(0,u.default)(a.default.mark((function r(){var n,o,u,s,c;return a.default.wrap((function(r){while(1)switch(r.prev=r.next){case 0:return r.next=2,e.$httpRequest({url:"orders/orderGet",method:"post",data:{getType:t.select},header:{Authorization:"Bearer ".concat(t.token)}});case 2:if(n=r.sent,o=n.data,u=o.code,s=o.data,c=o.msg,o.err,e.stopPullDownRefresh(),u){r.next=12;break}return"身份密钥不存在！"===c&&t.updateToken(""),r.abrupt("return",e.$showMsg(c));case 12:t.orderList=s.reverse(),console.log(s,"数据");case 14:case"end":return r.stop()}}),r)})))()},change_max_height:function(){var e=n.createSelectorQuery();n.getSystemInfo().then((function(e){console.log(e)})),e.select(".container").boundingClientRect((function(e){console.log("contianer高度",e.height)})).exec(),e.select(".tab").boundingClientRect((function(e){console.log("tab高度",e.height)})).exec()}}),computed:d({},(0,c.mapState)("store_user",["token"])),mounted:function(){},onPullDownRefresh:function(){console.log("刷新订单"),this.getOrderData()},onLoad:function(){this.change_max_height(),this.getOrderData()},onShow:function(){e.startPullDownRefresh()}};t.default=f}).call(this,r("543d")["default"],r("bc2e")["default"])}},[["d028","common/runtime","common/vendor"]]]);