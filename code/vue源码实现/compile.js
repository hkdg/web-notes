class Compile{
    constructor(el,vm){
        this.$el = document.querySelector(el)
        this.$vm = vm
        if(this.$el){
            this.$fragment = this.node2Fragment(this.$el)
            this.compile(this.$fragment)
            this.$el.appendChild(this.$fragment)
        }
    }

    node2Fragment(el){
        let fragment = document.createDocumentFragment()
        while(el.firstChild){
            fragment.appendChild(el.firstChild)
        }
        return fragment
    }

    compile(el){
        console.log('el',el)
        let childNodes = el.childNodes
        Array.from(childNodes).forEach(node => {
            console.log(node)
            if(this.isElementNode(node)){
                this.compileElement(node)
            }else if(this.isTextNode(node)&&/\{\{(.*)\}\}/.test(node.textContent)){
                this.compileText(node,RegExp.$1)
            }
            if(node.childNodes&&node.childNodes.length){
                this.compile(node)
            }
        });

    }

    isElementNode(node){
        return node.nodeType == 1
    }
    isTextNode(node){
        return node.nodeType == 3
    }
    compileElement(node){
        let attr = node.attributes
        Array.from(attr).forEach(attr=>{
            const attrName = attr.name //v-text @click
            const exp = attr.value 
            if(this.isDirective(attrName)){
                const dir = attrName.substr(2)
                this[dir]&&this[dir](node,this.$vm,exp)
            }else if(this.isEventDirective(attrName)){
                const dir = attrName.substr(1)
                this.eventHandler(node,this.$vm,exp,dir)
            }
        })
    }
    compileText(node,exp){
        this.text(node,this.$vm,exp)
    }
    isDirective(attr){
        return attr.indexOf('k-') == 0
    }
    isEventDirective(attr){
        return attr.indexOf('@') == 0
    }
    eventHandler(node,vm,exp,dir){
        let fn = vm.$options.methods&&vm.$options.methods[exp]
        if(fn){
            node.addEventListener(dir,fn.bind(vm),false)
        }
    }
    model(node,vm,exp){
        this.update(node,vm,exp,'model')
        // console.log('node',node)
        node.addEventListener('input',e=>{
            // console.log(5555)
            vm[exp] = e.target.value
        },false)
    }
    text(node,vm,exp){
        // console.log('text',node)
        this.update(node,vm,exp,'text')
    }
    html(node,vm,exp){
        this.update(node,vm,exp,'html')
    }
    update(node,vm,exp,dir){
        let updateFn = this[dir+"updater"]
        updateFn&&updateFn(node,vm[exp])
        new Watcher(vm,exp,function(value){
            updateFn&&updateFn(node,value)
        })
    }
    textupdater(node,val){
        node.textContent  = val
    }
    htmlupdater(node,val){
        node.innerHTML = val
    }
    modelupdater(node,val){
        node.value = val
    }
}
