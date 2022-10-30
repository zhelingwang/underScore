// 作用域包裹
(function(root) {

    // _ 函数
    function _(obj) {
        // 1.若 obj 是 _ 的实例对象
        if(obj instanceof _) return obj;
        // 2.以普通函数的方式调用(_())
        if(!(this instanceof _)) return new _(obj);
        // 3.以构造函数的方式调用(new _())
        this._wrapped = obj;
    }
    
    // unique
    _.unique = function(arr, callback) {
        const res = [];
        arr.forEach((item, idx)=>{
            const val = callback ? callback(item) : item;
            if(!res.includes(val)) {
                res.push(val);
            }
        });
        return res;
    };

    // 遍历方法
    _.each = function(obj, callback) {
        if(Array.isArray(obj)) {
            obj.forEach((item, idx) => callback.call(obj, item, idx));
        }else {
            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const val = obj[key];
                    callback.call(obj, val, key);
                }
            }
        }
    };
    
    _.functions = function(obj) {
        const res = [];
        for (const key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                res.push(key);
            }
        }
        return res;
    }
    
    // 链式调用
    _.chain = function(res) {
        const instance = _(res);
        instance._chain = true;
        return instance;
    }
    // 链式调用辅助函数
    function result(instance, res) {
        return instance._chain ? _(res).chain() : res;
    }
    // 结束链式调用
    _.prototype.value = function() {
        return this._wrapped;
    }

    // 将 _ 上的静态方法复制一份到 _.prototype 上
    _.mixin = function(obj) {
        _.each(_.functions(obj), function(fnName) {
            const actualFunc = obj[fnName];
            // 与原静态版本的方法相比, 该版本的方法会直接从实例对象中的 _wrapped 属性获取源数据, 因此无需像静态方法调用时那样再显示手动传源数据
            // eg: _.unique(arr, callback) VS _(arr).unique(callback), 其实就是柯里化处理掉源数据这个入参
            _.prototype[fnName] = function() {
                const args = [this._wrapped, ...Array.from(arguments)];
                return result(this, actualFunc.apply(this, args));
            };
        });
    };
    _.mixin(_);

    // 挂载到全局
    root._ = _;
})(this); // this or window

