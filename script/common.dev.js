;
/*------------------------------------常量定义----------------------------------------*/
var DEBUG = true;

/** ajax提交参数默认值 */
var AJAX_PARAMETER = {
	method: 'post',
	cache: true,
	timeout: 30,
	dataType: 'json',
	returnAll: false,
	data: {}
};

/** 交互访问的服务器域名 **/
// var SERVICE_DOMAIN = "http://192.168.0.121:8080/";
var SERVICE_DOMAIN = "http://125.65.108.81:8080/";

/** 默认热线电话配置 **/
var DEFAULT_HOTLINE = "13679135074";

/** 热线电话 **/
var HOTLINE = "hotline";

/** 用户信息 **/
var USER_INFO = "user_info";

/** 弹窗页面名称 **/
var POP_NAME = "popWindow";

/** 弹窗是否打开  **/
var POP_ISOPEN_KEY = "pop_isopen_key";

/** 弹窗按钮点击监听  **/
var POP_ACTION_LISTENER = "pop_action_listener";

/** 弹窗关闭监听 **/
var POP_CLOSE_LISTENER = "pop_close_listener";

/** 登录成功 **/
var LOGIN_SUCCESS_LISTENER = "login_success_listener";

/** 退出登录监听 **/
var LOGIN_QUIT_LISTENER = "login_quit_listener";

/** 订单类型 **/
var ORDER_TYPE = {
	activity: 0,	//活动
	site: 1,		//景点
	specialist: 2,	//专家
};

/** 资讯信息类型 **/
var INFORMATION_TYPE = {
	health: 0,		//健康知识
	travel: 1,		//度假胜景
	finance: 2		//理财投资
}

/*------------------------------------常量定义结束----------------------------------------*/


