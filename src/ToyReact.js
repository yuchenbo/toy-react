let childrenSymbol = Symbol("children");
class Wrapper {
    constructor(type) {
        this.type = type;
        this.props = Object.create(null);
        this[childrenSymbol] = [];
        this.children = [];
    }

    get vdom() {
        return this;
    }

    mountTo(range) {
        this.range = range;
        // 解决range 中的节点由于deleteContents造成的startOffset和endOffset位置错乱的问题，加入了一个占位符
        let placeholder = document.createComment("placeHolder");
        let endRange = document.createRange();
        endRange.setStart(range.endContainer, range.endOffset);
        endRange.setEnd(range.endContainer, range.endOffset);
        endRange.insertNode(placeholder);

        // setAttribute的逻辑
        range.deleteContents();
        this.ele = document.createElement(this.type);
        for (let name in this.props) {
            let value = this.props[name];
            if (name.match(/^on([\s\S]+)$/)) {
                let eventName = RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase());
                this.ele.addEventListener(eventName, value);  // 此时传进来value的是一个方法
            }
            if (name === "className") {
                this.ele.setAttribute("class", value);
            }
            this.ele.setAttribute(name, value);
        }

        // appendChild的逻辑
        for (let child of this.children) {
            let range = document.createRange();
            if (this.ele.children.length) {
                range.setStartAfter(this.ele.lastChild);
                range.setEndAfter(this.ele.lastChild);
            } else {
                range.setStart(this.ele, 0);
                range.setEnd(this.ele, 0);
            }
            child.mountTo(range);
        }

        range.insertNode(this.ele);
    }

    setAttribute(name, value) {
      this.props[name] = value;
    }

    appendChild(vchild) {
        this[childrenSymbol].push(vchild) // 存储vchild对象，备着以后用
        this.children.push(vchild.vdom)  // 这里必须精准更新，如果是写成this.children.push(vchild)，那就全局更新了
    }
}

// Component类是用于自定义组件时调用的
export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
    }
    get type() {
        return this.constructor.name;
    }
    mountTo(range) {
        this.range = range;
        this.update();
    }
    update() {
        // 实现diff算法
        let vdom = this.vdom;
        if (this.oldVdom) {
            // 此处应该有三个函数，是否是同一节点isSameNode，是否是同一棵树isSameTree，节点替换更新函数replace
            let isSameNode = (node1, node2) => {
                // 比较元素的类型，属性的个数，属性的值
                if (node1.type !== node2.type) {
                    return false;
                }
                for (let name in node1.props ) {
                    if (typeof node1.props[name] === "object" || typeof node2.props[name] === "object"
                    && JSON.stringify(node1.props[name]) === JSON.stringify(node2.props[name])){
                        continue;
                    }

                    if (node1.props[name] !== node2.props[name]) {
                        return false;
                    }
                }
                if (Object.keys(node1.props).length !== Object.keys(node2.props).length) {
                    return false;
                }
                return true;
            }

            let isSameTree = (node1, node2) => {
                if (!isSameNode(node1, node2)) {
                    return false;
                }
                if (node1.children.length !== node2.children.length) {
                    return false;
                }
                // 如果children有多层的情况下，递归调用本身
                for (let i = 0; i < node1.children.length; i++) {
                    if (!isSameTree(node1.children[i], node2.children[i])) {
                        return false;
                    }
                }
                return true;
            }

            let replace = (newTree, oldTree, indent) => {

                if (isSameTree(newTree, oldTree)) {
                    console.log("all same")
                    return;
                }
                if (!isSameNode(newTree, oldTree)) {
                    console.log("all different")
                    newTree.mountTo(oldTree.range)
                } else {
                    for(let i = 0; i < newTree.children.length; i++) {
                        replace(newTree.children[i], oldTree.children[i], "  " + indent)
                    }
                }
            }

            replace(vdom, this.oldVdom, '')
        } else {
            vdom.mountTo(this.range);  // 此处调用的还是Wrapper处的mountTo
        }
        this.oldVdom = vdom;
    }
    get vdom() {
        return this.render().vdom
    }

    appendChild(vchild) {
        this.children.push(vchild)
    }

    setAttribute(name,value) {
        this[name] = value;
        this.props[name] = value;
    }

    setState(state) {
        let merge = (oldState, newState) => {
            for (let p in newState) {
                if (typeof newState[p] === "object" && newState[p] !== null) {
                    if (typeof oldState[p] !== "object") {
                        if (newState[p] instanceof Array) {
                            oldState[p] = [];
                        } else {
                            oldState[p] = {};
                        }
                    }
                    merge(oldState[p], newState[p])
                } else {
                    oldState[p] = newState[p];
                }
            }
        }

        if (!this.state && state) {
            this.state = {};
        }
        merge(this.state, state);
        this.update(); // setState的再次render的过程
    }
}

class TextWrapper {
    constructor(content) {
        this.content = document.createTextNode(content);
        this.type = "#text";
        this.children = [];
        this.props = Object.create(null);
    }
    mountTo(range) {
        this.range = range;
        range.deleteContents();
        range.insertNode(this.content);
    }
    get vdom() {
        return this;
    }
}

export const ToyReact = {
    /*
        @babel/plugin-transform-react-jsx
        In: const profile = (
              <div>
                <img src="avatar.png" className="profile" />
                <h3>{[user.firstName, user.lastName].join(' ')}</h3>
              </div>
            );
         Out: const profile = React.createElement("div", null,
              React.createElement("img", { src: "avatar.png", className: "profile" }),
              React.createElement("h3", null, [user.firstName, user.lastName].join(" "))
            );
     */
    createElement(type, attributes, ...children) {
        console.log(arguments, 'arguments')
        console.log(type, 'type')
        let element

        if (typeof type === "string") {
            element =  new Wrapper(type);
        }

        if (typeof type === "function") {
            element = new type;
        }

        for (let name in attributes) {
            element.setAttribute(name, attributes[name]);
        }

        console.log(children, 'children')

        let instertChildren = (children) => {
            for (let child of children) {

                if (typeof child === "object" && child instanceof Array) {
                    instertChildren(child);
                } else {
                    // void 0 一定是undefined, undefined有可能会被赋值的，void 是不能被重写的（cannot be overidden）
                    if (child === null || child == void 0) {
                        child = "";
                    }
                    // 看打印出的arguments，就知道要去除多余的子元素对象
                    if (!(child instanceof Component) && !(child instanceof Wrapper) && !(child instanceof TextWrapper)) {
                        child = String(child)
                    }

                    if (typeof child === "string") {
                        child = new TextWrapper(child);
                    }
                    element.appendChild(child);
                }

                console.log(element, 'element')
            }
        }

        instertChildren(children);

        return element;
    },
    render(vdom, parent) {
        // vdom 为createElement函数的返回值，原始值为一组DOM，但是需要在vdom下有mountTo的挂载的方法，那就需要对vdom包装成对象，
        // 即在Wrapper下需要有mountTo的挂载方法
        let range = document.createRange();
        if (parent.children.length) {
            range.setStartAfter(parent.lastChild);
            range.setEndAfter(parent.lastChild);
        } else {
            range.setStart(parent, 0);
            range.setEnd(parent, 0);
        }
        vdom.mountTo(range);
    }
}