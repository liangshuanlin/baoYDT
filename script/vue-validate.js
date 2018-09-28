/**
 * @description 陌上屿项目表单验证工具整理
 * @author yangjin
 * @time 2017-10-19
 * @requires Vue
 * 
 */
;(function () {
    /*global Vue, define */
    "use strict";
    
    //配置验证规则表
	var ruleList = {
		noempty: {
			type: "nonEmpty"
		},
		tel: {
			type: "reg",
			reg: /^1[34578]\d{9}$/,
			msg: "请输入正确的手机号！"
		},
		pwd: {
			type: "reg",
			reg: /^[\w!@#$%^&*.-_]{6,16}$/,
			msg: "请输入6~16位密码"
		},
		vcode: {
			type: "length",
			test: [6,6]
		}
	};
	
	//获取值
	function getValue(va){
		var val = "";
		if(va.ele.tagName === 'INPUT'){
			val = va.ele.value;
		}else{
			val = va.ele.innerText;
		}
		return val;
	}
	
	// 检测单个规则
	function checkRule(va){
		
		//如果有自定义报错就按自定义报错，没有就格式化报错
		var errMsg = va.msg || ruleList[va.rule].msg || va.ele.getAttribute("placeholder");
	
		var ruleCheckers = {
			nonEmpty: function(value, rule){	//非空检测
				return !$c.isEmpty(value);
			},
			reg: function(value, rule){ //检测正则
				return rule.reg.test(value) ? true : false
			},
			length: function(value, rule){ //检测字符长度
				var length = value.length;
				return ((+length >= rule.test[0]) && (+length <= rule.test[1])) ? true : false
			}
		};
		
		var ruleType = ruleList[va.rule].type;
		var value = getValue(va);
		var ruleChecker = ruleCheckers[ruleType];
		var isPass = ruleChecker(value, ruleList[va.rule]);
		if(!isPass){
			//报错
			$c.toast(errMsg);
		}
		return isPass;
	}
    
    var Verify = function (VueComponent) {
	    this.vm = VueComponent;
	    this.verifyQueue = [];              //验证队列
	    this.check = function() {		//验证
			for (var i = 0; i < vm.$verify.verifyQueue.length; i++) {
				var va = vm.$verify.verifyQueue[i];
				if(!checkRule(va)){
					return false;
				}
			}
			return true;
		}
	};
    
    var init = function () {
	    var self = this;                    //this 指向Vue实例
	    this.$verify = new Verify(self);    //添加vm实例验证属性
	};

	/**
	 * v-verify:tel.canNull="手机号"
	 * arg=tel 用来存字段名; 	modifiers.canNull = true 用来存特殊配置; expression="手机号" 是中文提示名；
	 * 
	 */
    var install = function (Vue, options) {
    	Vue.mixin({
	        beforeCreate: init
	    });
    	
        Vue.directive('verify', {
            bind: function(el, binding, vnode){
            	var vm = vnode.context;		//当前组件实例
//          	var option = binding.modifiers;	//特殊配置（允许非空，编辑新增共用等）
            	//加入验证队列
            	vm.$verify.verifyQueue.push({
            		ele: el,
            		rule: binding.arg,		//验证规则		传给指令的参数
            		msg: binding.expression,//验证提示语	绑定值的字符串形式
            	});
            }
        });
    };
    
    if (typeof exports === "object") module.exports = install;
    else if (typeof define === "function" && define.amd) define([], function () {
        return install;
    });
    else if (window.Vue) Vue.use(install);
})();
