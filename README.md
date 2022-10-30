# underScore

## 1.作用域包裹
使用立即执行函数来包裹库的逻辑代码
- 避免污染全局环境
- 私有保护, 库中所定义的变量,函数除非是主动暴露的api, 否则外部无法获得访问
```js
// 作用域包裹
(function(root) {
    function _() {
        //......
    };
    root._ = _;
})(window);
```



## 2._ 对象

`_`是一个函数对象, underscore的静态 api 都挂载到这个对象上

```js
function _(obj) {
  // 1.若 obj 是 _ 的实例对象
  if(obj instanceof _) return obj;
  // 2.以普通函数的方式调用(_())
  if(!(this instanceof _)) return new _(obj);
  // 3.以构造函数的方式调用(new _())
  this._wrapped = obj;
}
// 一般挂载的都是静态方法
_.xxx = function () {} 
```



## 3.mixin

**将underscore对象上挂载的每一个静态方法全都分别生成一个供underscore实例对象调用的版本, 这个版本的方法中会直接从实例对象的`this._wrapped`中获取源数据, 同时提供了链式调用的功能;**

```js
_.mixin = function(obj) {
  _.each(_.functions(obj), function(fnName) {
    const actualFunc = obj[fnName];
    _.prototype[fnName] = function() {
      const args = [this._wrapped, ...Array.from(arguments)];
      return actualFunc.apply(this, args);
    };
  });
};
_.mixin(_);

// eg: 即等价于使用柯里化处理掉源数据这个入参, 使其在调用时只需要手动传参一次
_.unique(arr, callback) VS _(arr).unique(callback)
```



## 4.链式调用

基本思路: 

- 调用 _().chain() 方法为 underscore 实例对象添加私有属性 `_.chain = true`, 开启链式调用
- 需要结束链式调用时使用`_().value()`

```js
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

_.mixin = function(obj) {
  _.each(_.functions(obj), function(fnName) {
    const actualFunc = obj[fnName];
    _.prototype[fnName] = function() {
      const args = [this._wrapped, ...Array.from(arguments)];
      return result(this, actualFunc.apply(this, args));
    };
  });
};
```

