class Kvue {
    constructor(options) {
        this.$data = options.data
        this.$options = options
        this.observe(this.$data)
        new Compile(options.el,this)
    }
    observe(data) {
        if (!data || typeof data !== 'object') return
        Object.keys(data).forEach(item => {
            this.defineReactive(data, item, data[item])
            this.proxyData(item)
        })
    }
    defineReactive(data, key, oldVal) {
        this.observe(oldVal)
        // if(typeof oldVal == 'object')return
        const dep = new Dep()
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            set(newVal) {
                if (newVal == oldVal) return
                console.log("set")
                oldVal = newVal
                dep.notify()
            },
            get() {
                Dep.target && dep.addDep(Dep.target)
                console.log("get")
                return oldVal
            }
        })
    }
    proxyData(key){
        Object.defineProperty(this,key,{
            set(newVal) {
                this.$data[key]= newVal
            },
            get() {
                return this.$data[key]
            }
        })
    }

}

class Dep {
    constructor(options) {
        this.deps = []
    }
    addDep(dep) {
        this.deps.push(dep)
    }
    notify() {
        this.deps.forEach(dep => {
            dep.update()
        })
    }
}

class Watcher {
    constructor(vm,key,cb) {
        this.vm = vm
        this.key = key
        this.cb = cb
        Dep.target = this
        this.vm[this.key]
        Dep.target = null
    }
    update() {
        console.log("视图更新啦")
        this.cb.call(this,this.vm[this.key])
    }

}   