;(function(window) {
    var s = {};

    /**
     * @brief 初始化win页面
     *
     * @param {Object}	dom	头部标题dom对象
     */
    s.initWin = function(dom) {
        /**
         * @brief 初始化页面监听事件
         *
         */
        function _initEventListener() {
            $api.setStorage(POP_ISOPEN_KEY, "false");
            api.addEventListener({
                name: 'keyback'
            }, function(ret, err) {
                var popIsOpen = $api.getStorage(POP_ISOPEN_KEY);
                if (popIsOpen == "true") {
                    s.closePopWindow();
                } else if ("root" == api.winName || api.winName == 'login_win') {
                    api.toast({
                        msg: "再次点击退出本应用！"
                    });
                    api.addEventListener({
                        name: 'keyback'
                    }, function(ret, err) {
                        api.closeWidget({
                            silent: true
                        });
                    });
                    setTimeout(_initEventListener, 2000);
                } else {
                    api.closeWin();
                }
            });
        };

        function _clearCache() {
            if ("root" == api.winName) {
                api.clearCache(function() {
                    $c.log("清除缓存成功！");
                });
            }
        }

        if (dom) {
            $api.fixStatusBar(dom);
        }
        _initEventListener();
        //		_clearCache();
    };

    /**
     * @brief 打开win页面
     *
     * @param {String}	name	要打开的win名称
     * @param {String}	url		要打开的win路径
     * @param {Object}	other	打开win的其他属性
     */
    s.openWin = function(name, url, other) {
        var data = {
            name: name,
            url: url,
            vScrollBarEnabled: false,
            reload: true,
            pageParam: {
                win: api.winName
            }
        };
        $c.jsonExtend(data, other);
        api.openWin(data);
    };

    /**
     * @brief 关闭win页面
     *
     * @param {String}	name	要关闭的win名称
     */
    s.closeWin = function(name) {
        var data = {};

        if (name) {
            data.name = name;
        }
        api.closeWin(data);
    };

    /**
     * @brief 打开frame
     *
     * @param {String}	name	要打开的frame名称
     * @param {String}	url		要关闭的frame路径
     * @param {Element}	top		上边距来源元素
     * @param {Element}	bottom	下边距来源元素
     * @param {Object}	other	打开frame的其他属性
     */
    s.openFrame = function(name, url, top, bottom, other) {
        var h = 'auto',
            t = 0,
            b = 0;
        if ($api.isElement(top)) {
            t = $api.offset(top).h
        } else {
            t = top;
        }

        if (bottom != 0 && bottom) {
            b = $api.offset(bottom).h
            h = api.winHeight - t - b;
        }
        var data = {
            name: name,
            url: url,
            rect: {
                x: 0,
                y: t,
                w: 'auto',
                h: h
            },
            reload: true,
            bounces: false,
            pageParam: api.pageParam
        };
        $c.jsonExtend(data, other);
        api.openFrame(data);
    };

	/**
	 * 打开frame组
	 *
	 * @param {String} name			frame组名称
	 * @param {Object} frames		frame页面
	 * @param {Integer} top			页面顶部距离
	 * @param {Function} callback	回掉函数
	 * @param {Integer} bottom		页面底部距离
	 * @param {Boolean} scrollEnabled	是否支持滑动翻页
	 */
    s.openFrameGroup = function(name, frames, top, callback, bottom, scrollEnabled) {
        var h = 'auto',
            t = 0,
            b = 0;
        if (top) {
            t = top
        }
        if (bottom != 0 && bottom) {
            b = bottom
            h = api.winHeight - t - b;
        }
        var data = {
            name: name,
            rect: {
                x: 0,
                y: t,
                w: 'auto',
                h: h
            },
            scrollEnabled: scrollEnabled === false ? scrollEnabled : true,
            index: 0,
            preload: 0,
            frames: frames
        };
        api.openFrameGroup(data, function(ret) {
            if (callback) callback(ret);
        });
    };

    /**
     * @brief		json数据追加
     *
     * @param{Object}	dest	目标json
     * @param{Object}	src		追加的json数据
     */
    s.jsonExtend = function(dest, src) {
        for (key in src) {
            if (!$c.isEmpty(dest[key])) {
                if (typeof dest[key] == "object") {
                    $c.jsonExtend(dest[key], src[key]);
                    continue;
                }
            }
            dest[key] = src[key];
        }
    };

    /**
     * @brief		判断是否是空
     * @param{Object}	value	对象
     */
    s.isEmpty = function(value) {
        if (value == null || value == "" || value == "undefined" || value == undefined || value == "null" || value == "(null)" || value == 'NULL' || typeof(value) == 'undefined' || value == 'none') {
            return true;
        } else {
            value = value + "";
            value = value.replace(/\s/g, "");
            if (value == "") {
                return true;
            }
            return false;
        }
    };

    /**
     * 打印日志
     *
     * @param {Object} obj
     */
    s.log = function(str) {
        if (DEBUG) {
            console.log(str);
        }
    };

    /**
     * @brief 打开popwindow
     *
     * @param {String}	name	要打开弹窗页面名称
     * @param {Object}	param	向popwindow页面传递的参数
     */
    s.openPopWindow = function(name, param) {
        $c.openFrame(POP_NAME, "widget://html/" + name + '_pop.html', 0, 0, param);
        $api.setStorage(POP_ISOPEN_KEY, "true");
    };

    /**
     * @brief 关闭popwindow
     *
     */
    s.closePopWindow = function() {
        api.sendEvent({
            name: POP_CLOSE_LISTENER
        });
    };

    /**
     * 格式化时间日期
     *
     * @param {Object} time	要格式化的时间
     * @param {Object} fmt	格式化字符串，如："yyyy-MM-dd hh:mm:ss"
     */
    s.timeStamp2Date = function(time, fmt) {
        if (typeof time === 'string' && time.indexOf("午") > 0) {
            time = time.replace(/(\d{4}).(\d{1,2}).(\d{1,2}).+(.)午(\d{1,2}):(\d{1,2}):(\d{1,2})/mg, function($1,$2,$3,$4,$5,$6,$7,$8){
            	if($5 == "下"){
            		$6 = parseInt($6) + 12;
            	}
            	return $2+"/"+$3+"/"+$4+" "+$6+":"+$7+":"+$8
            });
        }
        if ($c.isEmpty(time)) {
        	var dateStamp = new Date();
        } else{
        	var dateStamp = new Date(time);
        }
        var o = {
            "M+": dateStamp.getMonth() + 1, //月份
            "d+": dateStamp.getDate(), //日
            "h+": dateStamp.getHours(), //小时
            "m+": dateStamp.getMinutes(), //分
            "s+": dateStamp.getSeconds(), //秒
            "q+": Math.floor((dateStamp.getMonth() + 3) / 3), //季度
            "S": dateStamp.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (dateStamp.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    };

	/**
	 * 获取用户信息
	 */
	s.getUserInfo = function(){
		var userInfo = $api.strToJson($api.getStorage(USER_INFO));
		return userInfo;
	};

    /**
     * 打开登录页
     */
    s.openLoginPage = function() {
        $c.openWin("login_win", "widget://html/login_type_win.html");
    };

    /**
     * 调用当前window方法
     *
     * @param {String} sct	方法调用
     */
    s.execWinFun = function(sct) {
        api.execScript({
            name: api.winName,
            script: sct
        });
    };

    /**
     * 调用当前window中，其他frame里的方法
     *
     * @param {String} frmName	frame名称
     * @param {String} sct		方法调用
     */
    s.execFrmFun = function(frmName, sct) {
        api.execScript({
            frameName: frmName,
            script: sct
        });
    };

    /**
     * 屏蔽输入框emoji表情的输入
     *
     * @param {String} val	输入内容
     */
    s.noEmoji = function(val) {
        if ($c.isEmpty(val)) return val;
        var reg = /[^\u0020-\u007E\u00A0-\u00BE\u2E80-\uA4CF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF\u0080-\u009F\u2000-\u201f\u2026\u2022\u20ac\r\n]/g;
        if (val.match(reg)) {
            return val.replace(reg, '');
        } else {
            return val;
        }
    };

    /**
     * 发送监听
     *
     * @param {String} name 监听名称
     * @param {JSON} param	附带参数
     */
    s.sendEvent = function(name, param) {
        api.sendEvent({
            name: name,
            extra: param
        });
    };

    /**
     * 注册监听
     *
     * @param {String} name	监听名称
     * @param {Function} callback		监听回调
     */
    s.addEventListener = function(name, callback) {
        api.addEventListener({
            name: name
        }, callback);
    };

    /**
     * @brief		打开/关闭loading
     * @param {Integer}	state loading状态码[0：打开，-1：关闭]
     * @return
     */
    s.Loading = function(state) {
    	if (typeof api == 'undefined') {
    		return;
    	}
        if (state > -1) {
            api.showProgress({
                style: 'default',
                animationType: 'fade',
                title: '拼命加载中...',
                text: '休息一下吧！',
                modal: true
            });
        } else {
            api.hideProgress();
        }
    };

    /**
     * @brief		获取网络数据
     *
     * @param {Object} json [callback:callback, cache:false, loading_hide:false, values:values,files:files,url:'GoodsMS/moreEvaluateList',full_url:'http://',loading:'../../../image/loading']
     * @return
     *
     */
    s.getHttpData = function(json) {
        //获取ajax请求默认配置
        var data = JSON.parse(JSON.stringify(AJAX_PARAMETER));
        //判断是否存在url，否则启用备用url
        if (!json.hasOwnProperty("url")) {
            api.toast({
                msg: 'url不能为空！'
            });
            return;
        } else {
            data.url = SERVICE_DOMAIN + json.url + ".service";
        }

        if(json.url.indexOf("userimg") > -1){
        	data.url = data.url.substr(0, data.url.length-8);
        }

		//判断是否有上传文件
		if(json.hasOwnProperty("files"))
		{
			data['data']['files'] = json.files;
			data.data.values = $api.jsonToStr(json.values);
		}else if(json.hasOwnProperty("values")){
			data.data.body = $api.jsonToStr(json.values);
		}

		//判断是否配置请求类型
//		if(json.hasOwnProperty("method"))
//		{
//			data['method'] = json.method;
//			//配置GET参数
//			/*if(data['method'] == 'get'){
//				var str = "";
//				for (var p in data.data.values) {
//					var values = data.data.values;
//					str += "&" + p + "=" + encodeURIComponent(values[p]);
//				}
//				if (str != '') {
//					data.url += '?' + str.substring(1);
//				}
//			}*/
//		}

		//判断是否缓存
		if(!json.hasOwnProperty("cache"))
		{
			data.cache = false;
		}

		//是否显示进度条
		if(!json.loading_hide)
		{
			$c.Loading(0);
		}

		_ajax();

		function _ajax(){
			$c.log("ajax_param:" + $api.jsonToStr(data));
			$c.log("ajax_url:" + data['url']);
			//进行ajax请求
			api.ajax(data, function(ret,err){
	        	if (ret)
	        	{
	        		if(typeof ret === "string"){
	        			ret = $api.strToJson(ret);
	        		}
	        		$c.log("ajax_result:" + $api.jsonToStr(ret));
	        		if (ret.rethead.status === "S") {
	        			if(json.hasOwnProperty("callback")){
                            json.callback(ret);
	        			}
				    } else {
				    	$c.toast(ret.rethead.msgarr[0].desc);
			    		$c.Loading(-1);
				    }
			    }else {
			    	$c.log("ajax_err:" + $api.jsonToStr(err));
			    	if(!json.loading_hide){
			    		$c.Loading(-1);
			    	}
			    	if(json.hasOwnProperty("errCallback")){
//			    		var err = {
//			    			status:0,
//			    			errCode:err.code,
//			    			errMsg:err.msg,
//			    		};
						json.errCallback(err);
			    	}else{
			    		if(err.statusCode == 0)
				    	{
							api.toast({msg:"网络异常！"});
				    	}else if(err.statusCode == '404'){
				    		api.toast({msg:"连接服务器失败！"});
				    	}else{
				    		api.toast({msg:err.msg});
				    	}
			    	}
			    }
	       });
		};
	};

	/**
	 * 图片缓存
	 * 使用方法： Vue初始化时 mixins:[$c.cacheImg()];
	 *
	 */
	s.cacheImg = function(){
        var fn = function (el, binding) {
        	el.src = binding.value
//			if(typeof(api) === "undefined")return;
//			api.imageCache({
//	            url: binding.value,
//	            thumbnail: false
//	        }, function(ret, err) {
//	            if(ret.status){
//	                el.src = ret.url
//	            }
//	        });
		};

		return {
			directives: {
    			'cache': fn
    		}
		};
	};

	/**
	 * 获取富文本信息
	 * 使用方法： Vue初始化时 mixins:[$c.getRichData()];
	 *
	 */
	s.getRichData = function(){
		var fn = function (el, binding) {
			if(typeof(api) === "undefined")return;
			api.ajax({
				url: binding.value,
				dataType: "text"
			}, function(ret, err){
				if (ret) {
					//富文本图片路径转换
					ret = ret.replace(/src="\/cms\//g, function(str){
						return 'src="'+SERVICE_DOMAIN+'cms/';
					});
			        el.innerHTML = ret;
			    } else {
			        $c.log("ajax_err: "+JSON.stringify(err));
			    }
			});
		};

		return {
			directives: {
    			'richtext': fn
    		}
		};
	}

	/**
	 * 拼接域名(陌上屿)
	 * 使用方法： Vue初始化时 mixins:[$c.concatDomain()];
	 *
	 * @param {String} url 文件路径
	 */
	s.concatDomain = function(){
		var fn = function(){
			if (arguments[0] && arguments[0].indexOf("http")===0) {
				return arguments[0];
			}
			var str = SERVICE_DOMAIN + "cms";
			for (var i = 0; i < arguments.length; i++) {
				str += "/" + arguments[i];
			}
			return str;
		};

		return {
			methods: {
				concatUrl: fn
			}
		};
	};

	/**
     * 价格最多保留俩位小数，清除小数点后末尾0
     *
     * @param {Object} price
     */
    s.parseFloat = function(price) {
        return price && parseFloat(parseFloat(price).toFixed(2));
    };

    /**
     * 初始化Vue过滤器(公共过滤器)
     *
     * @param{String}	过滤器名称		（"timeFmt", "priceFmt", "weekFmt"）
     */
    s.initFilter = function(){
    	var tmp = {
	    	timeFmt: s.timeStamp2Date,
	    	priceFmt: s.parseFloat,
	    	weekFmt: function(val) {
                val=val.toString();
                $c.log("星期过滤器："+val);
				return val.replace(/\d/g, function(str) {
					return "周" + "一二三四五六日".substr(parseInt(str) -1, 1);
				});
			},
			sexFmt: function(val){
				return ["未知", "男", "女"][val];
			},
			readersFmt: function(val){
				if(val > 10000){
					return (val/10000).toFixed(2) + "万";
				}else{
					return val;
				}
			}
	    };

	    var filters = {};
	    for (var i = 0; i < arguments.length; i++) {
	    	var item = arguments[i]
	    	filters[item] = tmp[item];
	    }

	    return {
	    	filters: filters
	    };
    }

	/**
	 * 下拉刷新
	 *
	 * @param {Object} opt
	 * @param {Object} callback
	 */
	s.setRefreshHeader = function(opt, callback){
		var options = {
		    visible: true,
		    loadingImg: 'widget://image/default_ptr_rotate.png',
		    bgColor: '#efefef',
		    textColor: '#999',
		    textDown: '下拉刷新',
		    textUp: '松开立即刷新',
		    textLoading:'正在努力加载中..',
		    showTime: false
		};
		var refreshCb;
		if(arguments.length == 1){
			if(typeof arguments[0] == 'function'){
				refreshCb = arguments[0];
			}
		}else{
			$c.jsonExtend(options,arguments[0]);
			refreshCb = arguments[1];
		}
		api.setRefreshHeaderInfo(options, function(ret, err) {
			//在这里从服务器加载数据，加载完成后调用api.refreshHeaderLoadDone()方法恢复组件到默认状态
			api.refreshHeaderLoadDone();
			refreshCb();
		});
	};

    /**
     * @brief		设置滚动条滚动到底部监听
     *
     *
     * @param{Integer}	threshold		设置距离底部多少距离时触发，默认值为0
     * @param{Function}	callback(json) 	回调函数
     * @return
     */
    s.setScrollbottom = function(threshold, callback) {
        var mThreshold = 0,
            mCallback;
        if (arguments.length == 1) {
            mCallback = arguments[0];
        } else {
            mThreshold = arguments[0];
            mCallback = arguments[1];
        }
        api.addEventListener({
            name: 'scrolltobottom',
            extra: {
                threshold: mThreshold //设置距离底部多少距离时触发，默认值为0，数字类型
            }
        }, mCallback);
    };

    /**
     * 移除滚动条到底部监听
     *
     */
    s.removeScrollBottom = function() {
        api.removeEventListener({
            name: 'scrolltobottom'
        });
    };

    /**
     * 打开子页面（复用Win页面）
     *
     * @param {String} name		win名称
     * @param {String} title	win页面title
     * @param {String} url		frm页面地址
     * @param {Object} param	页面传参
     */
    s.openSubpage = function(name, title, url, param) {
        var data = {
            pageParam: {
                title: title,
                url: url,
            }
        };
        if (param) {
            s.jsonExtend(param, data);
        } else {
            var param = data;
        }
        s.openWin(name, "widget://html/subpage_win.html", param);
    };

    /**
     * 咨询我们（拨打热线电话）
     *
     */
    s.callHotline = function(){
    	var hotline = $api.strToJson($api.getStorage(HOTLINE));

    	//配置默认热线电话
    	if($c.isEmpty(hotline)){
    		hotline = DEFAULT_HOTLINE;
    	}else{
    		hotline = hotline.p1;
    	}

    	api.call({
		    type: 'tel_prompt',
		    number: hotline
		});
    };

    /**
     * 获取验证码（vue框架）
     *
     * @param {String} tel	手机号
     * @param {Object} event
     */
    s.getVerity = function(tel, event){
    	if(!/^1[34578]\d{9}$/.test(tel)){
			s.toast("请输入正确的手机号！");
			return;
		}
		var el = event.target;
		if (!$api.hasCls(el, "active")) {
			return;
		}
		$c.getSmscode(tel);
		var t = 60;
		$api.removeCls(el, "active");
		$api.text(el, "重新发送(" + t + ")");
		var timer = setInterval(function(){
			t--;
			if (t > 0) {
				$api.text(el, "重新发送(" + t + ")");
			} else{
				clearInterval(timer);
				$api.text(el, "获取验证码");
				$api.addCls(el, "active");
			}
		}, 1000);
	};

	/**
	 * toast提示
	 *
	 * @param {string} msg 提示语
	 */
	s.toast = function(msg){
		if (typeof api === 'undefined') {
			console.warn(msg);return;
		}
		api.toast({msg: msg});
	};

	/**
	 * 初始化上拉加载更多监听(陌上屿)
	 *
	 */
	s.initScrollBottomListener = function(){
		$c.setScrollbottom(function(){
			currentpage++;
			if (currentpage > totalpage) {
				$c.toast("没有更多了！");
				return;
			}
			fnInitData(function(ret){
				$c.Loading(-1);
				for (var i = 0; i < ret.data.length; i++) {
					vm.list.push(ret.data[i]);
				}
			});
		});
	};

	/**
     * 组服务翻页头报文结构
     *
     * @param {Integer: currentpage} 当前页
     * @param {Integer: pagecount}   每页总条数
     * @param {Integer: totalrecord} 总条数
     *
     * @returns object 服务翻页头
     */
    s.getPageHead = function(currentpage, pagecount, totalrecord){
        return {
            currentpage: currentpage || 1,// 当前页
            pagecount: pagecount || 0,// 每页总条数
            totalpage: 0,// 总页数
            totalrecord: totalrecord || 0// 总条数
        };
    };

    /**
     * @brief		json数据提取
     *
     * @param{Object}	dest	目标json
     * @param{Object}	options		提取的键名
     */
    s.jsonExtract = function(dest, options){
    	var ret = {};
    	for (var i = 0; i < options.length; i++) {
    		if(!$c.isEmpty(dest[options[i]])){
    			ret[options[i]] = dest[options[i]];
    		}
    	}
    	return ret;
    };

    /**
     * 微信登录
     *
     */
    s.wxLogin = function(){
    	var wx = api.require('wx');

    	//判断是否安装微信
    	wx.isInstalled(function(ret, err) {
		    if (!ret.installed) {
		        $c.toast('请安装微信客户端');
		        return;
		    }
		    auth();
		});

		//获取登录授权
		var auth = function(){
			wx.auth(function(ret, err) {
			    if (ret.status) {
			        getToken(ret.code);
			    } else {
			        $c.log("微信获取登录授权错误：" + err.code);
			    }
			});
		};

		//获取授权 accessToken
		var getToken = function(code){
			wx.getToken({
			    code: code
			}, function(ret, err) {
			    if (ret.status) {
			        getUserInfo(ret.accessToken, ret.openId);
			    } else {
			        $c.log("微信获取授权Token错误：" + err.code);
			    }
			});
		};

		//获取用户信息
		var getUserInfo = function(accessToken, openId){
			wx.getUserInfo({
			    accessToken: accessToken,
			    openId: openId
			}, function(ret, err) {
			    if (ret.status) {
			        var user = {
			        	wxtoken: ret.unionid,
			        	nickname: ret.nickname,
			        	avatar: ret.headimgurl,
			        	sex: ret.sex
			        }

			        var data = {
			        	url: "app.user.wxlogin",
			        	values: user,
			        	callback: function(ret){
			        		$c.Loading(-1);

			        		if ($c.isEmpty(ret.user)) {
			        			user.uid = ret.uid;
			        		}else{
			        			user = ret.user;
			        		}

			        		//用户信息本地储存
			        		$api.setStorage(USER_INFO, $api.jsonToStr(user));
			        		$c.sendEvent(LOGIN_SUCCESS_LISTENER);
			        		$c.closeWin();
			        	}
			        };
			        $c.getHttpData(data);
			    } else {
			        $c.log("微信获取用户信息错误：" + err.code);
			    }
			});
		}
   	};

   	/**
   	 * 分享
   	 *
   	 * @param {String} title
   	 * @param {String} content
   	 * @param {String} desc
   	 */
   	s.fnWxShare = function(title, content, desc){
   		$c.openPopWindow("share", {
    		bgColor: "rgba(0,0,0,0.3)"
    	});

    	$c.addEventListener(POP_ACTION_LISTENER, function(param){
    		var scene = param.value.scene;
    		if (scene !== 'close') {
    			share(scene);
    		}
    		api.removeEventListener({name: POP_ACTION_LISTENER});
    	});

   		var share = function(index){
   			var scene = ['session', 'timeline'],
   				descStr = "《陌上屿》—以健康度假为中心在高端野奢酒店，为高净值人群提供野奢度假、治疗养生和休闲商务服务，通过移动互联网和智能数据的应用，提升便捷服务、增强社交财富。";

   			if(!$c.isEmpty(desc)){
   				descStr = desc;
   			}

	   		var wx = api.require('wx');
			wx.isInstalled(function(ret, err) {
			    if (ret.installed) {
			        wx.shareWebpage({
					    scene: scene[index],
					    title: title,
					    description: descStr,
					    thumb: 'widget://image/logo.png',
					    contentUrl: SERVICE_DOMAIN + "share/html/" + content
					}, function(ret, err) {
					    if (ret.status) {
					        $c.toast('分享成功');
					    } else {
					        $c.log(err.code);
					    }
					});
			    } else {
			        api.toast({msg:'当前设备未安装微信客户端'});
			    }
			});
   		}
   	};

   	//smsVerify模块是否注册
   	var isRegister = false;
   	/**
   	 * 获取短信验证码
   	 *
   	 * @param {Object} tel
   	 */
   	s.getSmscode = function(tel){
   		if(DEBUG){
   			return;
   		}
   		$c.Loading(0);
   		var smsVerify = api.require('smsVerify');
   		//注册smsVerify
   		var smsRegist = function(){
   			smsVerify.register(function(ret, err){
			    if(ret.status){
			        getCode();
			    }else{
			        $c.log(err.code+' 注册失败');
			    }
			});
   		};
   		//获取短信验证码
   		var getCode = function(){
   			smsVerify.sms({
			    phone: tel
			},function(ret, err){
				$c.Loading(-1);
			    if(ret.status){
			        api.alert({msg: '短信发送成功'});
			    }else{
			        api.alert({msg: err.code+' '+err.msg});
			    }
			});
   		}

   		if(isRegister){
   			getCode();
   		}else{
   			smsRegist();
   		}
   		isRegister = true;
   	};

   	/**
   	 * 校验验证码
   	 *
   	 * @param {String} tel		手机号
   	 * @param {String} vcode	验证码
   	 * @param {Function} callback	回调
   	 */
   	s.smsVerify = function(tel, vcode, callback){
   		if(DEBUG){
   			callback();
   			return;
   		}
   		if(!isRegister){
   			$c.toast("请先获取验证码");
   		}
		$c.Loading(0);
   		var smsVerify = api.require('smsVerify');
		smsVerify.verify({
		    phone: tel,
		    code: vcode
		},function(ret, err){
			$c.log("smsResult: "+JSON.stringify(ret));
		    if(ret.status){
		        callback();
		    }else{
		        api.alert({msg: err.code+' '+err.msg});
		    }
		});
    };

   	/**
   	 * 初始化视频播放组件
   	 *
   	 * @param {dom} video
   	 */
   	s.fnInitVideo = function(video){
   		video.onclick = function(){
    		if(video.getAttribute("controls") === "controls"){
    			video.removeAttribute("controls");
    		}else{
    			video.setAttribute("controls", "controls");
    		}
    		if(video.readyState <4){
        		return;
        	}
            if ( video.paused || video.ended ){
                if ( video.ended ){
                    video.currentTime = 0;
                }
                video.play();
            }else{
                video.pause();
            }
    	}
   	}

    window.$c = s;
})(window);
